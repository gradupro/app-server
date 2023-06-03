import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Location } from './entities/location.entity';
import { CreateLocationDto } from './dto/create-location.dto';
import { ReportService } from '../report/report.service';
import { UpdateLocationDto } from './dto/update-location.dto';
import { Geometry, Point } from 'wkx';

@Injectable()
export class LocationService {
  constructor(
    @Inject('LOCATION_REPOSITORY')
    private locationRepository: Repository<Location>,
    private reportService: ReportService,
  ) {}

  async create(body: CreateLocationDto) {
    try {
      const { latitude, longitude } = body.payload;
      const report = await this.reportService.getOne(body.reportId, false);
      const currentPoint = `${longitude} ${latitude}`;
      const createdLocation = await this.locationRepository
        .createQueryBuilder()
        .insert()
        .values({
          report: report,
          start_point: () => `ST_GeomFromText('POINT(${currentPoint})')`,
          current_point: () => `ST_GeomFromText('POINT(${currentPoint})')`,
        })
        .execute();
      return createdLocation;
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

  async update(body: UpdateLocationDto) {
    try {
      const { latitude, longitude } = body.payload;
      const currentPoint = `${longitude} ${latitude}`;
      const updatedLocation = await this.locationRepository.findOne({
        where: { report: { id: body.reportId } },
      });
      const start_pointJson = JSON.parse(
        JSON.stringify(Geometry.parse(`SRID=4326;${updatedLocation.start_point}`).toGeoJSON()),
      );
      const start_point = start_pointJson.coordinates;
      let routeData: Point[] = [];
      if (updatedLocation.route) {
        const routeJSON = JSON.parse(
          JSON.stringify(Geometry.parse(`SRID=4326;${updatedLocation.route}`).toGeoJSON()),
        );
        const preRoute = routeJSON.coordinates;
        preRoute.push([longitude, latitude]);
        routeData = preRoute;
      } else {
        routeData = [start_point, [longitude, latitude]];
      }
      console.log('routeData', routeData);
      const route: string = routeData.map((p) => `${p[0]} ${p[1]}`).join(',');
      console.log(route);
      await this.locationRepository
        .createQueryBuilder()
        .update()
        .set({
          current_point: () => `ST_GeomFromText('POINT(${currentPoint})')`,
          route: () => `ST_GeomFromText('LINESTRING(${route})')`,
        })
        .where('id = :id', { id: updatedLocation.id })
        .execute();
      return {
        route: routeData,
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
}
