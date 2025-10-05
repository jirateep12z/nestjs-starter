import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SessionService } from './session.service';
import { SessionController } from './session.controller';
import { SessionScheduler } from './session.scheduler';
import { Session } from './entities/session.entity';
import { User } from '../user/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Session, User])],
  controllers: [SessionController],
  providers: [SessionService, SessionScheduler],
  exports: [SessionService]
})
export class SessionModule {}
