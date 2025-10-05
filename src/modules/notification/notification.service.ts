import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NotificationTemplateService } from './notification-template.service';
import { SendNotificationDto } from './dto';
import { NotificationChannel } from './entities/notification-template.entity';
import { LoggerService } from '../../common/logger/logger.service';

export interface NotificationPayload {
  title: string;
  message: string;
  user_email?: string;
  user_name?: string;
  image_path?: string;
  image_url?: string;
  metadata?: Record<string, any>;
}

@Injectable()
export class NotificationService {
  constructor(
    private readonly config_service: ConfigService,
    @Inject(forwardRef(() => NotificationTemplateService))
    private readonly template_service: NotificationTemplateService,
    private readonly logger_service: LoggerService
  ) {
    this.logger_service.SetContext('NotificationService');
  }

  async SendEmail(payload: NotificationPayload): Promise<void> {
    try {
      const mail_host = this.config_service.get<string>('MAIL_HOST');
      const mail_user = this.config_service.get<string>('MAIL_USER');
      if (!mail_host || !mail_user) {
        this.logger_service.Warn('Email credentials not configured');
        return;
      }
      this.logger_service.Info('[Email] Sending email', {
        title: payload.title,
        message: payload.message
      });
      this.logger_service.Debug('Email recipient', {
        email: payload.user_email
      });
      // // Implementation with nodemailer:
      // import * as nodemailer from 'nodemailer';
      // import * as fs from 'fs';
      // import * as path from 'path';
      // const transporter = nodemailer.createTransport({
      //   host: this.config_service.get('MAIL_HOST'),
      //   port: this.config_service.get('MAIL_PORT'),
      //   secure: false,
      //   auth: {
      //     user: this.config_service.get('MAIL_USER'),
      //     pass: this.config_service.get('MAIL_PASSWORD')
      //   }
      // });
      // const mail_options: any = {
      //   from: this.config_service.get('MAIL_FROM'),
      //   to: payload.user_email,
      //   subject: payload.title,
      //   html: payload.message
      // };
      // if (payload.image_path) {
      //   const full_path = path.join(process.cwd(), payload.image_path);
      //   if (fs.existsSync(full_path)) {
      //     mail_options.attachments = [{
      //       filename: path.basename(full_path),
      //       path: full_path
      //     }];
      //   }
      // }
      // await transporter.sendMail(mail_options);
    } catch (error) {
      this.logger_service.Error('Failed to send email', error);
    }
  }

  async SendTelegram(payload: NotificationPayload): Promise<void> {
    try {
      const telegram_bot_token =
        this.config_service.get<string>('TELEGRAM_BOT_TOKEN');
      const telegram_chat_id =
        this.config_service.get<string>('TELEGRAM_CHAT_ID');
      if (!telegram_bot_token || !telegram_chat_id) {
        this.logger_service.Warn('Telegram credentials not configured');
        return;
      }
      this.logger_service.Info('[Telegram] Sending notification', {
        title: payload.title,
        message: payload.message
      });
      // // Implementation with fetch:
      // import * as fs from 'fs';
      // import * as path from 'path';
      // import { FormData } from 'undici';
      // if (payload.image_path) {
      //   // Send with photo
      //   const full_path = path.join(process.cwd(), payload.image_path);
      //   if (fs.existsSync(full_path)) {
      //     const form_data = new FormData();
      //     form_data.append('chat_id', telegram_chat_id);
      //     form_data.append(
      //       'caption',
      //       `*${payload.title}*\n\n${payload.message}`
      //     );
      //     form_data.append('parse_mode', 'Markdown');
      //     form_data.append('photo', fs.createReadStream(full_path));
      //     const url = `https://api.telegram.org/bot${telegram_bot_token}/sendPhoto`;
      //     const response = await fetch(url, {
      //       method: 'POST',
      //       body: form_data
      //     });
      //     if (!response.ok) {
      //       throw new Error(`Telegram API error: ${response.statusText}`);
      //     }
      //   }
      // } else {
      //   // Send text only
      //   const url = `https://api.telegram.org/bot${telegram_bot_token}/sendMessage`;
      //   const response = await fetch(url, {
      //     method: 'POST',
      //     headers: { 'Content-Type': 'application/json' },
      //     body: JSON.stringify({
      //       chat_id: telegram_chat_id,
      //       text: `*${payload.title}*\n\n${payload.message}`,
      //       parse_mode: 'Markdown'
      //     })
      //   });
      //   if (!response.ok) {
      //     throw new Error(`Telegram API error: ${response.statusText}`);
      //   }
      // }
    } catch (error) {
      this.logger_service.Error('Failed to send Telegram notification', error);
    }
  }

