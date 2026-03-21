export const config = {
  port: parseInt(process.env.PORT ?? '4000', 10),
  vehicleServiceUrl: process.env.VEHICLE_SERVICE_URL ?? 'http://localhost:8080',
  driverServiceUrl: process.env.DRIVER_SERVICE_URL ?? 'http://localhost:8081',
};
