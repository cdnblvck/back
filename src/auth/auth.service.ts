import {HttpException, HttpStatus, Injectable} from '@nestjs/common';
import {UsersService} from '../users/users.service';
import {JwtService} from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import {jwtConstants} from './constants';
import {PrismaService} from '../prisma.service';
import {RegisterUserDto} from './dto/register-user.dto';
import {User, UserStatus} from '@prisma/client'
import {MailService} from "../mail/mail.service";
import {ConfigService} from "@nestjs/config";
import {AllConfigType} from "../config/config.type";

@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
        private jwtService: JwtService,
        private mailService: MailService,
        private configService: ConfigService<AllConfigType>,
        private prisma: PrismaService,
    ) {
    }

    async validateUser(username: string, password: string): Promise<any> {
        try {
            const user = await this.usersService.findUser(username);
            const hash = await bcrypt.compare(password, user.password)//await this.comparePassword(password, 'text');
            if (!hash) {
                throw new HttpException(
                    'Username or password is incorrect',
                    HttpStatus.BAD_REQUEST,
                );
            }
            return user;
        } catch (e) {
            throw new HttpException('Wrong credentials', HttpStatus.BAD_REQUEST);
        }
    }

    async signIn(username: string, hashedPassword: string): Promise<any> {
        try {
            const user = await this.usersService.findUser(username);
            const isPasswordMatching = await bcrypt.compare(
                hashedPassword,
                user.password,
            );
            if (!isPasswordMatching) {
                throw new HttpException('Wrong credentials', HttpStatus.BAD_REQUEST);
            }
            const {accessToken, refreshToken} = await this.generateToken(user);

            return {
                accessToken,
                tokenType: jwtConstants.ACCESS_TOKEN_TYPE,
                accessTokenExpiresIn: jwtConstants.ACCESS_TOKEN_EXPIRES_IN,
                refreshToken,
                refreshTokenExpiresIn: jwtConstants.REFRESH_TOKEN_EXPIRES_IN,
            };
        } catch (e) {
            throw new HttpException(e, HttpStatus.BAD_REQUEST);
        }
    }

    /**
     * Register user with email and some user info
     */
    async register(registerBody: RegisterUserDto): Promise<any> {
        const hash = await bcrypt.hash(registerBody.password, 10)//this.createPasswordHash(registerBody.password);
        try {
            const createdUser = await this.usersService.create({
                ...registerBody,
                password: hash,
                status: UserStatus.INACTIVE,
            });
            delete createdUser.password;
            return createdUser;
        } catch (error) {
            if (error) {
                throw new HttpException(error, HttpStatus.BAD_REQUEST);
            }
            throw new HttpException(
                'Something went wrong',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    public getCookieWithJwtAccessToken(userId: number) {
        const payload = {userId};
        const token = this.jwtService.sign(payload, {
            secret: jwtConstants.secret,
            expiresIn: `${jwtConstants.ACCESS_TOKEN_EXPIRES_IN}s`,
        });
        return `Authentication=${token}; HttpOnly; Path=/; Max-Age=${jwtConstants.ACCESS_TOKEN_EXPIRES_IN}`;
    }

    public getCookieWithJwtRefreshToken(userId: number) {
        const payload = {userId};
        const token = this.jwtService.sign(payload, {
            secret: jwtConstants.secret,
            expiresIn: `${jwtConstants.REFRESH_TOKEN_EXPIRES_IN}s`,
        });
        const cookie = `Refresh=${token}; HttpOnly; Path=/; Max-Age=${jwtConstants.REFRESH_TOKEN_EXPIRES_IN}`;
        return {
            cookie,
            token,
        };
    }

    public async generateToken(user: Partial<User>) {
        const payload = {
            sub: user.id,
            username: user.surname,
            status: user.status,
        };

        const accessToken = await this.jwtService.signAsync(payload);
        const refreshToken = crypto.randomUUID();
        const token = {
            userId: user.id,
            token: refreshToken,
            expiredAt: new Date(Date.now() + jwtConstants.REFRESH_TOKEN_EXPIRES_IN),
        };
        await this.prisma.token.create({
            data: token,
        });

        return {accessToken, refreshToken};
    }

    public async forgotPassword(email: string) {
        const user = this.usersService.findUser(email)
        if (!user) {
            throw new HttpException(
                {
                    status: HttpStatus.UNPROCESSABLE_ENTITY,
                    errors: {
                        email: 'emailNotExists',
                    },
                },
                HttpStatus.UNPROCESSABLE_ENTITY,
            );
        }
        const hash = await this.jwtService.signAsync(
            {
                forgotUserId: user,
            },
            {
                secret: jwtConstants.ACCESS_TOKEN_ALGORITHM,
                expiresIn: jwtConstants.ACCESS_TOKEN_EXPIRES_IN,
            },
        );
        await this.mailService.forgotPassword({
            to: email,
            data: {
                hash,
            },
        });
    }
}
