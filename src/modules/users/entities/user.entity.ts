import { Exclude } from 'class-transformer';
import {
  Column,
  Entity,
  CreateDateColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Column()
  @Exclude()
  password: string;

  @Column('text', { array: true, default: [] })
  roles: string[];

  @Column('text', { array: true, default: [] })
  permissions: string[];

  @Column({ default: null })
  avatar?: string;

  @CreateDateColumn()
  created_at: Date;
}
