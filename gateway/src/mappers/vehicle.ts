import { fuelTypeToGraphql, vehicleStatusToGraphql } from './enums.js';

export type VehicleApi = Record<string, unknown>;

export function mapVehicleFromApi(v: VehicleApi) {
  return {
    ...v,
    fuel_type: fuelTypeToGraphql(String(v.fuel_type ?? '')),
    status: vehicleStatusToGraphql(String(v.status ?? '')),
  };
}

export function mapAssignmentFromApi(a: Record<string, unknown>) {
  return { ...a };
}
