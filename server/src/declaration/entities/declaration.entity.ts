import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { Location } from '../../location/entities/location.entity';
import { User } from '../../user/entities/user.entity';
import { CategoryEnum } from './Enums';
@Entity('DECLARATION')
export class Declaration {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  interruption: boolean;

  @Column({ type: 'enum', name: 'category', enum: CategoryEnum })
  category: CategoryEnum;

  @Column({ length: 300 })
  voice_url: string;

  @Column({ length: 500 })
  note: string;

  @CreateDateColumn()
  created_at: Date;

  @ManyToOne((type) => User, (user) => user.declarations)
  user: User;

  @OneToOne((type) => Location, (location) => location.declaration)
  @JoinColumn()
  location: Location;
}
