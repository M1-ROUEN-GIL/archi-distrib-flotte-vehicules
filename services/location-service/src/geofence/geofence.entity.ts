import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity('geofence_zones')
export class GeofenceZone {

    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'varchar', length: 100 })
    name: string;

    @Column({ name: 'center_lat', type: 'double precision' })
    centerLat: number;

    @Column({ name: 'center_lon', type: 'double precision' })
    centerLon: number;

    /** Rayon de la zone en mètres */
    @Column({ name: 'radius_m', type: 'real' })
    radiusM: number;

    @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
    createdAt: Date;
}
