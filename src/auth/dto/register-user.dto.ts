import {IsEmail, IsNotEmpty, MinLength, Validate} from 'class-validator';
import {UserStatus} from "@prisma/client";

export class RegisterUserDto {
    @IsEmail()
    email: string;

    @MinLength(6)
    password: string;

    @IsNotEmpty()
    name: string;

    @IsNotEmpty()
    surname: string;

    @IsNotEmpty()
    status: UserStatus;
}
