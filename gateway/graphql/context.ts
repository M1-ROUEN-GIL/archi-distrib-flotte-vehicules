import axios, { AxiosInstance } from 'axios';

const VEHICLE_SERVICE_URL = process.env.VEHICLE_SERVICE_URL || 'http://vehicle-service:8080';
const DRIVER_SERVICE_URL = process.env.DRIVER_SERVICE_URL || 'http://driver-service:8080';
const MAINTENANCE_SERVICE_URL = process.env.MAINTENANCE_SERVICE_URL || 'http://maintenance-service:8082';

export interface GraphQLContext {
  vehicle: VehicleClient;
  driver: DriverClient;
  maintenance: MaintenanceClient;
}

class BaseClient {
  protected http: AxiosInstance;
  constructor(baseURL: string) {
    this.http = axios.create({ baseURL });
  }
}

class VehicleClient extends BaseClient {
  async listVehicles(params: any) {
    const { data } = await this.http.get('/api/vehicles', { params });
    return data;
  }
  async getVehicle(id: string) {
    const { data } = await this.http.get(`/api/vehicles/${id}`);
    return data;
  }
  async createVehicle(input: any) {
    const { data } = await this.http.post('/api/vehicles', input);
    return data;
  }
  async updateVehicle(id: string, input: any) {
    const { data } = await this.http.put(`/api/vehicles/${id}`, input);
    return data;
  }
  async updateVehicleStatus(id: string, status: string) {
    const { data } = await this.http.patch(`/api/vehicles/${id}/status`, { status });
    return data;
  }
  async deleteVehicle(id: string) {
    await this.http.delete(`/api/vehicles/${id}`);
    return true;
  }
  async assignVehicle(vehicleId: string, driverId: string, notes?: string) {
    const { data } = await this.http.post(`/api/vehicles/${vehicleId}/assignments`, { driver_id: driverId, notes });
    return data;
  }
  async unassignVehicle(vehicleId: string) {
    const { data } = await this.http.delete(`/api/vehicles/${vehicleId}/assignments/current`);
    return data;
  }
  async getAssignments(vehicleId: string) {
    const { data } = await this.http.get(`/api/vehicles/${vehicleId}/assignments`);
    return data;
  }
}

class DriverClient extends BaseClient {
  async listDrivers(params: any) {
    const { data } = await this.http.get('/drivers', { params });
    return data;
  }
  async getDriver(id: string) {
    const { data } = await this.http.get(`/drivers/${id}`);
    return data;
  }
  async createDriver(input: any) {
    const { data } = await this.http.post('/drivers', input);
    return data;
  }
  async updateDriverStatus(id: string, status: string) {
    const { data } = await this.http.patch(`/drivers/${id}/status`, { status });
    return data;
  }
  async getLicenses(driverId: string) {
    const { data } = await this.http.get(`/drivers/${driverId}/licenses`);
    return data;
  }
}

class MaintenanceClient extends BaseClient {
  async listRecords(params: any) {
    const { data } = await this.http.get('/api/maintenance', { params });
    return data;
  }
  async getRecord(id: string) {
    const { data } = await this.http.get(`/api/maintenance/${id}`);
    return data;
  }
  async createRecord(input: any) {
    const { data } = await this.http.post('/api/maintenance', input);
    return data;
  }
  async updateStatus(id: string, input: any) {
    const { data } = await this.http.patch(`/api/maintenance/${id}/status`, input);
    return data;
  }
}

export const createContext = (): GraphQLContext => ({
  vehicle: new VehicleClient(VEHICLE_SERVICE_URL),
  driver: new DriverClient(DRIVER_SERVICE_URL),
  maintenance: new MaintenanceClient(MAINTENANCE_SERVICE_URL),
});
