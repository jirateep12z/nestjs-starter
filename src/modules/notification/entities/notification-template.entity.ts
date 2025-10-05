import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index
} from 'typeorm';

export enum NotificationChannel {
  EMAIL = 'email',
  TELEGRAM = 'telegram',
  DISCORD = 'discord',
  LINE = 'line',
  ALL = 'all'
}

export enum TemplateCategory {
  SECURITY = 'security',
  SYSTEM = 'system',
  USER = 'user',
  MARKETING = 'marketing',
  TRANSACTION = 'transaction',
  OTHER = 'other'
}

@Entity('notification_templates')
@Index(['template_code'], { unique: true })
@Index(['category'])
@Index(['is_active'])
export class NotificationTemplate {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100, unique: true })
  template_code: string;

  @Column({ type: 'varchar', length: 255 })
  template_name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({
    type: 'enum',
    enum: TemplateCategory,
    default: TemplateCategory.OTHER
  })
  category: TemplateCategory;

  @Column({
    type: 'simple-array',
    default: NotificationChannel.ALL
  })
  channels: NotificationChannel[];

  @Column({ type: 'varchar', length: 500 })
  subject: string;

  @Column({ type: 'text' })
  body_template: string;

  @Column({ type: 'simple-json', nullable: true })
  variables: string[];

  @Column({ type: 'simple-json', nullable: true })
  default_values: Record<string, any>;

  @Column({ type: 'simple-json', nullable: true })
  metadata: Record<string, any>;

  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  @Column({ type: 'int', default: 0 })
  priority: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
