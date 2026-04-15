import { GraphQLContext } from '../context.js';

export const driverResolvers = {
  Query: {
    drivers: async (_: unknown, args: { status?: string | null; limit?: number | null; offset?: number | null }, ctx: GraphQLContext) => {
      const response = await ctx.driver.listDrivers(args);
      // Si le service retourne un tableau direct, on l'enveloppe dans un objet page
      if (Array.isArray(response)) {
        return {
          items: response,
          total_count: response.length,
        };
      }
      return response;
    },
    driver: async (_: unknown, args: { id: string }, ctx: GraphQLContext) => {
      return ctx.driver.getDriver(args.id);
    },
  },

  Mutation: {
    createDriver: async (_: unknown, args: any, ctx: GraphQLContext) => {
      return ctx.driver.createDriver(args);
    },
    updateDriverStatus: async (_: unknown, args: { id: string; status: string }, ctx: GraphQLContext) => {
      return ctx.driver.updateDriverStatus(args.id, args.status);
    },

    // 👇 TES NOUVEAUX RESOLVERS COMMENCENT ICI 👇

    updateDriver: async (_: unknown, args: any, ctx: GraphQLContext) => {
      // On sépare l'ID du reste des données à modifier
      const { id, ...payload } = args;
      // On suppose que ta classe/ton service s'appelle updateDriver(id, body)
      return ctx.driver.updateDriver(id, payload);
    },

    deleteDriver: async (_: unknown, args: { id: string }, ctx: GraphQLContext) => {
      await ctx.driver.deleteDriver(args.id);
      // Le back Spring Boot renvoie 204 No Content, donc on renvoie juste true côté GraphQL
      return true;
    },

    addLicenseToDriver: async (_: unknown, args: any, ctx: GraphQLContext) => {
      // On sépare le driver_id du reste des informations du permis
      const { driver_id, ...licenseData } = args;
      return ctx.driver.addLicenseToDriver(driver_id, licenseData);
    }
  },

  Driver: {
    license: async (parent: { id: string }, _: unknown, ctx: GraphQLContext) => {
      const licenses = await ctx.driver.getLicenses(parent.id);
      return licenses && licenses.length > 0 ? licenses[0] : null;
    },
  }
};