import { registerAs } from '@nestjs/config';

export default registerAs('upload', () => ({
  upload_dir: process.env.UPLOAD_DIR || './uploads',
  max_file_size: parseInt(process.env.MAX_FILE_SIZE || '10485760', 10),
  allowed_mime_types: process.env.ALLOWED_MIME_TYPES
    ? process.env.ALLOWED_MIME_TYPES.split(',')
    : [
        // Images
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/gif',
        'image/webp',
        'image/svg+xml',
        // Documents
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-powerpoint',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'text/plain',
        'text/csv',
        // Archives
        'application/zip',
        'application/x-rar-compressed',
        'application/x-7z-compressed',
        // Videos
        'video/mp4',
        'video/mpeg',
        'video/quicktime',
        'video/x-msvideo',
        // Audio
        'audio/mpeg',
        'audio/wav',
        'audio/ogg'
      ]
}));
