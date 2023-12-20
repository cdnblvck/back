import {Injectable} from '@nestjs/common';
// {Session} from './entities/session.entity';
import {NullableType} from '../utils/types/nullable.type';
import {User, Session} from '@prisma/client';
import {PrismaService} from "../prisma.service";

@Injectable()
export class SessionService {
    constructor(private prisma: PrismaService) {
    }

    async findOne(options: any): Promise<NullableType<Session>> {
        return this.prisma.session.findUnique({
            where: {
                id: options.where,
            }
        });
    }

    async findMany(options: any): Promise<Session[]> {
        return this.prisma.session.findMany();
    }

    createSession(data: any) {
        return this.prisma.session.create({data: data});
    }

}