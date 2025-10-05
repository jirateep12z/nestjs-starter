import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  BeforeInsert,
  BeforeUpdate,
  ManyToOne,
  JoinColumn
} from 'typeorm';
import { Exclude } from 'class-transformer';
import * as bcrypt from 'bcrypt';
import type { IRole } from '../../rbac/interfaces/role.interface';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  @Exclude()
  password: string;

  @Column({ nullable: true })
  first_name: string;

  @Column({ nullable: true })
  last_name: string;

  @Column({ type: 'uuid', nullable: true })
  role_id: string;

  @ManyToOne('Role', 'users', { nullable: true })
  @JoinColumn({ name: 'role_id' })
  role_entity: IRole;

  @Column({ default: true })
  is_active: boolean;

  @Column({ type: 'varchar', nullable: true })
  @Exclude()
  refresh_token: string | null;

  @Column({ default: false })
  two_factor_enabled: boolean;

  @Column({ type: 'varchar', nullable: true })
  @Exclude()
  two_factor_secret: string | null;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @BeforeInsert()
  @BeforeUpdate()
  async HashPassword() {
    if (this.password && !this.password.startsWith('$2b$')) {
      const salt_rounds = parseInt(process.env.BCRYPT_SALT_ROUNDS || '10', 10);
      this.password = await bcrypt.hash(this.password, salt_rounds);
    }
  }

  async ValidatePassword(password: string): Promise<boolean> {
    return bcrypt.compare(password, this.password);
  }
}
