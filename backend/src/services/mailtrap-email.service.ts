import Nodemailer, { type Transporter } from "nodemailer";
import { MailtrapTransport } from "mailtrap";

import { IEmailService, SendEmailOptions } from "./interfaces/email.service.interface";
import { ColoredLog } from "../config/adapters/colors.adapter";

export class MailtrapService implements IEmailService {
  TOKEN: string;
  transport: Transporter;
  // default sender
  private defaultSender: {
    address: string;
    name: string;
  } = { address: "", name: "" };
  private readonly emailDomain: string;

  constructor({
    MAILTRAP_API_TOKEN,
    PROD,
    TEST_INBOX_ID,
    EMAIL_DOMAIN,
  }: {
    MAILTRAP_API_TOKEN: string;
    PROD: boolean;
    TEST_INBOX_ID: number;
    EMAIL_DOMAIN: string;
  }) {
    this.TOKEN = MAILTRAP_API_TOKEN;
    if (PROD) {
      this.transport = Nodemailer.createTransport(
        MailtrapTransport({
          token: this.TOKEN,
        }),
      );
    } else {
      this.transport = Nodemailer.createTransport(
        MailtrapTransport({
          token: this.TOKEN,
          sandbox: true,
          testInboxId: TEST_INBOX_ID,
        }),
      );
    }
    this.emailDomain = EMAIL_DOMAIN;
    this.defaultSender.address = `noreply@${EMAIL_DOMAIN}`;
    this.defaultSender.name = `Coinlog`;
  }

  sendEmail = async (options: SendEmailOptions): Promise<boolean> => {
    try {
      const fromEmail = options.senderPrefix
        ? `${options.senderPrefix}@${this.emailDomain}`
        : this.defaultSender.address;

      
      const result: { success: boolean; message_ids: string[] } =
        await this.transport.sendMail({
          from: {
            address: fromEmail,
            name: this.defaultSender.name,
          },
          to: options.recipients,
          subject: options.subject,
          html: options.html,
        });
      // console.log(result);
      return result.success;
    } catch (error) {
      ColoredLog.error("EMAIL NOT SENT");
      console.log(error);
    }
  };
}
