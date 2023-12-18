import { Module } from '@nestjs/common';
import { FilesController } from './files.controller';
import { UploadFileService } from './files.service';
import { PrismaService } from '../prisma.service';
import { ConfigService } from '@nestjs/config';

@Module({
  controllers: [FilesController],
  providers: [PrismaService, ConfigService, UploadFileService],
  exports: [UploadFileService],
})
export class FileUploadModule {}
