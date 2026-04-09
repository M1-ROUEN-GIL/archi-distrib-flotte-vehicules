import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LocationService } from './location.service';
import { LocationController } from './location.controller';
import { LocationRestController } from '../rest/location.rest.controller';
import { GeofenceRestController } from '../rest/geofence.rest.controller';
import { LocationReading } from './location.entity';
import { GeofenceZone } from '../geofence/geofence.entity';
import { KafkaProducer } from '../kafka/kafka.producer';
import { DetectionService } from '../detection/detection.service';

@Module({
    imports: [TypeOrmModule.forFeature([LocationReading, GeofenceZone])],
    controllers: [LocationController, LocationRestController, GeofenceRestController],
    providers: [LocationService, KafkaProducer, DetectionService],
})
export class LocationModule {}