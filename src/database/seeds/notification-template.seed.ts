import { Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';
import {
  NotificationTemplate,
  NotificationChannel,
  TemplateCategory
} from '../../modules/notification/entities/notification-template.entity';

const logger = new Logger('NotificationTemplateSeeder');

export async function SeedNotificationTemplates(
  data_source: DataSource
): Promise<void> {
  const template_repository = data_source.getRepository(NotificationTemplate);
  const templates = [
    {
      template_code: 'WELCOME_EMAIL',
      template_name: 'Welcome Email',
      description: 'Template สำหรับส่งอีเมลต้อนรับผู้ใช้ใหม่',
      category: TemplateCategory.USER,
      channels: [NotificationChannel.EMAIL],
      subject: 'ยินดีต้อนรับสู่ {{app_name}}!',
      body_template: `สวัสดีคุณ {{user_name}},

ยินดีต้อนรับสู่ {{app_name}}! บัญชีของคุณได้ถูกสร้างเรียบร้อยแล้ว

รายละเอียดบัญชี:
- อีเมล: {{user_email}}
- วันที่สร้างบัญชี: {{created_date}}

คุณสามารถเข้าสู่ระบบได้ที่: {{login_url}}

ขอบคุณที่ใช้บริการของเรา!

ทีมงาน {{app_name}}`,
      variables: [
        'app_name',
        'user_name',
        'user_email',
        'created_date',
        'login_url'
      ],
      default_values: {
        app_name: 'NestJS Starter',
        login_url: 'http://localhost:3000/api/v1/auth/login'
      },
      is_active: true,
      priority: 10
    },
    {
      template_code: 'PASSWORD_RESET',
      template_name: 'Password Reset Request',
      description: 'Template สำหรับการรีเซ็ตรหัสผ่าน',
      category: TemplateCategory.SECURITY,
      channels: [NotificationChannel.EMAIL],
      subject: 'คำขอรีเซ็ตรหัสผ่าน - {{app_name}}',
      body_template: `สวัสดีคุณ {{user_name}},

เราได้รับคำขอรีเซ็ตรหัสผ่านสำหรับบัญชีของคุณ

กรุณาคลิกลิงก์ด้านล่างเพื่อรีเซ็ตรหัสผ่าน:
{{reset_link}}

ลิงก์นี้จะหมดอายุใน {{expiry_time}} นาที

หากคุณไม่ได้ทำการขอรีเซ็ตรหัสผ่าน กรุณาเพิกเฉยอีเมลนี้

ทีมงาน {{app_name}}`,
      variables: ['app_name', 'user_name', 'reset_link', 'expiry_time'],
      default_values: {
        app_name: 'NestJS Starter',
        expiry_time: '15'
      },
      is_active: true,
      priority: 20
    },
    {
      template_code: 'EMAIL_VERIFICATION',
      template_name: 'Email Verification',
      description: 'Template สำหรับการยืนยันอีเมล',
      category: TemplateCategory.SECURITY,
      channels: [NotificationChannel.EMAIL],
      subject: 'ยืนยันอีเมลของคุณ - {{app_name}}',
      body_template: `สวัสดีคุณ {{user_name}},

ขอบคุณที่สมัครใช้งาน {{app_name}}!

กรุณาคลิกลิงก์ด้านล่างเพื่อยืนยันอีเมลของคุณ:
{{verification_link}}

ลิงก์นี้จะหมดอายุใน {{expiry_time}} ชั่วโมง

หากคุณไม่ได้สมัครใช้งาน กรุณาเพิกเฉยอีเมลนี้

ทีมงาน {{app_name}}`,
      variables: ['app_name', 'user_name', 'verification_link', 'expiry_time'],
      default_values: {
        app_name: 'NestJS Starter',
        expiry_time: '24'
      },
      is_active: true,
      priority: 20
    },
    {
      template_code: 'SECURITY_ALERT',
      template_name: 'Security Alert Notification',
      description: 'Template สำหรับแจ้งเตือนเหตุการณ์ด้านความปลอดภัย',
      category: TemplateCategory.SECURITY,
      channels: [
        NotificationChannel.EMAIL,
        NotificationChannel.TELEGRAM,
        NotificationChannel.DISCORD
      ],
      subject: '🔒 แจ้งเตือนความปลอดภัย: {{event_type}}',
      body_template: `**แจ้งเตือนความปลอดภัย**

**เหตุการณ์:** {{event_type}}
**ผู้ใช้:** {{user_name}} ({{user_email}})
**เวลา:** {{timestamp}}
**IP Address:** {{ip_address}}
**อุปกรณ์:** {{device_info}}

**รายละเอียด:**
{{event_details}}

หากนี่ไม่ใช่คุณ กรุณาเปลี่ยนรหัสผ่านทันที

ทีมงาน {{app_name}}`,
      variables: [
        'app_name',
        'event_type',
        'user_name',
        'user_email',
        'timestamp',
        'ip_address',
        'device_info',
        'event_details'
      ],
      default_values: {
        app_name: 'NestJS Starter'
      },
      is_active: true,
      priority: 30
    },
    {
      template_code: 'TWO_FACTOR_ENABLED',
      template_name: 'Two-Factor Authentication Enabled',
      description: 'Template สำหรับแจ้งเตือนการเปิดใช้งาน 2FA',
      category: TemplateCategory.SECURITY,
      channels: [NotificationChannel.EMAIL],
      subject: 'การยืนยันตัวตนแบบสองขั้นตอนถูกเปิดใช้งาน - {{app_name}}',
      body_template: `สวัสดีคุณ {{user_name}},

การยืนยันตัวตนแบบสองขั้นตอน (2FA) ได้ถูกเปิดใช้งานสำหรับบัญชีของคุณแล้ว

**รายละเอียด:**
- เวลา: {{timestamp}}
- IP Address: {{ip_address}}
- อุปกรณ์: {{device_info}}

บัญชีของคุณมีความปลอดภัยมากขึ้นแล้ว!

หากคุณไม่ได้ทำการเปิดใช้งาน 2FA กรุณาติดต่อทีมงานทันที

ทีมงาน {{app_name}}`,
      variables: [
        'app_name',
        'user_name',
        'timestamp',
        'ip_address',
        'device_info'
      ],
      default_values: {
        app_name: 'NestJS Starter'
      },
      is_active: true,
      priority: 15
    },
    {
      template_code: 'NEW_LOGIN_DETECTED',
      template_name: 'New Login Detected',
      description: 'Template สำหรับแจ้งเตือนการเข้าสู่ระบบใหม่',
      category: TemplateCategory.SECURITY,
      channels: [NotificationChannel.EMAIL],
      subject: 'ตรวจพบการเข้าสู่ระบบใหม่ - {{app_name}}',
      body_template: `สวัสดีคุณ {{user_name}},

เราตรวจพบการเข้าสู่ระบบใหม่ในบัญชีของคุณ

**รายละเอียด:**
- เวลา: {{timestamp}}
- IP Address: {{ip_address}}
- ตำแหน่ง: {{location}}
- อุปกรณ์: {{device_info}}
- เบราว์เซอร์: {{browser}}

หากนี่เป็นคุณ ไม่จำเป็นต้องดำเนินการใดๆ

หากนี่ไม่ใช่คุณ กรุณาเปลี่ยนรหัสผ่านทันที

ทีมงาน {{app_name}}`,
      variables: [
        'app_name',
        'user_name',
        'timestamp',
        'ip_address',
        'location',
        'device_info',
        'browser'
      ],
      default_values: {
        app_name: 'NestJS Starter',
        location: 'Unknown'
      },
      is_active: true,
      priority: 15
    },
    {
      template_code: 'SYSTEM_MAINTENANCE',
      template_name: 'System Maintenance Notification',
      description: 'Template สำหรับแจ้งเตือนการบำรุงรักษาระบบ',
      category: TemplateCategory.SYSTEM,
      channels: [
        NotificationChannel.EMAIL,
        NotificationChannel.TELEGRAM,
        NotificationChannel.DISCORD
      ],
      subject: '🔧 แจ้งการบำรุงรักษาระบบ - {{app_name}}',
      body_template: `เรียนผู้ใช้งานทุกท่าน,

ระบบจะมีการบำรุงรักษาตามกำหนดการดังนี้:

**วันที่:** {{maintenance_date}}
**เวลา:** {{start_time}} - {{end_time}}
**ระยะเวลา:** {{duration}} ชั่วโมง

**รายละเอียด:**
{{maintenance_details}}

**ผลกระทบ:**
{{impact_description}}

ขออภัยในความไม่สะดวก

ทีมงาน {{app_name}}`,
      variables: [
        'app_name',
        'maintenance_date',
        'start_time',
        'end_time',
        'duration',
        'maintenance_details',
        'impact_description'
      ],
      default_values: {
        app_name: 'NestJS Starter'
      },
      is_active: true,
      priority: 10
    },
    {
      template_code: 'ACCOUNT_LOCKED',
      template_name: 'Account Locked Notification',
      description: 'Template สำหรับแจ้งเตือนบัญชีถูกล็อค',
      category: TemplateCategory.SECURITY,
      channels: [NotificationChannel.EMAIL],
      subject: '🔒 บัญชีของคุณถูกล็อค - {{app_name}}',
      body_template: `สวัสดีคุณ {{user_name}},

บัญชีของคุณถูกล็อคชั่วคราวเนื่องจาก: {{lock_reason}}

**รายละเอียด:**
- เวลา: {{timestamp}}
- IP Address: {{ip_address}}
- จำนวนครั้งที่พยายามเข้าสู่ระบบ: {{failed_attempts}}

**การปลดล็อค:**
{{unlock_instructions}}

หากคุณต้องการความช่วยเหลือ กรุณาติดต่อทีมงาน

ทีมงาน {{app_name}}`,
      variables: [
        'app_name',
        'user_name',
        'lock_reason',
        'timestamp',
        'ip_address',
        'failed_attempts',
        'unlock_instructions'
      ],
      default_values: {
        app_name: 'NestJS Starter',
        unlock_instructions:
          'บัญชีจะถูกปลดล็อคอัตโนมัติใน 30 นาที หรือติดต่อทีมงานเพื่อปลดล็อคทันที'
      },
      is_active: true,
      priority: 25
    },
    {
      template_code: 'PROMOTIONAL_EMAIL',
      template_name: 'Promotional Email Template',
      description: 'Template สำหรับอีเมลโปรโมชั่น',
      category: TemplateCategory.MARKETING,
      channels: [NotificationChannel.EMAIL],
      subject: '🎉 {{promotion_title}} - {{app_name}}',
      body_template: `สวัสดีคุณ {{user_name}},

{{promotion_message}}

**รายละเอียดโปรโมชั่น:**
{{promotion_details}}

**ระยะเวลา:** {{start_date}} - {{end_date}}

**วิธีการใช้งาน:**
{{usage_instructions}}

อย่าพลาดโอกาสดีๆ นี้!

ทีมงาน {{app_name}}`,
      variables: [
        'app_name',
        'user_name',
        'promotion_title',
        'promotion_message',
        'promotion_details',
        'start_date',
        'end_date',
        'usage_instructions'
      ],
      default_values: {
        app_name: 'NestJS Starter'
      },
      is_active: true,
      priority: 5
    },
    {
      template_code: 'TRANSACTION_SUCCESS',
      template_name: 'Transaction Success Notification',
      description: 'Template สำหรับแจ้งเตือนธุรกรรมสำเร็จ',
      category: TemplateCategory.TRANSACTION,
      channels: [NotificationChannel.EMAIL, NotificationChannel.TELEGRAM],
      subject: '✅ ธุรกรรมสำเร็จ - {{app_name}}',
      body_template: `สวัสดีคุณ {{user_name}},

ธุรกรรมของคุณเสร็จสมบูรณ์แล้ว

**รายละเอียดธุรกรรม:**
- หมายเลขอ้างอิง: {{transaction_id}}
- ประเภท: {{transaction_type}}
- จำนวนเงิน: {{amount}} {{currency}}
- วันที่: {{transaction_date}}
- สถานะ: {{status}}

**รายละเอียดเพิ่มเติม:**
{{transaction_details}}

ขอบคุณที่ใช้บริการ!

ทีมงาน {{app_name}}`,
      variables: [
        'app_name',
        'user_name',
        'transaction_id',
        'transaction_type',
        'amount',
        'currency',
        'transaction_date',
        'status',
        'transaction_details'
      ],
      default_values: {
        app_name: 'NestJS Starter',
        currency: 'THB',
        status: 'Success'
      },
      is_active: true,
      priority: 15
    }
  ];
  for (const template_data of templates) {
    const existing_template = await template_repository.findOne({
      where: { template_code: template_data.template_code }
    });
    if (!existing_template) {
      const template = template_repository.create(template_data);
      await template_repository.save(template);
      logger.log(`✓ Created template: ${template_data.template_code}`);
    } else {
      logger.log(`- Template already exists: ${template_data.template_code}`);
    }
  }
  logger.log('✓ Notification templates seeded successfully');
}
