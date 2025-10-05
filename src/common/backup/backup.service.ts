import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron, CronExpression } from '@nestjs/schedule';
import { LoggerService } from '../logger/logger.service';
import {
  IBackupResult,
  IBackupInfo,
  IBackupStats,
  IRestoreOptions
} from './interfaces/backup.interface';
import * as fs from 'fs';
import * as path from 'path';
import * as zlib from 'zlib';
import archiver from 'archiver';
import { exec, spawn } from 'child_process';
import { promisify } from 'util';

const exec_async = promisify(exec);

@Injectable()
export class BackupService {
  private readonly backup_dir: string;
  private readonly database_backup_enabled: boolean;
  private readonly files_backup_enabled: boolean;
  private readonly mysql_bin_path: string;
  private readonly postgres_bin_path: string;

  constructor(
    private readonly config_service: ConfigService,
    private readonly logger_service: LoggerService
  ) {
    this.logger_service.SetContext('BackupService');
    this.backup_dir = this.config_service.get<string>(
      'backup.dir',
      './backups'
    );
    this.database_backup_enabled = this.config_service.get<boolean>(
      'backup.database.enabled',
      true
    );
    this.files_backup_enabled = this.config_service.get<boolean>(
      'backup.files.enabled',
      true
    );
    this.mysql_bin_path = this.config_service.get<string>('MYSQL_BIN_PATH', '');
    this.postgres_bin_path = this.config_service.get<string>(
      'POSTGRES_BIN_PATH',
      ''
    );
    this.InitializeBackupDirectory();
  }

  private InitializeBackupDirectory(): void {
    try {
      if (!fs.existsSync(this.backup_dir)) {
        fs.mkdirSync(this.backup_dir, { recursive: true });
        this.logger_service.Info('Backup directory created', {
          path: this.backup_dir
        });
      }
      const subdirs = ['database', 'files', 'temp'];
      subdirs.forEach(subdir => {
        const dir_path = path.join(this.backup_dir, subdir);
        if (!fs.existsSync(dir_path)) {
          fs.mkdirSync(dir_path, { recursive: true });
        }
      });
    } catch (error) {
      this.logger_service.Error('Failed to initialize backup directory', error);
      throw error;
    }
  }

  private GetDatabaseCommand(
    command_name: string,
    db_type: 'mysql' | 'postgres'
  ): string {
    const custom_bin_path =
      db_type === 'postgres' ? this.postgres_bin_path : this.mysql_bin_path;
    if (custom_bin_path) {
      const full_path = path.join(custom_bin_path, command_name);
      if (process.platform === 'win32' && !full_path.endsWith('.exe')) {
        return `"${full_path}.exe"`;
      }
      return `"${full_path}"`;
    }
    if (process.platform === 'win32') {
      let possible_paths: string[] = [];
      if (db_type === 'postgres') {
        possible_paths = [
          path.join(
            process.env.USERPROFILE || '',
            'scoop',
            'apps',
            'postgresql',
            'current',
            'bin',
            `${command_name}.exe`
          ),
          'C:\\Program Files\\PostgreSQL\\16\\bin\\' + command_name + '.exe',
          'C:\\Program Files\\PostgreSQL\\15\\bin\\' + command_name + '.exe',
          'C:\\Program Files\\PostgreSQL\\14\\bin\\' + command_name + '.exe',
          'C:\\PostgreSQL\\bin\\' + command_name + '.exe'
        ];
      } else {
        possible_paths = [
          path.join(
            process.env.USERPROFILE || '',
            'scoop',
            'apps',
            'xampp',
            'current',
            'mysql',
            'bin',
            `${command_name}.exe`
          ),
          'C:\\xampp\\mysql\\bin\\' + command_name + '.exe',
          'C:\\wamp64\\bin\\mysql\\mysql8.0.27\\bin\\' + command_name + '.exe',
          'C:\\Program Files\\MySQL\\MySQL Server 8.0\\bin\\' +
            command_name +
            '.exe'
        ];
      }
      for (const possible_path of possible_paths) {
        if (fs.existsSync(possible_path)) {
          this.logger_service.Info(
            `Found ${command_name} at: ${possible_path}`
          );
          return `"${possible_path}"`;
        }
      }
    }
    return command_name;
  }

