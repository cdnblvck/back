import {
    HttpException,
    HttpStatus,
    Injectable,
    UseGuards,
} from '@nestjs/common';
import {UpdateUserDto} from './dto/update-user.dto';
import {PrismaService} from '../prisma.service';
import {jwtConstants} from '../auth/constants';
import {LocalAuthGuard} from '../auth/guards/local-auth.guard';
import {RegisterUserDto} from "../auth/dto/register-user.dto";

@Injectable()
export class UsersService {
    constructor(private prisma: PrismaService) {
    }

    create(body: RegisterUserDto) {
        const entity = JSON.parse(JSON.stringify(body));
        return this.prisma.user.create({
            data: entity,
        });
    }

    findAll() {
        return `This action returns all users`;
    }

    findUser(email: string) {
        const user = this.prisma.user.findUnique({
            where: {
                email: email,
            },
        });
        if (!user) {
            throw new HttpException(
                {
                    status: HttpStatus.UNPROCESSABLE_ENTITY,
                    errors: {
                        email: 'User with this email does not exist',
                    },
                },
                HttpStatus.NOT_FOUND,
            );
        }
        return user;
    }

    findUserById(id: string) {
        const user = this.prisma.user.findUnique({
            where: {
                id: id,
            },
        });
        if (!user) {
            throw new HttpException(
                'User with this email does not exist',
                HttpStatus.NOT_FOUND,
            );
        }
        return user;
    }

    update(id: number, updateUserDto: UpdateUserDto) {
        return `This action updates a #${id} user`;
    }

    remove(id: number) {
        return `This action removes a #${id} user`;
    }

    async setRefreshToken(refreshToken: string, userId: string) {
        const token = {
            userId: userId,
            token: refreshToken,
            expiredAt: new Date(Date.now() + jwtConstants.REFRESH_TOKEN_EXPIRES_IN),
        };
        await this.prisma.token.create({
            data: token,
        });
    }

    async getUserIfRefreshTokenMatches(refreshToken: string, userId: string) {
        const user = await this.findUserById(userId);

        const userToken = await this.prisma.token.findMany({
            where: {
                token: refreshToken.toString(),
                userId: userId,
            },
        });

        if (userToken) {
            return user;
        }
    }

    addBookmark(body: any) {
        const entity = JSON.parse(JSON.stringify(body));
        return this.prisma.bookmark.create({
            data: entity,
        });
    }
}
