import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, OneToOne, UpdateDateColumn } from 'typeorm';
import { Report } from '../../report/entities/report.entity';
import { Point, LineString } from 'wkx';

@Entity('LOCATION')
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

  @OneToOne(() => Report, (report) => report.location)
  report: Report;
}