  private ParseDatabaseUrl(db_url: string): {
    type: string;
    host: string;
    port: number;
    username: string;
    password: string;
    database: string;
  } {
    try {
      const url = new URL(db_url);
      const type = url.protocol.replace(':', '');
      const host = url.hostname;
      const port = url.port
        ? parseInt(url.port, 10)
        : type === 'postgresql' || type === 'postgres'
          ? 5432
          : 3306;
      const username = url.username || 'root';
      const password = url.password || '';
      const database = url.pathname.replace('/', '');
      return {
        type: type === 'postgresql' ? 'postgres' : type,
        host,
        port,
        username,
        password,
        database
      };
    } catch (error) {
      throw new Error(
        JSON.stringify({
          en: 'Invalid database URL format',
          th: 'รูปแบบ URL ฐานข้อมูลไม่ถูกต้อง',
          original_error: error.message
        })
      );
    }
  }

  private GetDatabaseConfig(): {
    type: string;
    host: string;
    port: number;
    username: string;
    password: string;
    database: string;
  } {
    const db_url = this.config_service.get<string>('DB_URL');
    if (db_url) {
      return this.ParseDatabaseUrl(db_url);
    }
    const db_type = this.config_service.get<string>('DB_TYPE', 'mysql');
    const db_host = this.config_service.get<string>('DB_HOST', 'localhost');
    const db_port = this.config_service.get<number>(
      'DB_PORT',
      db_type.toLowerCase().includes('postgres') ? 5432 : 3306
    );
    const db_username = this.config_service.get<string>('DB_USERNAME', 'root');
    const db_password = this.config_service.get<string>('DB_PASSWORD', '');
    const db_database = this.config_service.get<string>('DB_DATABASE');
    if (!db_database) {
      throw new Error(
        JSON.stringify({
          en: 'Database name is not configured',
          th: 'ไม่ได้ตั้งค่าชื่อฐานข้อมูล'
        })
      );
    }
    return {
      type: db_type,
      host: db_host,
      port: db_port,
      username: db_username,
      password: db_password,
      database: db_database
    };
  }

  @Cron(CronExpression.EVERY_DAY_AT_2AM)
  async ScheduledDatabaseBackup(): Promise<void> {
    if (!this.database_backup_enabled) {
      return;
    }
    this.logger_service.Info('Starting scheduled database backup');
    try {
      const result = await this.BackupDatabase();
      if (result.success) {
        this.logger_service.Info('Scheduled database backup completed', {
          file_path: result.file_path,
          file_size: result.file_size,
          duration_ms: result.duration_ms
        });
        await this.CleanOldDatabaseBackups();
      } else {
        this.logger_service.Error(
          'Scheduled database backup failed',
          result.error
        );
      }
    } catch (error) {
      this.logger_service.Error('Scheduled database backup error', error);
    }
  }

  async BackupDatabase(): Promise<IBackupResult> {
    const start_time = new Date();
    const timestamp = this.FormatTimestamp(start_time);
    const compress = this.config_service.get<boolean>(
      'backup.database.compress',
      true
    );
    const file_name = `database-${timestamp}.sql${compress ? '.gz' : ''}`;
    const file_path = path.join(this.backup_dir, 'database', file_name);
    try {
      const db_config = this.GetDatabaseConfig();
      const {
        type: db_type,
        host: db_host,
        port: db_port,
        username: db_username,
        password: db_password,
        database: db_database
      } = db_config;
      let command: string;
      const db_type_lower = db_type.toLowerCase();
      if (db_type_lower === 'postgres' || db_type_lower === 'postgresql') {
        const pg_dump_cmd = this.GetDatabaseCommand('pg_dump', 'postgres');
        command = `PGPASSWORD="${db_password}" ${pg_dump_cmd} -h ${db_host} -p ${db_port} -U ${db_username} -d ${db_database} --clean --if-exists`;
        if (compress) {
          command += ` | gzip > "${file_path}"`;
        } else {
          command += ` > "${file_path}"`;
        }
      } else {
        const mysqldump_cmd = this.GetDatabaseCommand('mysqldump', 'mysql');
        command = `${mysqldump_cmd} -h ${db_host} -P ${db_port} -u ${db_username}`;
        if (db_password) {
          command += ` -p"${db_password}"`;
        }
        command += ` --single-transaction --routines --triggers --events ${db_database}`;
        if (compress) {
          command += ` | gzip > "${file_path}"`;
        } else {
          command += ` > "${file_path}"`;
        }
      }
      await exec_async(command);
      const end_time = new Date();
      const file_stats = fs.statSync(file_path);
      const is_valid = await this.VerifyBackup(file_path, file_stats.size);
      if (!is_valid) {
        throw new Error(
          JSON.stringify({
            en: 'Backup verification failed',
            th: 'การตรวจสอบ backup ล้มเหลว'
          })
        );
      }
      const result: IBackupResult = {
        success: true,
        backup_type: 'database',
        file_path,
        file_size: file_stats.size,
        start_time,
        end_time,
        duration_ms: end_time.getTime() - start_time.getTime()
      };
      this.logger_service.Info('Database backup completed', {
        file_path,
        file_size: this.FormatBytes(file_stats.size),
        duration: `${result.duration_ms}ms`
      });
      return result;
    } catch (error) {
      const end_time = new Date();
      let error_message = error.message;
      if (
        error_message.includes(
          'is not recognized as an internal or external command'
        )
      ) {
        const db_type = this.config_service.get<string>('DB_TYPE', 'mysql');
        const command_name = db_type.toLowerCase().includes('postgres')
          ? 'pg_dump'
          : 'mysqldump';
        error_message = JSON.stringify({
          en: `${command_name} command not found. Please install MySQL/PostgreSQL or set MYSQL_BIN_PATH in .env file.`,
          th: `ไม่พบคำสั่ง ${command_name} กรุณาติดตั้ง MySQL/PostgreSQL หรือตั้งค่า MYSQL_BIN_PATH ใน .env`,
          original_error: error.message,
          solution: {
            en: `Add MYSQL_BIN_PATH to your .env file. Example: MYSQL_BIN_PATH=C:\\xampp\\mysql\\bin`,
            th: `เพิ่ม MYSQL_BIN_PATH ในไฟล์ .env ของคุณ ตัวอย่าง: MYSQL_BIN_PATH=C:\\xampp\\mysql\\bin`
          }
        });
      }
      this.logger_service.Error('Database backup failed', error);
      return {
        success: false,
        backup_type: 'database',
        file_path,
        file_size: 0,
        start_time,
        end_time,
        duration_ms: end_time.getTime() - start_time.getTime(),
        error: error_message
      };
    }
  }

