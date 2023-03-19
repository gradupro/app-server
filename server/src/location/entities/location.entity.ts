import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  OneToOne,
  UpdateDateColumn,
} from 'typeorm';
import { Declaration } from '../../declaration/entities/declaration.entity';
import { Point, LineString } from 'wkx';

@Entity()
export class Location {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  address: string;

  @Column({ type: 'point' })
  start_point: Point;

  @Column({ type: 'point' })
  current_point: Point;

  @Column({
    type: 'linestring',
  })
  route: LineString;

  @CreateDateColumn({})
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @OneToOne(() => Declaration, (declaration) => declaration.location)
  declaration: Declaration;
}
