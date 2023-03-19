import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  Unique,
  OneToMany,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { Declaration } from '../../declaration/entities/declaration.entity';

@Entity()
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
}
