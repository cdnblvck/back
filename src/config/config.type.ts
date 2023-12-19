import { AppConfig } from './app-config.type';
import { MailConfig } from '../mail/config/mail-config.type';

export type AllConfigType = {
    app: AppConfig;
    mail: MailConfig;
};