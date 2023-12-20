import {User} from '@prisma/client';

export class Session {
    id: number;
    user: User;
    createdAt: Date;
    deletedAt: Date;
}