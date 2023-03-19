import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
} from 'typeorm';

@Entity()
export class Verify {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  code: string;

  @Column({ length: 30 })
  phone_number: string;

  @CreateDateColumn()
  created_at: Date;
}
