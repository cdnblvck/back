import { PartialType } from '@nestjs/mapped-types';
import { CreatePropertyDto } from './create-property.dto';

export class UpdateRentalDto extends PartialType(CreatePropertyDto) {}
