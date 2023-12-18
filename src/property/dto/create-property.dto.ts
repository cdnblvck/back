/*Map of field u want when create Rent */
import {IsBoolean, IsNotEmpty, IsOptional, IsString, MinLength} from "class-validator";

import {Transform} from "class-transformer";

export class CreatePropertyDto {
    @IsNotEmpty()
    @MinLength(2)
    name: string;

    @IsString()
    @IsNotEmpty()
    @MinLength(6)
    description: string;


    @IsString()
    @Transform(({value}) => value ?? '5000')
    price: string;

    @IsString()
    @IsNotEmpty()
    @MinLength(6)
    slug: string;

    @IsString()
    contact: string;

    @IsNotEmpty()
    @IsString()
    street: string;

    @IsString()
    longitude: string;

    @IsString()
    latitude: string;

    @IsString()
    country: string;

    @IsOptional()
    @IsBoolean()
    pmr: boolean;

    @IsNotEmpty()
    @Transform(({value}) => (value ? Number(value) : 3))
    note: number;

    images: string[];
    location: JSON;

    @IsNotEmpty()
    @IsString()
    ownerId: string;
}
