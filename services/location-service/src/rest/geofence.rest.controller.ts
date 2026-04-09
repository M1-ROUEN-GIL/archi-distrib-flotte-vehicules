import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GeofenceZone } from '../geofence/geofence.entity';

interface CreateZoneDto {
    name: string;
    centerLat: number;
    centerLon: number;
    radiusM: number;
}

@Controller('geofences')
export class GeofenceRestController {

    constructor(
        @InjectRepository(GeofenceZone)
        private readonly zoneRepo: Repository<GeofenceZone>,
    ) {}

    @Get()
    findAll(): Promise<GeofenceZone[]> {
        return this.zoneRepo.find({ order: { createdAt: 'DESC' } });
    }

    @Post()
    create(@Body() dto: CreateZoneDto): Promise<GeofenceZone> {
        const zone = this.zoneRepo.create(dto);
        return this.zoneRepo.save(zone);
    }

    @Delete(':id')
    async remove(@Param('id') id: string): Promise<void> {
        await this.zoneRepo.delete(id);
    }
}
