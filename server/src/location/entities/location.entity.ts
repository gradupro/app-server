import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  OneToOne,
  UpdateDateColumn,
  Point,
  LineString,
} from 'typeorm';
import { Report } from '../../report/entities/report.entity';

@Entity('LOCATION')
export class Location {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100, nullable: true })
  address: string;

  @Column({ type: 'geometry', spatialFeatureType: 'Point', srid: 4326 })
  start_point: Point;

  @Column({ type: 'geometry', spatialFeatureType: 'Point', srid: 4326 })
  current_point: Point;

  @Column({ type: 'geometry', spatialFeatureType: 'LineString', srid: 4326, nullable: true })
  route: LineString;

  @CreateDateColumn({})
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @OneToOne(() => Report, (report) => report.location, {
    onDelete: 'CASCADE',
  })
  report: Report;
}
