import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { v4 as uuid } from 'uuid';
import { User } from './user.entity';

@Entity('users_tokens')
class UserToken {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  refresh_token: string;

  @Column()
  user_id: number;

  @Column('timestamp')
  expires_date: Date;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @ManyToOne(() => User)
  @JoinColumn()
  user: User;

  constructor() {
    if (!this.id) {
      this.id = uuid();
    }
  }
}

export { UserToken };
