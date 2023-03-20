import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  Unique,
  OneToMany,
  ManyToMany,
  JoinTable,
  JoinColumn,
  ManyToOne,
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

  /*
  @ManyToMany(() => User, (user) => user.wards)
  @JoinTable({
    name: 'ProtectorWard',
    joinColumn: {
      name: 'wardId',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'protectorId',
      referencedColumnName: 'id',
    },
  })
  protectors: User[];

  @ManyToMany(() => User, (user) => user.protectors)
  wards: User[];
  */
  @OneToMany(() => ProtectorWard, (protectorWard) => protectorWard.wards)
  wards: ProtectorWard[];
  @OneToMany(() => ProtectorWard, (protectorWard) => protectorWard.protectors)
  protectors: ProtectorWard[];
}
@Entity('ProtectorWard')
export class ProtectorWard {
  @PrimaryGeneratedColumn()
  ProtectorWardId: number;

  @ManyToOne(() => User, (user) => user.wards)
  @JoinColumn({ name: 'protectorId' })
  protectors: User;

  protectorId: number;
  @ManyToOne(() => User, (user) => user.protectors)
  @JoinColumn({ name: 'wardId' })
  wards: User;

  @Column()
  accept: boolean;
}

export interface userToken {
  created: boolean;
  accessToken: string;
  latestLogDate?: Date;
}
