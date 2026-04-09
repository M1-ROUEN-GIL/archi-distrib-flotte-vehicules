import { GraphQLError } from 'graphql';

function notImplemented(field: string): never {
  throw new GraphQLError(
    `« ${field} » : pas encore relié au microservice (voir resolvers).`,
    { extensions: { code: 'NOT_IMPLEMENTED' } },
  );
}

function subscriptionDisabled(name: string): never {
  throw new GraphQLError(
    `Subscription « ${name} » : non activée sur ce gateway (WebSocket / graphql-ws à brancher).`,
    { extensions: { code: 'SUBSCRIPTIONS_DISABLED' } },
  );
}

export const stubResolvers = {
  Query: {
    // alerts et alert → branchés sur alertResolvers
    vehicleLocation: () => notImplemented('vehicleLocation'),
    locationHistory: () => notImplemented('locationHistory'),
  },
  Mutation: {
    // acknowledgeAlert, resolveAlert → branchés sur alertResolvers
  },
  Subscription: {
    vehicleStatusChanged: {
      subscribe: () => subscriptionDisabled('vehicleStatusChanged'),
    },
    vehicleLocationUpdated: {
      subscribe: () => subscriptionDisabled('vehicleLocationUpdated'),
    },
    alertCreated: {
      subscribe: () => subscriptionDisabled('alertCreated'),
    },
    alertCreatedBySeverity: {
      subscribe: () => subscriptionDisabled('alertCreatedBySeverity'),
    },
  },
};
