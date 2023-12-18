import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { ConfigService } from '@nestjs/config';
import { S3 } from 'aws-sdk';

@Injectable()
export class UploadFileService {
  constructor(
    private prismaService: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  async uploadFile(dataBuffer: Buffer, fileName: string): Promise<any> {
    try {
      const s3 = new S3();
      const uploadResult = await s3
        .upload({
          Bucket: this.configService.get('AWS_BUCKET_NAME'),
          Body: dataBuffer,
          Key: `${fileName}`,
        })
        .promise();

      return {
        fileName: fileName,
        fileUrl: uploadResult.Location,
        key: uploadResult.Key,
      };
    } catch (err) {
      return { key: 'Error', url: err.message };
    }
  }

  async deleteFile(fileKeyValue: string): Promise<any> {
    const s3 = new S3();
    await s3
      .deleteObject({
        Bucket: this.configService.get('AWS_BUCKET_NAME'),
        Key: fileKeyValue,
      })
      .promise();
  }
}
