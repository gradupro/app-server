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
import { Declaration } from '../../declaration/entities/declaration.entity';

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

  @OneToMany(() => Declaration, (declaration) => declaration.user)
  declarations: Declaration[];

  @OneToMany(() => UserProtector, (userProtector) => userProtector.protector)
  wards: UserProtector[];

  @OneToMany(() => UserProtector, (userProtector) => userProtector.ward)
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

  @ManyToOne(() => User, (user) => user.protectors)
  @JoinColumn({ name: 'wardId' })
  ward: User;

  @ManyToOne(() => User, (user) => user.wards)
  @JoinColumn({ name: 'protectorId' })
  protector: User;
}
export interface userToken {
  created: boolean;
  accessToken: string;
  latestLogDate?: Date;
}
