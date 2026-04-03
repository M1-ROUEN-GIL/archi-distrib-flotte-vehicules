import { GraphQLContext } from '../context.js';

export const driverResolvers = {
  Query: {
    drivers: async (_: unknown, args: { status?: string | null; limit?: number | null; offset?: number | null }, ctx: GraphQLContext) => {
      const response = await ctx.driver.listDrivers(args);
      // If the service returns a direct array, we wrap it into a page object as expected by the schema
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
  },
  Driver: {
    license: async (parent: { id: string }, _: unknown, ctx: GraphQLContext) => {
      const licenses = await ctx.driver.getLicenses(parent.id);
      return licenses && licenses.length > 0 ? licenses[0] : null;
    },
  }
};
