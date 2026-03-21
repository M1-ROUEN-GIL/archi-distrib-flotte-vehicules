import type { Request } from 'express';
import { config } from './config.js';
import { createServiceFetch } from './http/serviceFetch.js';
import { createVehicleClient } from './clients/vehicleClient.js';
import { createDriverClient } from './clients/driverClient.js';

export type GraphQLContext = {
  req: Request;
  vehicle: ReturnType<typeof createVehicleClient>;
  driver: ReturnType<typeof createDriverClient>;
};

export function buildContext(req: Request): GraphQLContext {
  const auth = () => {
    const h = req.headers.authorization;
    return typeof h === 'string' ? h : undefined;
  };
  const vehicleFetch = createServiceFetch(config.vehicleServiceUrl, auth);
  const driverFetch = createServiceFetch(config.driverServiceUrl, auth);
  return {
    req,
    vehicle: createVehicleClient(vehicleFetch),
    driver: createDriverClient(driverFetch),
  };
}
