import { Permission } from '../entities/permission.entity';

export interface IRole {
  id: string;
  name: string;
  slug: string;
  description: string;
  is_active: boolean;
  is_system: boolean;
  priority: number;
  permissions: Permission[];
  users: IUser[];
  created_at: Date;
  updated_at: Date;
}

export interface IUser {
  id: string;
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  role_id: string;
  role_entity: IRole;
  is_active: boolean;
  refresh_token: string | null;
  created_at: Date;
  updated_at: Date;
}
