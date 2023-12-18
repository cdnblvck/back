import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { config } from 'aws-sdk';
import { ConfigService } from '@nestjs/config';
import * as bodyParser from 'body-parser';
//import * as cookieParser from 'cookie-parser';
import helmet from 'helmet';
import {
  ExpressAdapter,
  type NestExpressApplication,
} from '@nestjs/platform-express';
import rateLimit from 'express-rate-limit';
async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(
    AppModule,
    new ExpressAdapter(),
    { cors: true },
  );
  const configService = app.get(ConfigService);
  config.update({
    accessKeyId: configService.get('AWS_ACCESS_KEY'),
    secretAccessKey: configService.get('AWS_SECRET_KEY'),
    region: configService.get('AWS_BUCKET_REGION'),
  });
  app.use(helmet());
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(bodyParser.text({ type: 'text/html' }));
  app.use(bodyParser.json());
  //app.use(cookieParser());
  app.use(
    rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100, // limit each IP to 100 requests per windowMs
    }),
  );

  app.enableCors();
  await app.listen(8080);
}
void bootstrap();
