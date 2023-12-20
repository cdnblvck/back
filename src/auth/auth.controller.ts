import {
    Body,
    Controller,
    Get,
    HttpCode,
    HttpException,
    HttpStatus,
    Post,
    Res,
    Request,
    UseGuards,
    Req,
} from '@nestjs/common';
import {AuthService} from './auth.service';
import {AuthDto} from './dto/auth.dto';
import {AuthGuard} from './guards/auth.guard';
import {LocalAuthGuard} from './guards/local-auth.guard';
import {JwtAuthGuard} from './guards/jwt-auth.guard';
import {UsersService} from '../users/users.service';
import JwtRefreshGuard from './guards/jwt-refresh.guard';
import {jwtConstants} from './constants';
import {RegisterUserDto} from './dto/register-user.dto';
import {User} from "@prisma/client";
import {AuthForgotPasswordDto} from "./dto/auth-forgot-password.dto";

@Controller({
    path: 'auth',
    version: '1',
})
export class AuthController {
    constructor(
        private authService: AuthService
    ) {
    }

    @HttpCode(HttpStatus.OK)
    @UseGuards(LocalAuthGuard)
    @Post('login')
    async login(@Request() req) {
        const {user} = req;
        const accessTokenCookie = this.authService.getCookieWithJwtAccessToken(
            user.id,
        );
        const {cookie: refreshTokenCookie, token: refreshToken} =
            this.authService.getCookieWithJwtRefreshToken(user.id);

        req.res.setHeader('Set-Cookie', [accessTokenCookie, refreshTokenCookie]);
        req.res.cookie('access_token', accessTokenCookie, {
            httpOnly: true,
            secure: true,
            maxAge: jwtConstants.ACCESS_TOKEN_EXPIRES_IN,
        });

        req.res.cookie('refresh_token', refreshTokenCookie, {
            httpOnly: true,
            secure: true,
            path: '/refresh',
            maxAge: jwtConstants.REFRESH_TOKEN_EXPIRES_IN,
        });
        delete user.salt;
        delete user.password;
        return {
            user,
            accessTokenCookie,
            refreshTokenCookie,
            tokenType: jwtConstants.ACCESS_TOKEN_TYPE,
            accessTokenExpiresIn: jwtConstants.ACCESS_TOKEN_EXPIRES_IN,
            refreshToken,
            refreshTokenExpiresIn: jwtConstants.REFRESH_TOKEN_EXPIRES_IN,
        };
    }

    @HttpCode(HttpStatus.OK)
    @UseGuards(LocalAuthGuard)
    @Post('signin')
    signIn(@Res() res, @Body() signInDto: AuthDto) {
        try {
            const {email, password} = signInDto;
            if (!email) {
                throw new HttpException(
                    'Missing_required_parameters',
                    HttpStatus.BAD_REQUEST,
                );
            }

            if (!password) {
                throw new HttpException(
                    'Missing_required_parameters',
                    HttpStatus.BAD_REQUEST,
                );
            }
            return this.authService.signIn(email, password);
        } catch (error) {
            return res.status(error.status).json(error.response);
        }
    }


    @HttpCode(HttpStatus.OK)
    @Post('register')
    register(@Body() createUserDto: RegisterUserDto): Promise<void> {
        return this.authService.register(createUserDto);
    }

    @HttpCode(HttpStatus.OK)
    @UseGuards(JwtRefreshGuard)
    @Get('refresh')
    refreshToken(@Req() request: any) {
        const accessTokenCookie = this.authService.getCookieWithJwtAccessToken(
            request.user.id,
        );

        request.res.setHeader('Set-Cookie', accessTokenCookie);
        return request.user;
    }

    @UseGuards(AuthGuard)
    @Get('profile')
    @HttpCode(HttpStatus.OK)
    getProfile(@Request() req): Promise<Partial<User>> {
        return req.user;
    }
    @Post('forgot/password')
    @HttpCode(HttpStatus.NO_CONTENT)
    async forgotPassword(
        @Body() forgotPasswordDto: AuthForgotPasswordDto,
    ): Promise<void> {
        return this.authService.forgotPassword(forgotPasswordDto.email);
    }
    @Post('reset/password')
    @HttpCode(HttpStatus.NO_CONTENT)
    resetPassword(@Body() resetPasswordDto: any): Promise<void> {
        return this.authService.resetPassword(
            resetPasswordDto.hash,
            resetPasswordDto.password,
        );
    }
}