  async SendDiscord(payload: NotificationPayload): Promise<void> {
    try {
      const discord_webhook_url = this.config_service.get<string>(
        'DISCORD_WEBHOOK_URL'
      );
      if (!discord_webhook_url) {
        this.logger_service.Warn('Discord webhook URL not configured');
        return;
      }
      this.logger_service.Info('[Discord] Sending notification', {
        title: payload.title,
        message: payload.message
      });
      // Implementation with fetch:
      // import * as fs from 'fs';
      // import * as path from 'path';
      // import { FormData } from 'undici';
      // if (payload.image_path) {
      //   // Send with image attachment
      //   const full_path = path.join(process.cwd(), payload.image_path);
      //   if (fs.existsSync(full_path)) {
      //     const form_data = new FormData();
      //     const embed = {
      //       title: payload.title,
      //       description: payload.message,
      //       color: 0x0099ff,
      //       timestamp: new Date().toISOString(),
      //       image: { url: 'attachment://image.png' }
      //     };
      //     form_data.append('payload_json', JSON.stringify({ embeds: [embed] }));
      //     form_data.append('file', fs.createReadStream(full_path), 'image.png');
      //     const response = await fetch(discord_webhook_url, {
      //       method: 'POST',
      //       body: form_data
      //     });
      //     if (!response.ok) {
      //       throw new Error(`Discord API error: ${response.statusText}`);
      //     }
      //   }
      // } else if (payload.image_url) {
      //   // Send with image URL
      //   const response = await fetch(discord_webhook_url, {
      //     method: 'POST',
      //     headers: { 'Content-Type': 'application/json' },
      //     body: JSON.stringify({
      //       embeds: [{
      //         title: payload.title,
      //         description: payload.message,
      //         color: 0x0099ff,
      //         timestamp: new Date().toISOString(),
      //         image: { url: payload.image_url }
      //       }]
      //     })
      //   });
      //   if (!response.ok) {
      //     throw new Error(`Discord API error: ${response.statusText}`);
      //   }
      // } else {
      //   // Send text only
      //   const response = await fetch(discord_webhook_url, {
      //     method: 'POST',
      //     headers: { 'Content-Type': 'application/json' },
      //     body: JSON.stringify({
      //       embeds: [{
      //         title: payload.title,
      //         description: payload.message,
      //         color: 0x0099ff,
      //         timestamp: new Date().toISOString()
      //       }]
      //     })
      //   });
      //   if (!response.ok) {
      //     throw new Error(`Discord API error: ${response.statusText}`);
      //   }
      // }
    } catch (error) {
      this.logger_service.Error('Failed to send Discord notification', error);
    }
  }

