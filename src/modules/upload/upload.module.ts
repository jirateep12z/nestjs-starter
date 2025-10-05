import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UploadController } from './upload.controller';
import { UploadService } from './upload.service';
import { File } from './entities/file.entity';

@Module({
  imports: [TypeOrmModule.forFeature([File])],
  controllers: [UploadController],
  providers: [UploadService],
  exports: [UploadService]
})
export class UploadModule {}
