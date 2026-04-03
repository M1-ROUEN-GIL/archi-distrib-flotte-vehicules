-- =============================================================
-- DONNÉES DE TEST — vehicle-service
-- Les id sont fixes pour référence croisée (maintenance, tests d’intégration).
-- =============================================================

INSERT INTO vehicles (id, plate_number, brand, model, fuel_type, mileage_km, status, vin, payload_capacity_kg, cargo_volume_m3)
VALUES
    ('10000000-0000-4000-8000-000000000001', 'DH-001-LR', 'Mercedes', 'Sprinter 314 CDI', 'diesel', 12000, 'available', 'WDB9066351S000001', 1200, 12.0),
    ('10000000-0000-4000-8000-000000000002', 'DH-002-LR', 'Renault',  'Master L3H2',      'diesel',  8500, 'available', 'VF1MA000000000002', 1100, 13.0),
    ('10000000-0000-4000-8000-000000000003', 'DH-003-LR', 'Ford',     'Transit Custom',   'diesel', 35000, 'in_maintenance', 'WF0XXXTTGXKU00003', 1000, 10.0),
    ('10000000-0000-4000-8000-000000000004', 'DH-004-LR', 'Peugeot',  'e-Expert',         'electric', 5000, 'available', 'VF3VBHMPXKZ000004', 900, 11.0),
    ('10000000-0000-4000-8000-000000000005', 'DH-005-LR', 'Mercedes', 'Vito 114 CDI',     'diesel', 67000, 'out_of_service', 'WDF6382031K000005', 800, 8.0)
    ON CONFLICT (plate_number) DO NOTHING;