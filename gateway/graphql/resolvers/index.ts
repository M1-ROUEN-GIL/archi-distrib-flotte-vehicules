import { GraphQLError } from 'graphql';
import { vehicleResolvers } from './vehicleResolvers.js';
import { maintenanceResolvers } from './maintenanceResolvers.js';
import { driverResolvers } from './driverResolvers.js';
import { alertResolvers } from './alertResolvers.js';
import { locationResolvers } from './locationResolvers.js';

function subscriptionDisabled(name: string): never {
  throw new GraphQLError(
    `Subscription « ${name} » : non activée sur ce gateway (WebSocket / graphql-ws à brancher).`,
    { extensions: { code: 'SUBSCRIPTIONS_DISABLED' } },
  );
}

export const resolvers = {
  Query: {
    ...vehicleResolvers.Query,
    ...maintenanceResolvers.Query,
    ...driverResolvers.Query,
    ...alertResolvers.Query,
    ...locationResolvers.Query,
  },
  Mutation: {
    ...vehicleResolvers.Mutation,
    ...maintenanceResolvers.Mutation,
    ...driverResolvers.Mutation,
    ...alertResolvers.Mutation,
  },
  Subscription: {
    vehicleStatusChanged:    { subscribe: () => subscriptionDisabled('vehicleStatusChanged') },
    vehicleLocationUpdated:  { subscribe: () => subscriptionDisabled('vehicleLocationUpdated') },
    alertCreated:            { subscribe: () => subscriptionDisabled('alertCreated') },
    alertCreatedBySeverity:  { subscribe: () => subscriptionDisabled('alertCreatedBySeverity') },
  },
  Vehicle: vehicleResolvers.Vehicle,
  MaintenanceRecord: maintenanceResolvers.MaintenanceRecord,
  Assignment: vehicleResolvers.Assignment,
  Alert: alertResolvers.Alert,
  Driver: {
    ...vehicleResolvers.Driver,
    ...driverResolvers.Driver,
  },
};
