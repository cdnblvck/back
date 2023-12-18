import { Module } from '@nestjs/common';
import { PropertyService } from './property.service';
import { PropertyController } from './property.controller';
import { PrismaService } from '../prisma.service';
import { UploadFileService } from '../files/files.service';
import { ConfigService } from '@nestjs/config';

@Module({
  controllers: [PropertyController],
  providers: [PropertyService, UploadFileService, ConfigService, PrismaService],
})
export class PropertyModule {}
