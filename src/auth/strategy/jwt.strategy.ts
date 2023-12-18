import {ExtractJwt, Strategy} from 'passport-jwt';
import {PassportStrategy} from '@nestjs/passport';
import {Request} from 'express';
import {Injectable, UnauthorizedException} from '@nestjs/common';
import {jwtConstants} from '../constants';
import {UsersService} from '../../users/users.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(private readonly userService: UsersService) {
        super({
            jwtFromRequest: ExtractJwt.fromExtractors([
                (request: Request) => {
                    return request?.cookies?.Authentication;
                },
            ]),
            ignoreExpiration: false,
            secretOrKey: jwtConstants.secret,
        });
    }

    async validate(payload: any) {
        if (!payload.id) {
            throw new UnauthorizedException();
        }
        return this.userService.findUserById(payload.userId);
    }
}
