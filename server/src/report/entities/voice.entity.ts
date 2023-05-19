import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, OneToOne } from 'typeorm';
import { Prediction } from './prediction.entity';
import { Report } from './report.entity';

@Entity('VOICE')
export class Voice {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 1000 })
  voice_url: string;

  @Column({ length: 1000 })
  note: string;

  @ManyToOne(() => Report, (report) => report.voices, {
    onDelete: 'CASCADE',
  })
  report: Report;

  @OneToOne(() => Prediction, (prediction) => prediction.voice, {
    onDelete: 'CASCADE',
  })
  prediction: Prediction;
}
