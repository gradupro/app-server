import { Entity, Column, PrimaryGeneratedColumn, JoinColumn, OneToOne } from 'typeorm';
import { Voice } from './voice.entity';

@Entity('PREDICTION')
export class Prediction {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 300 })
  combined_label: string;

  @Column('simple-array')
  combined_probabilities: number[];

  @Column({ length: 300 })
  audio_label: string;

  @Column('simple-array')
  audio_feature: number[];

  @Column({ length: 300 })
  text_label: string;

  @Column('simple-array')
  text_feature: number[];

  @OneToOne(() => Voice, (voice) => voice.prediction)
  @JoinColumn()
  voice: Voice;
}
