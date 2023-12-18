import {
    Body,
    Controller,
    Delete,
    Get,
    HttpException,
    Param,
    Patch,
    Post,
    Put,
    Query,
    Req,
    UploadedFile,
    UploadedFiles,
    UseGuards,
    UseInterceptors,
} from '@nestjs/common';
import {PropertyService} from './property.service';
import {UpdateRentalDto} from './dto/update-rental.dto';
import {
    Property as PropertyModel
} from '@prisma/client';
import {CreatePropertyDto} from './dto/create-property.dto';
import {FilesInterceptor} from '@nestjs/platform-express';
import {UploadFileService} from '../files/files.service';
import generateSlug from '../utils/generateSlug';
import generateUuid from '../utils/generateUuid';
import {AuthGuard} from '../auth/guards/auth.guard';

export interface IListingParam {
    page?: string;
    guest?: number;
    roomCount?: string | number;
    bathroomCount?: number;
    startDate?: string;
    endDate?: string;
    city?: string;
    priceMin?: string;
    priceMax?: string;
    category?: string;
}

export interface IListing {
    result?: PropertyModel;
    nears?: any;
}

@Controller('property')
export class PropertyController {
    constructor(
        private readonly rentalService: PropertyService,
        private readonly uploadFileService: UploadFileService,
    ) {
    }

    @Post()
    @UseGuards(AuthGuard)
    @UseInterceptors(FilesInterceptor('files'))
    async create(
        @UploadedFiles() files: Array<Express.Multer.File>,
        @Body() body: any,
        @Req() req: Request,
    ) {
        if ((body.name && body.name.trim().length <= 0) || !body.name) {
            throw new HttpException('BAD_REQUEST_MISSING_NAME', 404);
        }
        if (
            (body.description && body.description.trim().length <= 0) ||
            !body.description
        ) {
            throw new HttpException('BAD_REQUEST_MISSING_DESCRIPTION', 404);
        }
        if ((body.price && Number(body.price) === 0) || !body.price) {
            throw new HttpException('BAD_REQUEST_MISSING_PRICE', 404);
        }

        const images = [];

        if (files?.length > 0) {
            for (const file of files) {
                const f = await this.uploadFileService.uploadFile(
                    file.buffer,
                    file.originalname,
                );
                images.push(f);
            }
        }

        const location = body.location
            ? body.location
            : {
                street: body.street,
                coordinate: [body.longitude, body.latitude],
                type: 'Point',
                country: "Côte d'ivoire",
                longitude: body.longitude,
                latitude: body.latitude,
            };

        //@ts-ignore
        body.userId = req?.user.userId;
        body.bedrooms = Number(body.bedrooms);
        body.squareFootage = Number(body.squareFootage);
        body.bathrooms = Number(body.bathrooms);
        body.price = Number(body.price);
        body.location = location;
        body.piece =Number(body.piece)
        body.slug = generateSlug(body.name) + '-' + generateUuid();
        //body.location.coordinates[0] = Number(location.coordinates[0]);
        // body.location.coordinates[1] = Number(location.coordinates[1]);
        body.images = images.map((image) => image.key);
        body.amenities = body.amenities.split(',');
        //body.contact = body.contact.split(',');
        //body.tags = body.tags.split(',');
        //body.services = body.services?.split(',');
        //body.pmr = body.pmr == 'true';


        return this.rentalService.create(body);
    }

