import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  OneToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Location } from '../../location/entities/location.entity';
import { User } from '../../user/entities/user.entity';
import { CategoryEnum } from './Enums';
import { Voice } from './voice.entity';

@Entity('REPORT')
export class Report {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ default: false })
  protector_interruption: boolean;

  @Column({ default: false })
  reporter_interruption: boolean;

  @Column({ type: 'enum', name: 'category', enum: CategoryEnum, default: CategoryEnum.regular })
  category: CategoryEnum;

  @Column({ nullable: true, default: null })
  end_at: Date;

  @CreateDateColumn()
  created_at: Date;

  @ManyToOne(() => User, (user) => user.reports, {
    onDelete: 'CASCADE',
  })
  user: User;

  @OneToOne(() => Location, (location) => location.report, {
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  location: Location;

  @OneToMany(() => Voice, (voice) => voice.report, {
    cascade: true,
  })
  voices: Voice[];
}
