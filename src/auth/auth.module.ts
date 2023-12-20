import {Module} from '@nestjs/common';
import {PassportModule} from '@nestjs/passport';
import {AuthController} from './auth.controller';
import {AuthService} from './auth.service';
import {UsersModule} from '../users/users.module';
import {jwtConstants} from './constants';
import {JwtModule} from '@nestjs/jwt';
import {LocalStrategy} from './strategy/local.strategy';
import {UsersService} from '../users/users.service';
import {PrismaService} from '../prisma.service';
import {JwtStrategy} from './strategy/jwt.strategy';
import {JwtRefreshTokenStrategy} from './strategy/jwt-refresh-token.strategy';
import {SessionModule} from "../session/session.module";

@Module({
    imports: [
        PassportModule,
        UsersModule,
        SessionModule,
        JwtModule.register({
            global: true,
            secret: jwtConstants.secret,
            signOptions: {expiresIn: '3600s'},
        }),
    ],
    controllers: [AuthController],
    providers: [
        AuthService,
        LocalStrategy,
        UsersService,
        PrismaService,
        JwtStrategy,
        JwtRefreshTokenStrategy,
    ],
    exports: [AuthService],
})
export class AuthModule {
}
