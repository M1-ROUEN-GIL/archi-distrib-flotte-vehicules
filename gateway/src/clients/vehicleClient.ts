import { assertOk } from '../http/graphqlHttpError.js';
import {
  mapAssignmentFromApi,
  mapVehicleFromApi,
  type VehicleApi,
} from '../mappers/vehicle.js';
import { fuelTypeToRest, vehicleStatusToRest } from '../mappers/enums.js';

export function createVehicleClient(
  fetchSvc: (path: string, init?: RequestInit) => Promise<Response>,
) {
  return {
    async listVehicles(params: {
      status?: string | null;
      limit?: number | null;
      offset?: number | null;
    }) {
      const q = new URLSearchParams();
      if (params.status)
        q.set('status', vehicleStatusToRest(params.status));
      if (params.limit != null) q.set('limit', String(params.limit));
      if (params.offset != null) q.set('offset', String(params.offset));
      const qs = q.toString();
      const res = await fetchSvc(`/vehicles${qs ? `?${qs}` : ''}`);
      await assertOk(res, 'GET /vehicles');
      const page = (await res.json()) as {
        items: VehicleApi[];
        total: number;
        limit: number;
        offset: number;
      };
      return {
        ...page,
        items: page.items.map(mapVehicleFromApi),
      };
    },

    async getVehicle(id: string) {
      const res = await fetchSvc(`/vehicles/${encodeURIComponent(id)}`);
      if (res.status === 404) return null;
      await assertOk(res, 'GET /vehicles/:id');
      return mapVehicleFromApi((await res.json()) as VehicleApi);
    },

    async createVehicle(input: {
      plate_number: string;
      brand: string;
      model: string;
      fuel_type: string;
      mileage_km: number;
      vin?: string | null;
      color?: string | null;
    }) {
      const body = {
        plate_number: input.plate_number,
        brand: input.brand,
        model: input.model,
        fuel_type: fuelTypeToRest(input.fuel_type),
        mileage_km: input.mileage_km,
        vin: input.vin ?? undefined,
        color: input.color ?? undefined,
      };
      const res = await fetchSvc('/vehicles', {
        method: 'POST',
        body: JSON.stringify(body),
      });
      await assertOk(res, 'POST /vehicles');
      return mapVehicleFromApi((await res.json()) as VehicleApi);
    },

    async updateVehicleStatus(id: string, status: string) {
      const res = await fetchSvc(
        `/vehicles/${encodeURIComponent(id)}/status`,
        {
          method: 'PATCH',
          body: JSON.stringify({
            status: vehicleStatusToRest(status),
          }),
        },
      );
      await assertOk(res, 'PATCH /vehicles/:id/status');
      return mapVehicleFromApi((await res.json()) as VehicleApi);
    },

    async assignVehicle(
      vehicle_id: string,
      driver_id: string,
      notes?: string | null,
    ) {
      const res = await fetchSvc(
        `/vehicles/${encodeURIComponent(vehicle_id)}/assignments`,
        {
          method: 'POST',
          body: JSON.stringify({
            driver_id,
            notes: notes ?? undefined,
          }),
        },
      );
      await assertOk(res, 'POST /vehicles/:id/assignments');
      return mapAssignmentFromApi((await res.json()) as Record<string, unknown>);
    },

    async unassignVehicle(vehicle_id: string) {
      const res = await fetchSvc(
        `/vehicles/${encodeURIComponent(vehicle_id)}/assignments/current`,
        { method: 'DELETE' },
      );
      await assertOk(res, 'DELETE /vehicles/:id/assignments/current');
      return mapAssignmentFromApi((await res.json()) as Record<string, unknown>);
    },
  };
}
