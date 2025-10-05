import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToMany,
  JoinTable,
  OneToMany
} from 'typeorm';
import { Permission } from './permission.entity';
import type { IUser } from '../../user/interfaces/user.interface';

@Entity('roles')
export class Role {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  name: string;

  @Column({ unique: true })
  slug: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ default: true })
  is_active: boolean;

  @Column({ default: false })
  is_system: boolean;

  @Column({ type: 'int', default: 0 })
  priority: number;

  @ManyToMany(() => Permission, permission => permission.roles, {
    cascade: true
  })
  @JoinTable({
    name: 'role_permissions',
    joinColumn: { name: 'role_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'permission_id', referencedColumnName: 'id' }
  })
  permissions: Permission[];

  @OneToMany('User', 'role_entity')
  users: IUser[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