  private async CleanOldDatabaseBackups(): Promise<void> {
    const retention_days = this.config_service.get<number>(
      'backup.database.retention_days',
      30
    );
    await this.CleanOldBackups('database', retention_days);
  }

  @Cron(CronExpression.EVERY_DAY_AT_3AM)
  async ScheduledFilesBackup(): Promise<void> {
    if (!this.files_backup_enabled) {
      return;
    }
    this.logger_service.Info('Starting scheduled files backup');
    try {
      const result = await this.BackupFiles();
      if (result.success) {
        this.logger_service.Info('Scheduled files backup completed', {
          file_path: result.file_path,
          file_size: result.file_size,
          duration_ms: result.duration_ms
        });
        await this.CleanOldFilesBackups();
      } else {
        this.logger_service.Error(
          'Scheduled files backup failed',
          result.error
        );
      }
    } catch (error) {
      this.logger_service.Error('Scheduled files backup error', error);
    }
  }

  async BackupFiles(): Promise<IBackupResult> {
    const start_time = new Date();
    const timestamp = this.FormatTimestamp(start_time);
    const compress = this.config_service.get<boolean>(
      'backup.files.compress',
      true
    );
    const file_name = `files-${timestamp}.${compress ? 'zip' : 'tar'}`;
    const file_path = path.join(this.backup_dir, 'files', file_name);
    try {
      const directories = this.config_service.get<string[]>(
        'backup.files.directories',
        ['./uploads', './logs']
      );
      await this.CreateArchive(file_path, directories, compress);
      const end_time = new Date();
      const file_stats = fs.statSync(file_path);
      const is_valid = await this.VerifyBackup(file_path, file_stats.size);
      if (!is_valid) {
        throw new Error(
          JSON.stringify({
            en: 'Backup verification failed',
            th: 'การตรวจสอบ backup ล้มเหลว'
          })
        );
      }
      const result: IBackupResult = {
        success: true,
        backup_type: 'files',
        file_path,
        file_size: file_stats.size,
        start_time,
        end_time,
        duration_ms: end_time.getTime() - start_time.getTime()
      };
      this.logger_service.Info('Files backup completed', {
        file_path,
        file_size: this.FormatBytes(file_stats.size),
        duration: `${result.duration_ms}ms`
      });
      return result;
    } catch (error) {
      const end_time = new Date();
      this.logger_service.Error('Files backup failed', error);
      return {
        success: false,
        backup_type: 'files',
        file_path,
        file_size: 0,
        start_time,
        end_time,
        duration_ms: end_time.getTime() - start_time.getTime(),
        error: error.message
      };
    }
  }

