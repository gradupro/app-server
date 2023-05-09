import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as AWS from 'aws-sdk';
import { Repository } from 'typeorm';
import { Report } from './entities/report.entity';
import { Voice } from './entities/voice.entity';
import { Prediction } from './entities/prediction.entity';

import * as FormData from 'form-data';
import { AxiosError, AxiosRequestConfig } from 'axios';
import { catchError, lastValueFrom, map } from 'rxjs';
import { HttpService } from '@nestjs/axios';

import {
  TranscribeClient,
  StartTranscriptionJobCommand,
  TranscriptionJob,
  GetTranscriptionJobCommand,
  GetTranscriptionJobCommandOutput,
} from '@aws-sdk/client-transcribe';
import { User } from '../user/entities/user.entity';
import { CategoryEnum } from './entities/Enums';
import { ReportType } from './entities/Enums';

@Injectable()
export class ReportService {
  private readonly s3: AWS.S3;
  constructor(
    @Inject('REPORT_REPOSITORY')
    private reportRepository: Repository<Report>,
    @Inject('VOICE_REPOSITORY')
    private voiceRepository: Repository<Voice>,
    @Inject('PREDICTION_REPOSITORY')
    private predictionRepository: Repository<Prediction>,
    private config: ConfigService,
    private readonly httpService: HttpService,
  ) {
    AWS.config.update({
      region: this.config.get('AWS_REGION'),
      credentials: {
        accessKeyId: this.config.get('AWS_ACCESS_KEY'),
        secretAccessKey: this.config.get('AWS_SECRET_KEY'),
      },
    });
    this.s3 = new AWS.S3();
  }

