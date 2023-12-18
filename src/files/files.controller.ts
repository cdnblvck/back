import {
  Controller,
  Post,
  Delete,
  UploadedFile,
  UseInterceptors,
  Param,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Express } from 'express';
import { UploadFileService } from './files.service';

@Controller('files')
export class FilesController {
  constructor(private uploadFileService: UploadFileService) {}

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file: Express.Multer.File): Promise<any> {
    const uploadedFile = await this.uploadFileService.uploadFile(
      file.buffer,
      file.originalname,
    );
    return uploadedFile;
  }

  @Delete(':key')
  async deleteFile(@Param('key') key: string): Promise<any> {
    return this.uploadFileService.deleteFile(key);
  }
}
