import type { GraphQLContext } from '../context.js';

export const alertResolvers = {
  Query: {
    alerts: async (
      _: unknown,
      args: {
        status?: string | null;
        severity?: string | null;
        vehicle_id?: string | null;
        limit?: number | null;
        offset?: number | null;
      },
      ctx: GraphQLContext,
    ) => {
      const params: Record<string, any> = {};
      if (args.status) params.status = args.status;
      if (args.severity) params.severity = args.severity;
      if (args.vehicle_id) params.vehicleId = args.vehicle_id;

      const items: any[] = await ctx.events.listAlerts(params);

      // Pagination côté gateway (le service renvoie une liste plate)
      const offset = args.offset ?? 0;
      const limit = args.limit ?? 20;
      const paginated = items.slice(offset, offset + limit);
      return { items: paginated, total_count: items.length };
    },

    alert: async (_: unknown, args: { id: string }, ctx: GraphQLContext) => {
      return ctx.events.getAlert(args.id);
    },
  },

  Mutation: {
    acknowledgeAlert: async (_: unknown, args: { id: string }, ctx: GraphQLContext) => {
      return ctx.events.acknowledgeAlert(args.id);
    },

    resolveAlert: async (_: unknown, args: { id: string }, ctx: GraphQLContext) => {
      return ctx.events.resolveAlert(args.id);
    },
  },

  Alert: {
    // Résolution des champs imbriqués Vehicle et Driver
    vehicle: async (
      parent: { vehicle_id?: string | null },
      _: unknown,
      ctx: GraphQLContext,
    ) => {
      if (!parent.vehicle_id) return null;
      try {
        return await ctx.vehicle.getVehicle(String(parent.vehicle_id));
      } catch {
        return null;
      }
    },

    driver: async (
      parent: { driver_id?: string | null },
      _: unknown,
      ctx: GraphQLContext,
    ) => {
      if (!parent.driver_id) return null;
      try {
        return await ctx.driver.getDriver(String(parent.driver_id));
      } catch {
        return null;
      }
    },
  },
};
