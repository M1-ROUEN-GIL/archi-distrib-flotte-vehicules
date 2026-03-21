const REST_VEHICLE_STATUS = new Map<string, string>([
  ['available', 'AVAILABLE'],
  ['on_delivery', 'ON_DELIVERY'],
  ['in_maintenance', 'IN_MAINTENANCE'],
  ['out_of_service', 'OUT_OF_SERVICE'],
]);

const GRAPH_VEHICLE_STATUS = new Map<string, string>([
  ['AVAILABLE', 'available'],
  ['ON_DELIVERY', 'on_delivery'],
  ['IN_MAINTENANCE', 'in_maintenance'],
  ['OUT_OF_SERVICE', 'out_of_service'],
]);

const REST_FUEL = new Map<string, string>([
  ['gasoline', 'GASOLINE'],
  ['diesel', 'DIESEL'],
  ['electric', 'ELECTRIC'],
  ['hybrid', 'HYBRID'],
]);

const GRAPH_FUEL = new Map<string, string>([
  ['GASOLINE', 'gasoline'],
  ['DIESEL', 'diesel'],
  ['ELECTRIC', 'electric'],
  ['HYBRID', 'hybrid'],
]);

const REST_DRIVER_STATUS = new Map<string, string>([
  ['active', 'ACTIVE'],
  ['on_leave', 'ON_LEAVE'],
  ['suspended', 'SUSPENDED'],
  ['inactive', 'INACTIVE'],
]);

export function vehicleStatusToGraphql(rest: string): string {
  return REST_VEHICLE_STATUS.get(rest) ?? rest.toUpperCase();
}

export function vehicleStatusToRest(graphql: string): string {
  return GRAPH_VEHICLE_STATUS.get(graphql) ?? graphql.toLowerCase();
}

export function fuelTypeToGraphql(rest: string): string {
  return REST_FUEL.get(rest) ?? rest.toUpperCase();
}

export function fuelTypeToRest(graphql: string): string {
  return GRAPH_FUEL.get(graphql) ?? graphql.toLowerCase();
}

export function driverStatusToGraphql(rest: string): string {
  return REST_DRIVER_STATUS.get(rest) ?? rest.toUpperCase();
}
