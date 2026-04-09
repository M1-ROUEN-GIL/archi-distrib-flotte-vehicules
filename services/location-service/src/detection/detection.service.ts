import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { GeofenceZone } from '../geofence/geofence.entity';
import { KafkaProducer } from '../kafka/kafka.producer';

const SPEED_LIMIT_KMH      = parseInt(process.env.SPEED_LIMIT_KMH      || '130', 10);
const IMMOBILIZATION_MS    = parseInt(process.env.IMMOBILIZATION_MIN    || '15',  10) * 60_000;
const ALERT_COOLDOWN_MS    = 5 * 60_000; // 5 min entre deux alertes du même type pour un véhicule
const MOVING_THRESHOLD_KMH = 1;

@Injectable()
export class DetectionService implements OnModuleInit {

    private readonly logger = new Logger(DetectionService.name);

    /** vehicleId → timestamp de la dernière position avec vitesse > seuil */
    private readonly lastMovingAt      = new Map<string, number>();
    /** vehicleId → timestamp de la dernière alerte VEHICLE_IMMOBILIZED */
    private readonly lastImmobilAlert  = new Map<string, number>();
    /** vehicleId → timestamp de la dernière alerte SPEED_EXCEEDED */
    private readonly lastSpeedAlert    = new Map<string, number>();
    /** vehicleId → Set<zoneId> des zones dans lesquelles le véhicule se trouve */
    private readonly vehicleZones      = new Map<string, Set<string>>();

    constructor(
        @InjectRepository(GeofenceZone)
        private readonly zoneRepo: Repository<GeofenceZone>,
        private readonly kafkaProducer: KafkaProducer,
        private readonly dataSource: DataSource,
    ) {}

    async onModuleInit() {
        // Créer la table si elle n'existe pas encore (synchronize est false pour TimescaleDB)
        await this.dataSource.query(`
            CREATE TABLE IF NOT EXISTS geofence_zones (
                id         UUID             DEFAULT gen_random_uuid() PRIMARY KEY,
                name       VARCHAR(100)     NOT NULL,
                center_lat DOUBLE PRECISION NOT NULL,
                center_lon DOUBLE PRECISION NOT NULL,
                radius_m   REAL             NOT NULL,
                created_at TIMESTAMPTZ      NOT NULL DEFAULT NOW()
            )
        `);
        this.logger.log('Table geofence_zones vérifiée');
    }

    async analyzePosition(position: any): Promise<void> {
        await Promise.all([
            this.checkSpeed(position),
            this.checkImmobilization(position),
            this.checkGeofencing(position),
        ]);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Détection vitesse
    // ─────────────────────────────────────────────────────────────────────────

    private async checkSpeed(position: any): Promise<void> {
        if ((position.speed_kmh ?? 0) <= SPEED_LIMIT_KMH) return;

        const now = Date.now();
        if (now - (this.lastSpeedAlert.get(position.vehicle_id) ?? 0) < ALERT_COOLDOWN_MS) return;

        this.lastSpeedAlert.set(position.vehicle_id, now);
        this.logger.warn(`SPEED_EXCEEDED vehicle=${position.vehicle_id} speed=${position.speed_kmh} km/h`);

        await this.kafkaProducer.publishLocationEvent({
            event_type:      'SPEED_EXCEEDED',
            vehicle_id:      position.vehicle_id,
            driver_id:       position.driver_id,
            latitude:        position.latitude,
            longitude:       position.longitude,
            speed_kmh:       position.speed_kmh,
            speed_limit_kmh: SPEED_LIMIT_KMH,
            message: `Dépassement de vitesse : ${(position.speed_kmh as number).toFixed(0)} km/h (limite : ${SPEED_LIMIT_KMH} km/h)`,
        });
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Détection immobilisation
    // ─────────────────────────────────────────────────────────────────────────

    private async checkImmobilization(position: any): Promise<void> {
        const now = Date.now();

        if ((position.speed_kmh ?? 0) >= MOVING_THRESHOLD_KMH) {
            this.lastMovingAt.set(position.vehicle_id, now);
            this.lastImmobilAlert.delete(position.vehicle_id); // reset si le véhicule repart
            return;
        }

        const lastMoving = this.lastMovingAt.get(position.vehicle_id);
        if (!lastMoving) {
            this.lastMovingAt.set(position.vehicle_id, now);
            return;
        }

        if (now - lastMoving < IMMOBILIZATION_MS) return;
        if (now - (this.lastImmobilAlert.get(position.vehicle_id) ?? 0) < ALERT_COOLDOWN_MS) return;

        this.lastImmobilAlert.set(position.vehicle_id, now);
        const stoppedMin = Math.round((now - lastMoving) / 60_000);
        this.logger.warn(`VEHICLE_IMMOBILIZED vehicle=${position.vehicle_id} since ${stoppedMin} min`);

        await this.kafkaProducer.publishLocationEvent({
            event_type: 'VEHICLE_IMMOBILIZED',
            vehicle_id: position.vehicle_id,
            driver_id:  position.driver_id,
            latitude:   position.latitude,
            longitude:  position.longitude,
            message:    `Véhicule immobilisé depuis ${stoppedMin} minutes`,
        });
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Détection geofencing
    // ─────────────────────────────────────────────────────────────────────────

    private async checkGeofencing(position: any): Promise<void> {
        const zones = await this.zoneRepo.find();
        if (zones.length === 0) return;

        if (!this.vehicleZones.has(position.vehicle_id)) {
            this.vehicleZones.set(position.vehicle_id, new Set());
        }
        const currentZones = this.vehicleZones.get(position.vehicle_id)!;

        for (const zone of zones) {
            const distance = this.haversineM(
                position.latitude, position.longitude,
                zone.centerLat, zone.centerLon,
            );
            const isInside  = distance <= zone.radiusM;
            const wasInside = currentZones.has(zone.id);

            if (wasInside && !isInside) {
                currentZones.delete(zone.id);
                this.logger.warn(`GEOFENCING_BREACH vehicle=${position.vehicle_id} zone="${zone.name}"`);
                await this.kafkaProducer.publishLocationEvent({
                    event_type: 'GEOFENCING_BREACH',
                    vehicle_id: position.vehicle_id,
                    driver_id:  position.driver_id,
                    latitude:   position.latitude,
                    longitude:  position.longitude,
                    zone_name:  zone.name,
                    message:    `Véhicule sorti de la zone "${zone.name}"`,
                });
            } else if (!wasInside && isInside) {
                currentZones.add(zone.id);
            }
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Formule de Haversine — distance en mètres entre deux points GPS
    // ─────────────────────────────────────────────────────────────────────────

    private haversineM(lat1: number, lon1: number, lat2: number, lon2: number): number {
        const R      = 6_371_000;
        const toRad  = (x: number) => (x * Math.PI) / 180;
        const dLat   = toRad(lat2 - lat1);
        const dLon   = toRad(lon2 - lon1);
        const a =
            Math.sin(dLat / 2) ** 2 +
            Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
        return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    }
}