    @Get()
    async findAll(
        @Query() query: IListingParam,
        @Query('page') page?: number,
        @Query('skip') skip?: number,
    ): Promise<any> {
        console.log(query);
        const {
            roomCount,
            guest,
            bathroomCount,
            city,
            category,
            priceMin,
            priceMax,
        } = query;
        const filter: any = {};

        if (priceMin) {
            filter.price = {
                gte: Number(priceMin),
            };
        }
        if (priceMax !== undefined) {
            if (filter['price']) {
                filter['price']['lte'] = Number(priceMax);
            } else {
                filter['price'] = {
                    lte: Number(priceMax),
                };
            }
        }
        if (category) {
            filter.tags = {
                has: category,
            };
        }

        if (roomCount) {
            filter.roomCount = {
                gte: +roomCount,
            };
        }

        if (guest) {
            filter.capacite = {
                gte: +guest,
            };
        }

        if (bathroomCount) {
            filter.bathroomCount = {
                gte: +bathroomCount,
            };
        }

        if (city) {
            filter.street = {
                contains: city,
                mode: 'insensitive',
            };
        }
        console.log(filter);
        /*
        if (startDate && endDate) {
          filter.NOT = {
            reservations: {
              some: {
                OR: [
                  {
                    endDate: { gte: startDate },
                    startDate: { lte: startDate },
                  },
                  {
                    startDate: { lte: endDate },
                    endDate: { gte: endDate },
                  },
                ],
              },
            },
          };
        }*/
        let result = await this.rentalService.findAll(filter, page);
        let count = await this.rentalService.countListing(filter);
        if (count === 0) {
            result = await this.rentalService.findAll({}, page);
            count = await this.rentalService.countListing({});
        }
        return {
            count: count,
            results: result,
        };
    }

    @Get(':slug')
    async findOne(@Param('slug') slug: string): Promise<IListing> {
        const result = await this.rentalService.findOne(slug);
        if (!result) {
            throw new HttpException('NOT_FOUND', 400);
        }

        /* const nearPlaces = await this.rentalService.findNearListing(
          JSON.parse(JSON.stringify(result.location)).coordinates.map((i: string) =>
            Number(i),
          ),
        );*/
        return {
            result: result,
        };
    }

    @Get('city/:name')
    async countCityPlace(@Param('name') name: string): Promise<number> {
        const result = await this.rentalService.countListing({
            street: {
                contains: name,
                mode: 'insensitive',
            },
        });
        if (!result) {
            throw new HttpException('NOT_FOUND', 400);
        }

        return result;
    }

    @Patch(':id')
    @UseInterceptors(FilesInterceptor('files'))
    async patchListing(
        @UploadedFiles() files: Array<Express.Multer.File>,
        @Param('id') id: string,
        @Body() updateRentalDto: any,
    ) {
        try {
            const record = await this.rentalService.findOne(id);
            if (!record) {
                throw new HttpException('NOT_FOUND', 400);
            }

            const images = [];
            if (files?.length > 0) {
                for (const file of files) {
                    const f = await this.uploadFileService.uploadFile(
                        file.buffer,
                        file.originalname,
                    );
                    images.push(f);
                }
            }
            if (images.length > 0) {
                updateRentalDto.images = record.images.concat(
                    images.map((image) => image.fileUrl),
                );
            }
            return this.rentalService.update(id, updateRentalDto);
        } catch (e) {
            throw new HttpException('ERROR', 400);
        }
    }

    @Put(':id')
    updateListing(
        @Param('id') id: string,
        @Body() updateRentalDto: UpdateRentalDto,
    ) {
        return this.rentalService.update(id, updateRentalDto);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.rentalService.remove(+id);
    }

    @Post('/add/room/:id')
    @UseInterceptors(FilesInterceptor('files'))
    async createListingRoom(
        @UploadedFiles() files: Array<Express.Multer.File>,
        @Param('id') id: string,
        @Body() createRoomDto: any,
    ) {
        try {
            const records = await this.rentalService.findOne(id);
            if (!records) {
                throw new HttpException('NOT_FOUND', 400);
            }
            const images = [];
            if (files?.length > 0) {
                for (const file of files) {
                    const f = await this.uploadFileService.uploadFile(
                        file.buffer,
                        file.originalname,
                    );
                    images.push(f);
                }
            }
            createRoomDto.superficie = Number(createRoomDto.superficie);
            if (images.length > 0) {
                createRoomDto.images = images.map((image) => image.key);
            }
            createRoomDto.pmr = createRoomDto.pmr == 'true';
            createRoomDto.capacite = Number(createRoomDto.capacite);
            createRoomDto.amenities = createRoomDto.amenities.split(',');
            createRoomDto.services = createRoomDto.services?.split(',');
            createRoomDto.propertyId = id.toString();

        } catch (e) {
            throw new HttpException('ERROR', 400);
        }
    }
}
