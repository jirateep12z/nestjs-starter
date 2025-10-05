import { Logger } from '@nestjs/common';
import { SeedRbac } from './rbac.seed';
import { SeedNotificationTemplates } from './notification-template.seed';
import data_source from '../../../src/config/database/data-source';

const logger = new Logger('DatabaseSeeder');

async function RunSeeds() {
  try {
    logger.log('🌱 Starting database seeding...');
    await data_source.initialize();
    logger.log('📦 Database connected');
    await SeedRbac(data_source);
    await SeedNotificationTemplates(data_source);
    await data_source.destroy();
    logger.log('✅ All seeds completed successfully!');
    process.exit(0);
  } catch (error) {
    logger.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

RunSeeds();
