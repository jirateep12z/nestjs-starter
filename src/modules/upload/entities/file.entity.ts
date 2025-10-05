import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn
} from 'typeorm';
import { User } from '../../user/entities/user.entity';

@Entity('files')
export class File {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  original_name: string;

  @Column()
  file_name: string;

  @Column()
  file_path: string;

  @Column()
  mime_type: string;

  @Column({ type: 'bigint' })
  size: number;

  @Column({ nullable: true })
  description: string;

  @Column({
    type: 'enum',
    enum: ['image', 'document', 'video', 'audio', 'other'],
    default: 'other'
  })
  file_type: string;

  @Column({ default: true })
  is_public: boolean;

  @Column({ type: 'uuid', nullable: true })
  uploaded_by: string;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'uploaded_by' })
  uploader: User;

  @CreateDateColumn()
  created_at: Date;
}
