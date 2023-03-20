import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
} from 'typeorm';

@Entity('VERIFY')
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

export interface responseData {
  status: number;
  data: any;
}
