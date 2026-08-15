export interface SendEmailOptions {
  recipients: string[];
  subject: string;
  html: string;
  senderPrefix?: string;
}

export interface IEmailService {
  sendEmail(options: SendEmailOptions): Promise<boolean>;
}