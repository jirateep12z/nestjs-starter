import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  FastifyAdapter,
  NestFastifyApplication
} from '@nestjs/platform-fastify';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { apiReference } from '@scalar/nestjs-api-reference';
import helmet from '@fastify/helmet';
import compress from '@fastify/compress';
import multipart from '@fastify/multipart';
import { join } from 'path';
import { AppModule } from './app.module';
import { ClusterManager } from './cluster';

async function Bootstrap() {
  // Logger
  const logger = new Logger('Bootstrap');

  // Nest Factory
  const fastify_adapter = new FastifyAdapter({
    logger: false,
    trustProxy: true,
    requestIdLogLabel: 'reqId',
    disableRequestLogging: true,
    ignoreTrailingSlash: true,
    caseSensitive: false,
    connectionTimeout: 120000,
    keepAliveTimeout: 72000,
    maxParamLength: 500,
    bodyLimit: 104857600,
    requestIdHeader: 'x-request-id',
    genReqId: () => {
      return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
    }
  });

  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    fastify_adapter
  );

  // Config Service
  const config_service = app.get(ConfigService);

  // Global Prefix
  const api_prefix = config_service.get<string>('app.api_prefix') || 'api/v1';
  app.setGlobalPrefix(api_prefix);

  // Static Assets
  await app.register(require('@fastify/static'), {
    root: join(__dirname, '..', 'public'),
    prefix: '/',
    maxAge: 86400000,
    immutable: true,
    serveDotFiles: false,
    lastModified: true,
    etag: true
  });

  // CORS
  await app.register(require('@fastify/cors'), {
    origin: true,
    credentials: true
  });

  // Security Headers
  await app.register(helmet as any, {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: [`'self'`],
        styleSrc: [`'self'`, `'unsafe-inline'`],
        imgSrc: [`'self'`, 'data:', 'nestjs.com'],
        scriptSrc: [`'self'`, `https: 'unsafe-inline'`]
      }
    }
  });

  // Compression with Brotli, Gzip, and Deflate
  await app.register(compress as any, {
    global: true,
    threshold: 1024,
    encodings: ['br', 'gzip', 'deflate'],
    brotliOptions: {
      params: {
        [require('zlib').constants.BROTLI_PARAM_MODE]:
          require('zlib').constants.BROTLI_MODE_TEXT,
        [require('zlib').constants.BROTLI_PARAM_QUALITY]: 4
      }
    },
    zlibOptions: {
      level: 6
    }
  });

  // Multipart (File Upload)
  await app.register(multipart as any, {
    attachFieldsToBody: false,
    limits: {
      fieldNameSize: 100,
      fieldSize: 1048576,
      fields: 10,
      fileSize: config_service.get<number>('upload.max_file_size') || 10485760,
      files: 10,
      headerPairs: 2000,
      parts: 1000
    }
  });

  // Rate Limiting
  const redis_enabled = config_service.get<boolean>('redis.enabled');
  const rate_limit_config: any = {
    max: config_service.get<number>('security.rate_limit_max') || 100,
    timeWindow:
      (config_service.get<number>('security.rate_limit_ttl') || 60) * 1000,
    cache: 10000,
    allowList: ['127.0.0.1'],
    skipOnError: true
  };
  if (redis_enabled) {
    const redis_host = config_service.get<string>('redis.host') || 'localhost';
    const redis_port = config_service.get<number>('redis.port') || 6379;
    const redis_password = config_service.get<string>('redis.password');
    const redis_db = config_service.get<number>('redis.rate_limit_db') || 2;
    const Redis = require('ioredis');
    rate_limit_config.redis = new Redis({
      host: redis_host,
      port: redis_port,
      password: redis_password || undefined,
      db: redis_db,
      connectTimeout: 500,
      maxRetriesPerRequest: 1
    });
    logger.log('✅ Redis configured for rate limiting');
  }
  await app.register(require('@fastify/rate-limit'), rate_limit_config);

  // Validation Pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true
      }
    })
  );

  // Scalar Documentation
  if (config_service.get<boolean>('scalar.enabled')) {
    const scalar_config = new DocumentBuilder()
      .setTitle(config_service.get<string>('scalar.title') || 'NestJS API')
      .setDescription(
        config_service.get<string>('scalar.description') || 'API Documentation'
      )
      .setVersion(config_service.get<string>('scalar.version') || '1.0')
      .addBearerAuth()
      .build();
    const document = SwaggerModule.createDocument(app, scalar_config);
    app.use(
      `/${config_service.get<string>('scalar.path') || 'api/docs'}`,
      apiReference({
        content: document,
        withFastify: true,
        theme: 'purple',
        layout: 'modern',
        darkMode: true,
        showSidebar: true,
        hideModels: false,
        hideDownloadButton: false,
        customCss: `
          .scalar-api-reference {
            --scalar-font: 'Inter', system-ui, -apple-system, sans-serif;
          }
        `
      })
    );
    logger.log(
      `📚 Scalar Documentation: http://localhost:${config_service.get<number>('app.port')}/${config_service.get<string>('scalar.path')}`
    );
  }

  // Listen
  const port = config_service.get<number>('app.port') || 3000;
  await app.listen(port, '0.0.0.0');
  logger.log(
    `🚀 Application is running on: http://localhost:${port}/${api_prefix}`
  );
  logger.log(`🌍 Environment: ${config_service.get<string>('app.node_env')}`);
}

// Cluster Mode
const cluster_enabled =
  process.env.CLUSTER_ENABLED === 'true' ||
  process.env.NODE_ENV === 'production';
if (cluster_enabled) {
  const workers = parseInt(process.env.CLUSTER_WORKERS || '0') || undefined;
  ClusterManager.Start(Bootstrap, workers);
} else {
  Bootstrap();
}
