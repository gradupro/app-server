import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  Unique,
  OneToMany,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Report } from '../../report/entities/report.entity';

@Entity('USER')
@Unique('my_unique_constraint', ['phone_number'])
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ length: 30, nullable: false, unique: true })
  phone_number: string;

  @CreateDateColumn()
  created_at: Date;

  @OneToMany(() => Report, (report) => report.user, {
    cascade: true,
  })
  reports: Report[];

  @OneToMany(() => UserProtector, (userProtector) => userProtector.protector, {
    cascade: true,
  })
  wards: UserProtector[];

  @OneToMany(() => UserProtector, (userProtector) => userProtector.ward, {
    cascade: true,
  })
  protectors: UserProtector[];
}
@Entity()
export class UserProtector {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ default: false })
  accept: boolean;

  @CreateDateColumn()
  request_date: Date;

  @ManyToOne(() => User, (user) => user.protectors, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'wardId' })
  ward: User;

  @ManyToOne(() => User, (user) => user.wards, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'protectorId' })
  protector: User;
}
export interface userToken {
  created: boolean;
  accessToken: string;
  latestLogDate?: Date;
}
