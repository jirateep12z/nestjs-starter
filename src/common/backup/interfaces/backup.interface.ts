export interface IBackupResult {
  success: boolean;
  backup_type: 'database' | 'files';
  file_path: string;
  file_size: number;
  start_time: Date;
  end_time: Date;
  duration_ms: number;
  error?: string;
}

export interface IBackupInfo {
  file_name: string;
  file_path: string;
  file_size: number;
  backup_type: 'database' | 'files';
  created_at: Date;
  is_compressed: boolean;
}

export interface IBackupStats {
  total_backups: number;
  database_backups: number;
  files_backups: number;
  total_size_bytes: number;
  oldest_backup: Date | null;
  newest_backup: Date | null;
}

export interface IRestoreOptions {
  backup_file: string;
  verify_before_restore?: boolean;
  create_backup_before_restore?: boolean;
}
