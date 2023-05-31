import {
  Controller,
  HttpStatus,
  Post,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  Headers,
  Put,
  Query,
  Get,
  Param,
  DefaultValuePipe,
  UploadedFiles,
} from '@nestjs/common';
import { FileFieldsInterceptor, FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { AuthGuard } from '../auth.guard';
import { UserService } from '../user/user.service';
import { Report } from './entities/report.entity';
import { ReportService } from './report.service';
import { PushNotificationService } from '../pushNotification/pushNotification.service';
import { NotificationDTO } from '../pushNotification/dto/notification.dto';
import { EnumValidationPipe } from '../enum.validate';
import { ReportType } from './entities/Enums';
import { SocketGateway } from '../socket/socket.gateway';

@Controller('report')
export class ReportController {
  constructor(
    private readonly reportService: ReportService,
    private readonly userService: UserService,
    private readonly pushNotificationService: PushNotificationService,
    private readonly socketGateWay: SocketGateway,
  ) {}

  /*
  @UseGuards(AuthGuard)
  @Post('multiVoice')
  @UseInterceptors(FileFieldsInterceptor([{ name: 'audio', maxCount: 12 }]))
  async uploadMultiAudio(
    @Headers() headers: any,
    @UploadedFiles() files: { audio: Express.Multer.File[] },
    @Res() res: Response,
  ) {
    try {
      console.log('files', files);
      const user = await this.userService.getUserInfo(headers.user.id);
      const report = await this.reportService.createReport(user);
      console.log('report', report);

      for await (const file of files.audio) {
        const uploadAudioResult = await this.reportService.uploadAudio(
          file.buffer,
          file.originalname,
        );
        console.log(uploadAudioResult);
        console.log('uploadAudioResult', uploadAudioResult);
        const textExtractionResult = await this.reportService.textExtraction(
          uploadAudioResult,
          report,
        );
        console.log('textExtractionResult', textExtractionResult);

        const voice = await this.reportService.createVoice(
          uploadAudioResult.fileUrl,
          textExtractionResult,
          report,
        );

        await this.reportService.prediction(uploadAudioResult.s3_key, textExtractionResult, voice);
      }

      const updateReportCategoryResult = await this.reportService.updateReportCategory(report.id);
      if (
        updateReportCategoryResult.category !== 'regular' &&
        updateReportCategoryResult.user.protectors.length > 0
      ) {
        const protectorIds = updateReportCategoryResult.user.protectors.map((p) => `${p.id}`);
        const notificationData: NotificationDTO = {
          protectorIds,
          reportType: updateReportCategoryResult.category,
          reporterName: updateReportCategoryResult.user.name,
        };
        await this.pushNotificationService.addJob(notificationData);
      }

      return res.status(HttpStatus.CREATED).json({
        status: HttpStatus.CREATED,
        data: updateReportCategoryResult,
      });
    } catch (e) {
      console.log(e);
      return res.status(e.status).json(e.response);
    }
  }
  */

  @UseGuards(AuthGuard)
  @Post('')
  //@UseInterceptors(FileFieldsInterceptor([{ name: 'audio', maxCount: 12 }]))
  @UseInterceptors(FileInterceptor('file'))
  async uploadAudio(
    @Headers() headers: any,
    @UploadedFile() file: Express.Multer.File,
    @Res() res: Response,
  ) {
    try {
      console.log('file', file);
      const uploadOriginalAudioResult = await this.reportService.uploadAudio(
        file.buffer,
        file.originalname,
      );
      const user = await this.userService.getUserInfo(headers.user.id);
      const report = await this.reportService.createReport(user, uploadOriginalAudioResult.fileUrl);
      console.log('report', report);
      const audioDuration = await this.reportService.getAudioDuration(file);
      console.log('AudioDuration', audioDuration);
      let startPointList: number[] = [];
      for (let i = 0; i < Math.ceil(audioDuration / 5); i++) {
        startPointList.push(i * 5);
      }
      console.log('startPointList', startPointList);
      for await (const startPoint of startPointList) {
        console.log('startPoint', startPoint);
        const sliceAudioResult = await this.reportService.sliceAudio(
          uploadOriginalAudioResult.fileUrl,
          startPoint,
          5,
        );
        console.log('sliceAudioResult', sliceAudioResult);
        const uploadAudioResult = await this.reportService.uploadAudio(
          sliceAudioResult,
          `${startPointList.indexOf(startPoint)}_${file.originalname}`,
        );
        console.log('uploadAudioResult', uploadAudioResult);
        const textExtractionResult = await this.reportService.textExtraction(
          uploadAudioResult,
          report,
        );
        console.log('textExtractionResult', textExtractionResult);

        const voice = await this.reportService.createVoice(
          uploadAudioResult.fileUrl,
          textExtractionResult,
          report,
        );

        await this.reportService.prediction(uploadAudioResult.s3_key, textExtractionResult, voice);
      }
      const reportResult = await this.reportService.getOne(report.id, true);
      console.log('updateReportCategoryResult', reportResult.categories);
      if (!reportResult.categories.allIsRegular && reportResult.user.protectors.length > 0) {
        const protectorIds = reportResult.user.protectors.map((p) => `${p.id}`);
        const notificationData: NotificationDTO = {
          protectorIds,
          reportType: reportResult.categories.mostCategory,
          reporterName: reportResult.user.name,
        };
        await this.pushNotificationService.addJob(notificationData);
      }
      return res.status(HttpStatus.CREATED).json({
        status: HttpStatus.CREATED,
        data: reportResult,
      });
    } catch (e) {
      console.log(e);
      return res.status(e.status).json(e.response);
    }
  }

  /*
  @UseGuards(AuthGuard)
  @Put('')
  @UseInterceptors(FileInterceptor('file'))
  async updateReport(
    @Headers() headers: any,
    @Query() query: any,
    @UploadedFile() file: Express.Multer.File,
    @Res() res: Response,
  ) {
    try {
      const reportId = query.id;
      const report = await this.reportService.getOne(reportId, false);
      console.log('report', report);
      const uploadAudioResult = await this.reportService.uploadAudio(
        file.buffer,
        file.originalname,
      );

      console.log('uploadAudioResult', uploadAudioResult);
      const textExtractionResult = await this.reportService.textExtraction(
        uploadAudioResult,
        report,
      );
      console.log('textExtractionResult', textExtractionResult);

      const voice = await this.reportService.createVoice(
        uploadAudioResult.fileUrl,
        textExtractionResult,
        report,
      );

      await this.reportService.prediction(uploadAudioResult.s3_key, textExtractionResult, voice);

      const updateReportCategoryResult = await this.reportService.updateReportCategory(reportId);

      return res.status(HttpStatus.ACCEPTED).json({
        status: HttpStatus.ACCEPTED,
        data: updateReportCategoryResult,
      });
    } catch (e) {
      return res.status(e.status).json(e.response);
    }
  }
  */
  @UseGuards(AuthGuard)
  @Put('interrupt')
  async updateReportInterrupt(@Headers() headers: any, @Query() query: any, @Res() res: Response) {
    try {
      const reportId = query.id;
      const userId = headers.user.id;
      let role: string;
      const report = await this.reportService.getOne(reportId, true);
      const isRequestUserProtector = await this.userService.isProtector(report.user.id, userId);
      if (report.user.id === userId) {
        role = 'reporter';
      } else if (isRequestUserProtector) {
        role = 'protector';
      } else {
        return res.status(HttpStatus.UNAUTHORIZED).json({
          status: HttpStatus.UNAUTHORIZED,
          message: ['Unauthorized Updated report.'],
          error: 'UNAUTHORIZED',
        });
      }
      const updatedReport = await this.reportService.updateReportInterrupt(reportId, role);
      return res.status(HttpStatus.ACCEPTED).json({
        status: HttpStatus.ACCEPTED,
        data: updatedReport,
      });
    } catch (e) {
      return res.status(e.status).json(e.response);
    }
  }

  @UseGuards(AuthGuard)
  @Get(':type')
  async getReports(
    @Headers() headers: any,
    @Param('type') type: ReportType,
    //@Param('type', new EnumValidationPipe(ReportType), new DefaultValuePipe(ReportType.REQUEST))
    //type: ReportType,
    @Res() res: Response,
  ) {
    try {
      console.log(type);
      const reports = await this.reportService.getMany(headers.user.id, type);
      return res.status(HttpStatus.OK).json({
        status: HttpStatus.OK,
        data: reports,
      });
    } catch (e) {
      return res.status(e.status).json(e.response);
    }
  }

  @UseGuards(AuthGuard)
  @Get('')
  async getReport(@Headers() headers: any, @Query('id') reportId: number, @Res() res: Response) {
    try {
      const report = await this.reportService.getOne(reportId, true);
      /* connect과 join_room은 클라이언트에서
      const roomName = `${reportId}`;
      const joinRoomPayload = { userId: headers.user.id, reportId: reportId };
      this.socketGateWay.handleSetClientDataEvent(joinRoomPayload);
      */
      return res.status(HttpStatus.OK).json({
        status: HttpStatus.OK,
        data: report,
      });
    } catch (e) {
      return res.status(e.status).json(e.response);
    }
  }
}
