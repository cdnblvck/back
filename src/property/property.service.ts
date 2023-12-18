import { HttpException, Injectable } from '@nestjs/common';
import { UpdateRentalDto } from './dto/update-rental.dto';
import { PrismaService } from '../prisma.service';
import { Property } from '@prisma/client';
@Injectable()
export class PropertyService {
  constructor(private prisma: PrismaService) {}

  create(data: any): Promise<Property> {
    return this.prisma.property.create({ data });
  }

  findAll(query: any, page: number) {
    return this.prisma.property.findMany({
      where: query,
      skip: ((page ?? 1) - 1) * 6,
      take: 6,
    });
  }

  findOne(slug: string) {
    return this.prisma.property.findUnique({
      where: {
        slug: slug,
      },
    });
  }

  findNearListing(coordinates: any) {
    try {
      return this.prisma.property.findRaw({
        filter: {
          location: {
            $nearSphere: {
              $geometry: {
                type: 'Point',
                coordinates: coordinates,
              },
              $minDistance: 1000,
            },
          },
        },
        options: {
          limit: 3,
        },
      });
    } catch (e) {
      throw new HttpException('ERROR', 400);
    }
  }

  update(id: string, updateRentalDto: UpdateRentalDto) {
    return this.prisma.property.update({
      where: {
        id: id,
      },
      data: JSON.parse(JSON.stringify(updateRentalDto)),
    });
  }

  remove(id: number) {
    return `This action removes a #${id} rental`;
  }



  countListing(query: any) {
    return this.prisma.property.count({
      where: query,
    });
  }

}
