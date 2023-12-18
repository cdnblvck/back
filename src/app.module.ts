import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { PropertyModule } from './property/property.module';
import { PrismaService } from './prisma.service';
import { ConfigModule } from '@nestjs/config';
import { FilesController } from './files/files.controller';
import { FileUploadModule } from './files/files-upload.modules';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    UsersModule,
    PropertyModule,
    ConfigModule,
    FileUploadModule,
    AuthModule,
  ],
  controllers: [AppController, FilesController],
  providers: [AppService, PrismaService],
  exports: [PrismaService],
})
export class AppModule {}