  private async CreateArchive(
    output_path: string,
    directories: string[],
    compress: boolean
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      const output = fs.createWriteStream(output_path);
      const archive = archiver(compress ? 'zip' : 'tar', {
        zlib: { level: 9 }
      });
      output.on('close', () => {
        resolve();
      });
      archive.on('error', error => {
        reject(error);
      });
      archive.pipe(output);
      directories.forEach(dir => {
        if (fs.existsSync(dir)) {
          const dir_name = path.basename(dir);
          archive.directory(dir, dir_name);
        } else {
          this.logger_service.Warn(`Directory not found: ${dir}`);
        }
      });
      archive.finalize();
    });
  }

  private async CleanOldFilesBackups(): Promise<void> {
    const retention_days = this.config_service.get<number>(
      'backup.files.retention_days',
      14
    );
    await this.CleanOldBackups('files', retention_days);
  }

  private async CleanOldBackups(
    backup_type: 'database' | 'files',
    retention_days: number
  ): Promise<void> {
    try {
      const backup_path = path.join(this.backup_dir, backup_type);
      const files = fs.readdirSync(backup_path);
      const now = Date.now();
      const retention_ms = retention_days * 24 * 60 * 60 * 1000;
      let deleted_count = 0;
      let freed_space = 0;
      for (const file of files) {
        const file_path = path.join(backup_path, file);
        const stats = fs.statSync(file_path);
        const age_ms = now - stats.mtimeMs;
        if (age_ms > retention_ms) {
          freed_space += stats.size;
          fs.unlinkSync(file_path);
          deleted_count++;
        }
      }
      if (deleted_count > 0) {
        this.logger_service.Info(`Cleaned old ${backup_type} backups`, {
          deleted_count,
          freed_space: this.FormatBytes(freed_space)
        });
      }
    } catch (error) {
      this.logger_service.Error(
        `Failed to clean old ${backup_type} backups`,
        error
      );
    }
  }

  private async VerifyBackup(
    file_path: string,
    file_size: number
  ): Promise<boolean> {
    const verification_enabled = this.config_service.get<boolean>(
      'backup.verification.enabled',
      true
    );
    if (!verification_enabled) {
      return true;
    }
    try {
      if (!fs.existsSync(file_path)) {
        this.logger_service.Error('Backup file does not exist', undefined, {
          file_path
        });
        return false;
      }
      const check_size = this.config_service.get<boolean>(
        'backup.verification.check_size',
        true
      );
      if (check_size) {
        const min_size = this.config_service.get<number>(
          'backup.verification.min_size_bytes',
          1024
        );
        if (file_size < min_size) {
          this.logger_service.Error(
            'Backup file size is too small',
            undefined,
            {
              file_path,
              file_size,
              min_size
            }
          );
          return false;
        }
      }
      return true;
    } catch (error) {
      this.logger_service.Error('Backup verification failed', error);
      return false;
    }
  }

  async GetBackupsList(): Promise<IBackupInfo[]> {
    const backups: IBackupInfo[] = [];
    try {
      const types: Array<'database' | 'files'> = ['database', 'files'];
      for (const type of types) {
        const backup_path = path.join(this.backup_dir, type);
        if (!fs.existsSync(backup_path)) {
          continue;
        }
        const files = fs.readdirSync(backup_path);
        for (const file of files) {
          const file_path = path.join(backup_path, file);
          const stats = fs.statSync(file_path);
          backups.push({
            file_name: file,
            file_path,
            file_size: stats.size,
            backup_type: type,
            created_at: stats.mtime,
            is_compressed: file.endsWith('.gz') || file.endsWith('.zip')
          });
        }
      }
      backups.sort((a, b) => b.created_at.getTime() - a.created_at.getTime());
      return backups;
    } catch (error) {
      this.logger_service.Error('Failed to get backups list', error);
      return [];
    }
  }

  async GetBackupStats(): Promise<IBackupStats> {
    try {
      const backups = await this.GetBackupsList();
      const stats: IBackupStats = {
        total_backups: backups.length,
        database_backups: backups.filter(b => b.backup_type === 'database')
          .length,
        files_backups: backups.filter(b => b.backup_type === 'files').length,
        total_size_bytes: backups.reduce((sum, b) => sum + b.file_size, 0),
        oldest_backup: null,
        newest_backup: null
      };
      if (backups.length > 0) {
        stats.newest_backup = backups[0].created_at;
        stats.oldest_backup = backups[backups.length - 1].created_at;
      }
      return stats;
    } catch (error) {
      this.logger_service.Error('Failed to get backup stats', error);
      throw error;
    }
  }

  async DeleteBackup(file_name: string): Promise<boolean> {
    try {
      const backups = await this.GetBackupsList();
      const backup = backups.find(b => b.file_name === file_name);
      if (!backup) {
        throw new Error(
          JSON.stringify({
            en: 'Backup not found',
            th: 'ไม่พบไฟล์ backup'
          })
        );
      }
      fs.unlinkSync(backup.file_path);
      this.logger_service.Info('Backup deleted', {
        file_name,
        file_path: backup.file_path
      });
      return true;
    } catch (error) {
      this.logger_service.Error('Failed to delete backup', error);
      throw error;
    }
  }

  async RestoreDatabase(options: IRestoreOptions): Promise<boolean> {
    try {
      const backups = await this.GetBackupsList();
      const backup = backups.find(b => b.file_name === options.backup_file);
      if (!backup || backup.backup_type !== 'database') {
        throw new Error(
          JSON.stringify({
            en: 'Database backup not found',
            th: 'ไม่พบไฟล์ backup ฐานข้อมูล'
          })
        );
      }
      if (options.create_backup_before_restore) {
        this.logger_service.Info('Creating backup before restore');
        await this.BackupDatabase();
      }
      if (options.verify_before_restore) {
        const is_valid = await this.VerifyBackup(
          backup.file_path,
          backup.file_size
        );
        if (!is_valid) {
          throw new Error(
            JSON.stringify({
              en: 'Backup verification failed',
              th: 'การตรวจสอบ backup ล้มเหลว'
            })
          );
        }
      }
      const db_config = this.GetDatabaseConfig();
      const {
        type: db_type,
        host: db_host,
        port: db_port,
        username: db_username,
        password: db_password,
        database: db_database
      } = db_config;
      const db_type_lower = db_type.toLowerCase();
      const is_postgres =
        db_type_lower === 'postgres' || db_type_lower === 'postgresql';
      if (backup.is_compressed) {
        await this.RestoreFromCompressedBackup(
          backup.file_path,
          db_type,
          db_host,
          db_port,
          db_username,
          db_password,
          db_database,
          is_postgres
        );
      } else {
        let command: string;
        if (is_postgres) {
          const psql_cmd = this.GetDatabaseCommand('psql', 'postgres');
          command = `PGPASSWORD="${db_password}" ${psql_cmd} -h ${db_host} -p ${db_port} -U ${db_username} -d ${db_database} < "${backup.file_path}"`;
        } else {
          const mysql_cmd = this.GetDatabaseCommand('mysql', 'mysql');
          command = `${mysql_cmd} -h ${db_host} -P ${db_port} -u ${db_username}`;
          if (db_password) {
            command += ` -p"${db_password}"`;
          }
          command += ` ${db_database} < "${backup.file_path}"`;
        }
        await exec_async(command);
      }
      this.logger_service.Info('Database restored successfully', {
        backup_file: options.backup_file
      });
      return true;
    } catch (error) {
      this.logger_service.Error('Database restore failed', error);
      throw error;
    }
  }

  private RestoreFromCompressedBackup(
    file_path: string,
    db_type: string,
    db_host: string,
    db_port: number,
    db_username: string,
    db_password: string,
    db_database: string,
    is_postgres: boolean
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        const db_command = is_postgres ? 'psql' : 'mysql';
        const db_cmd_path = this.GetDatabaseCommand(
          db_command,
          is_postgres ? 'postgres' : 'mysql'
        );
        let args: string[] = [];
        let env = { ...process.env };
        if (is_postgres) {
          args = [
            '-h',
            db_host,
            '-p',
            String(db_port),
            '-U',
            db_username,
            '-d',
            db_database
          ];
          if (db_password) {
            env.PGPASSWORD = db_password;
          }
        } else {
          args = ['-h', db_host, '-P', String(db_port), '-u', db_username];
          if (db_password) {
            args.push(`-p${db_password}`);
          }
          args.push(db_database);
        }
        const gunzip = zlib.createGunzip();
        const read_stream = fs.createReadStream(file_path);
        const db_process = spawn(db_cmd_path.replace(/"/g, ''), args, {
          env,
          shell: true
        });
        read_stream.pipe(gunzip).pipe(db_process.stdin);
        let error_output = '';
        db_process.stderr.on('data', data => {
          error_output += data.toString();
        });
        db_process.on('close', code => {
          if (code === 0) {
            resolve();
          } else {
            reject(
              new Error(
                `Database restore failed with code ${code}: ${error_output}`
              )
            );
          }
        });
        db_process.on('error', error => {
          reject(error);
        });
        read_stream.on('error', error => {
          reject(error);
        });
        gunzip.on('error', error => {
          reject(error);
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  private FormatTimestamp(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${year}${month}${day}-${hours}${minutes}${seconds}`;
  }

  private FormatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  }
}