  async SendLine(payload: NotificationPayload): Promise<void> {
    try {
      const line_channel_access_token = this.config_service.get<string>(
        'LINE_CHANNEL_ACCESS_TOKEN'
      );
      if (!line_channel_access_token) {
        this.logger_service.Warn('LINE Channel Access Token not configured');
        return;
      }
      this.logger_service.Info('[LINE] Sending notification', {
        title: payload.title,
        message: payload.message
      });
      // // Implementation with fetch:
      // // Note: LINE Messaging API requires user_id to send messages
      // // This is a broadcast or push message implementation
      // // You need to get user_id from webhook events or other sources
      // // For push message to specific user:
      // const response = await fetch('https://api.line.me/v2/bot/message/push', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //     Authorization: `Bearer ${line_channel_access_token}`
      //   },
      //   body: JSON.stringify({
      //     to: 'USER_ID_HERE',
      //     messages: [
      //       {
      //         type: 'text',
      //         text: `${payload.title}\n\n${payload.message}`
      //       }
      //     ]
      //   })
      // });
      // if (!response.ok) {
      //   const error_data = await response.json();
      //   throw new Error(`LINE API error: ${JSON.stringify(error_data)}`);
      // }
      // // For broadcast message to all followers:
      // const response = await fetch(
      //   'https://api.line.me/v2/bot/message/broadcast',
      //   {
      //     method: 'POST',
      //     headers: {
      //       'Content-Type': 'application/json',
      //       Authorization: `Bearer ${line_channel_access_token}`
      //     },
      //     body: JSON.stringify({
      //       messages: [
      //         {
      //           type: 'text',
      //           text: `${payload.title}\n\n${payload.message}`
      //         }
      //       ]
      //     })
      //   }
      // );
      // if (!response.ok) {
      //   const error_data = await response.json();
      //   throw new Error(`LINE API error: ${JSON.stringify(error_data)}`);
      // }
      // // For sending image:
      // if (payload.image_url) {
      //   messages: [
      //     {
      //       type: 'image',
      //       originalContentUrl: payload.image_url,
      //       previewImageUrl: payload.image_url
      //     }
      //   ];
      // }
    } catch (error) {
      this.logger_service.Error('Failed to send LINE notification', error);
    }
  }

  async NotifyAll(payload: NotificationPayload): Promise<void> {
    await Promise.allSettled([
      this.SendEmail(payload),
      this.SendTelegram(payload),
      this.SendDiscord(payload),
      this.SendLine(payload)
    ]);
  }

  async NotifySecurityEvent(
    event_type: string,
    details: Record<string, any>
  ): Promise<void> {
    const payload: NotificationPayload = {
      title: `🔒 Security Alert: ${event_type}`,
      message: this.FormatSecurityMessage(event_type, details),
      metadata: details
    };
    await this.NotifyAll(payload);
  }

  private FormatSecurityMessage(
    event_type: string,
    details: Record<string, any>
  ): string {
    const timezone =
      this.config_service.get<string>('TIMEZONE') || 'Asia/Bangkok';
    const timestamp = new Date().toLocaleString('th-TH', {
      timeZone: timezone
    });
    let message = `**Event:** ${event_type}\n`;
    message += `**Time:** ${timestamp}\n\n`;
    for (const [key, value] of Object.entries(details)) {
      message += `**${key}:** ${value}\n`;
    }
    return message;
  }

  async SendWithTemplate(send_dto: SendNotificationDto): Promise<{
    success: boolean;
    message: string;
    rendered?: { subject: string; body: string };
  }> {
    try {
      const template = await this.template_service.FindByCode(
        send_dto.template_code
      );
      const rendered = this.template_service.RenderTemplate(
        template,
        send_dto.variables
      );
      const payload: NotificationPayload = {
        title: rendered.subject,
        message: rendered.body,
        user_email: send_dto.user_email,
        user_name: send_dto.user_name,
        metadata: send_dto.metadata
      };
      const send_promises: Promise<void>[] = [];
      if (
        template.channels.includes(NotificationChannel.ALL) ||
        template.channels.includes(NotificationChannel.EMAIL)
      ) {
        send_promises.push(this.SendEmail(payload));
      }
      if (
        template.channels.includes(NotificationChannel.ALL) ||
        template.channels.includes(NotificationChannel.TELEGRAM)
      ) {
        send_promises.push(this.SendTelegram(payload));
      }
      if (
        template.channels.includes(NotificationChannel.ALL) ||
        template.channels.includes(NotificationChannel.DISCORD)
      ) {
        send_promises.push(this.SendDiscord(payload));
      }
      if (
        template.channels.includes(NotificationChannel.ALL) ||
        template.channels.includes(NotificationChannel.LINE)
      ) {
        send_promises.push(this.SendLine(payload));
      }
      await Promise.allSettled(send_promises);
      this.logger_service.Info('Sent notification using template', {
        template_code: template.template_code
      });
      return {
        success: true,
        message: 'Notification sent successfully',
        rendered
      };
    } catch (error) {
      this.logger_service.Error(
        'Failed to send notification with template',
        error
      );
      return {
        success: false,
        message: error.message
      };
    }
  }
}
