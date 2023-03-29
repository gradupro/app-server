import { Controller, HttpStatus, Post, Res, UploadedFile, UseGuards, UseInterceptors, Headers } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { AuthGuard } from '../auth.guard';
import { UserService } from '../user/user.service';
import { ReportService } from './report.service';

@Controller('report')
export class ReportController {
  constructor(private readonly reportService: ReportService, private readonly userService: UserService) {}

  @UseGuards(AuthGuard)
  @Post('')
  @UseInterceptors(FileInterceptor('file'))
  async uploadAudio(@Headers() headers: any, @UploadedFile() file: Express.Multer.File, @Res() res: Response) {
    try {
      console.log('file', file);

      const user = await this.userService.getUserInfo(headers.user.id);
      const report = await this.reportService.createReport(user);
      console.log('report', report);
      const uploadAudioResult = await this.reportService.uploadAudio(file.buffer, file.originalname);

      console.log('uploadAudioResult', uploadAudioResult);
      const textExtractionResult = await this.reportService.textExtraction(uploadAudioResult, report);
      console.log('textExtractionResult', textExtractionResult);

      const voice = await this.reportService.createVoice(uploadAudioResult.fileUrl, textExtractionResult, report);

      const predictResult = await this.reportService.prediction(uploadAudioResult.s3_key, textExtractionResult, voice);

      return res.status(HttpStatus.CREATED).json({
        status: HttpStatus.CREATED,
        data: predictResult,
      });
    } catch (e) {
      return res.status(e.status).json(e.response);
    }
  }
}