  async createReport(user: User): Promise<Report> {
    try {
      const newReport = new Report();
      newReport.user = user;

      await this.reportRepository.save(newReport);
      return newReport;
    } catch (e) {
      console.log(e);
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          message: [e.message.split('\n')[0]],
          error: 'INTERNAL_SERVER_ERROR',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async uploadAudio(dataBuffer: Buffer, fileName: string): Promise<any> {
    try {
      const key = `Audio/${Date.now()}-${fileName}`;
      const params: AWS.S3.PutObjectRequest = {
        Bucket: this.config.get('AWS_BUCKET_NAME'),
        ACL: 'public-read',
        Key: key,
        Body: dataBuffer,
      };

      const uploadResult = await this.s3.upload(params).promise();
      return {
        fileName: fileName,
        fileUrl: uploadResult.Location,
        s3_key: uploadResult.Key,
      };
    } catch (e) {
      console.log(e);
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          message: [e.message.split('\n')[0]],
          error: 'INTERNAL_SERVER_ERROR',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  private async sendTranscribeJob(
    transcribeClient: TranscribeClient,
    s3Object: any,
    report: Report,
  ): Promise<TranscriptionJob> {
    try {
      const jobName = `${Date.now()}-${report.id}`;
      const params = {
        TranscriptionJobName: jobName,
        LanguageCode: 'ko-KR',
        MediaFormat: 'wav',
        Media: {
          MediaFileUri: `https://s3-ap-northeast-2.amazonaws.com/${this.config.get(
            'AWS_BUCKET_NAME',
          )}/${s3Object.s3_key}`,
        },
        OutputBucketName: 'emerdy-app-audio-transcribe-output',
      };
      const transcribeCommand = new StartTranscriptionJobCommand(params);

      const transcriptionJobResponse = await transcribeClient.send(transcribeCommand);
      return transcriptionJobResponse.TranscriptionJob;
    } catch (e) {
      console.log(e);
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          message: [e.message.split('\n')[0]],
          error: 'INTERNAL_SERVER_ERROR',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  private sleep = (ms: number) => {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
  };

  private async getTranscribeResult(
    transcribeClient: TranscribeClient,
    transcriptionJobName: string,
  ): Promise<TranscriptionJob> {
    try {
      const param = {
        TranscriptionJobName: transcriptionJobName,
      };
      const transcribeCommand = new GetTranscriptionJobCommand(param);
      let i = 0;
      let job: GetTranscriptionJobCommandOutput;
      while (i < 60) {
        job = await transcribeClient.send(transcribeCommand);
        const job_status = job['TranscriptionJob']['TranscriptionJobStatus'];
        if (['COMPLETED', 'FAILED'].includes(job_status)) {
          if (job_status === 'COMPLETED') {
            return job['TranscriptionJob'];
          }
        } else {
          console.log(`Waiting for ${transcriptionJobName}. Current status is ${job_status}`);
        }
        i++;
        await new Promise((resolve) => {
          setTimeout(resolve, 1000);
        });
      }
    } catch (e) {
      console.log(e);
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          message: [e.message.split('\n')[0]],
          error: 'INTERNAL_SERVER_ERROR',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  private async getTranscriptFile(keyName: string): Promise<string> {
    try {
      const params = {
        Bucket: 'emerdy-app-audio-transcribe-output',
        Key: `${keyName}.json`,
      };

      const transcriptFile = await this.s3.getObject(params).promise();
      const transcripts = JSON.parse(transcriptFile.Body.toString('utf-8')).results.transcripts[0]
        .transcript;
      const text: string = transcripts === '' ? 'empty' : transcripts;
      return text;
    } catch (e) {
      console.log(e);
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          message: [e.message.split('\n')[0]],
          error: 'INTERNAL_SERVER_ERROR',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async textExtraction(s3Object: any, report: Report): Promise<string> {
    try {
      const transcribeConfig = {
        region: this.config.get('AWS_REGION'),
        credentials: {
          accessKeyId: this.config.get('AWS_ACCESS_KEY'),
          secretAccessKey: this.config.get('AWS_SECRET_KEY'),
        },
      };
      const transcribeClient = new TranscribeClient(transcribeConfig);
      const transcriptionJobResponse = await this.sendTranscribeJob(
        transcribeClient,
        s3Object,
        report,
      );
      console.log('transcriptionJobResponse', transcriptionJobResponse); //TranscriptionJobName
      const successTranscribe = await this.getTranscribeResult(
        transcribeClient,
        transcriptionJobResponse.TranscriptionJobName,
      );
      console.log('successTranscribe', successTranscribe); //Transcript.TranscriptFileUri
      console.log(successTranscribe.TranscriptionJobName);
      const script = await this.getTranscriptFile(successTranscribe.TranscriptionJobName);
      return script; // results.transcripts[0].transcript
    } catch (e) {
      console.log(e);
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          message: [e.message.split('\n')[0]],
          error: 'INTERNAL_SERVER_ERROR',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async createVoice(voice_url: string, text: string, report: Report): Promise<Voice> {
    try {
      const newVoice = new Voice();
      newVoice.note = text;
      newVoice.report = report;
      newVoice.voice_url = voice_url;
      await this.voiceRepository.save(newVoice);
      return newVoice;
    } catch (e) {
      console.log(e);
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          message: [e.message.split('\n')[0]],
          error: 'INTERNAL_SERVER_ERROR',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async prediction(voiceObjectKey: string, text: string, voice: Voice): Promise<Prediction> {
    try {
      const form: FormData = new FormData();
      form.append('s3_key', voiceObjectKey);
      form.append('text_input_s3', text);

      const requestConfig: AxiosRequestConfig = {
        headers: { 'Content-Type': 'multipart/form-data' },
        params: {},
      };
      const mlServerResult = await lastValueFrom(
        this.httpService.post(this.config.get('ML_SERVER_HOST'), form, requestConfig).pipe(
          map((response) => response?.data),
          catchError((error: AxiosError) => {
            throw error;
          }),
        ),
      );
      console.log('mlServerResult', mlServerResult);
      if (mlServerResult.result === 'success') {
        const newPrediction = new Prediction();
        newPrediction.voice = voice;
        newPrediction.audio_label = mlServerResult.audio_label;
        newPrediction.audio_feature = mlServerResult.audio_feature;
        newPrediction.text_label = mlServerResult.text_label;
        newPrediction.text_feature = mlServerResult.text_feature;
        newPrediction.combined_probabilities = mlServerResult.combined_probabilities;
        newPrediction.combined_label = mlServerResult.combined_label;

        await this.predictionRepository.save(newPrediction);
        return newPrediction;
      } else {
        throw new HttpException(
          {
            status: HttpStatus.INTERNAL_SERVER_ERROR,
            message: ['ML Server results is not success'],
            error: 'INTERNAL_SERVER_ERROR',
          },
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    } catch (e) {
      console.log(e);
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          message: [e.message.split('\n')[0]],
          error: 'INTERNAL_SERVER_ERROR',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getOne(reportId: number, api: boolean): Promise<Report> {
    try {
      let relations: any;
      if (api) {
        relations = {
          user: true,
          voices: {
            prediction: true,
          },
        };
      } else {
        relations = {};
      }
      const report = await this.reportRepository.findOne({
        where: {
          id: reportId,
        },
        relations: relations,
      });

      return report;
    } catch (e) {
      console.log(e);
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          message: [e.message.split('\n')[0]],
          error: 'INTERNAL_SERVER_ERROR',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getMany(userId: number, type: ReportType): Promise<Report[]> {
    try {
      const reports = await this.reportRepository.find({
        where: {
          user: {
            id: userId,
          },
        },
        relations: {
          user: true,
          voices: {
            prediction: true,
          },
        },
      });
      return reports;
    } catch (e) {
      console.log(e);
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          message: [e.message.split('\n')[0]],
          error: 'INTERNAL_SERVER_ERROR',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async updateReportCategory(reportId: number): Promise<Report> {
    try {
      const report = await this.reportRepository.findOne({
        where: {
          id: reportId,
        },
        relations: {
          voices: {
            prediction: true,
          },
          user: {
            protectors: true,
          },
        },
      });
      let updatedCategory: string;
      report.voices.forEach((v) => {
        if (v.prediction.combined_label !== 'regular') {
          updatedCategory = v.prediction.combined_label;
        }
      });
      report.category = CategoryEnum[updatedCategory];
      await this.reportRepository.save(report);
      return report;
    } catch (e) {
      console.log(e);
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          message: [e.message.split('\n')[0]],
          error: 'INTERNAL_SERVER_ERROR',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async updateReportInterrupt(reportId: number, role: string): Promise<Report> {
    try {
      const report = await this.reportRepository.findOne({
        where: {
          id: reportId,
        },
      });
      report[`${role}_interruption`] = true;
      await this.reportRepository.save(report);
      return report;
    } catch (e) {
      console.log(e);
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          message: [e.message.split('\n')[0]],
          error: 'INTERNAL_SERVER_ERROR',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
