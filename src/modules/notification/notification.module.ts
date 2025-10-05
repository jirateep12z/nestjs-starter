import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationService } from './notification.service';
import { NotificationTemplateService } from './notification-template.service';
import { NotificationTemplateController } from './notification-template.controller';
import { NotificationTemplate } from './entities/notification-template.entity';

@Module({
  imports: [TypeOrmModule.forFeature([NotificationTemplate])],
  controllers: [NotificationTemplateController],
  providers: [NotificationService, NotificationTemplateService],
  exports: [NotificationService, NotificationTemplateService]
})
export class NotificationModule {}
