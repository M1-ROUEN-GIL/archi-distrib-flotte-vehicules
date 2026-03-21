import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@as-integrations/express4';
import cors from 'cors';
import express from 'express';
import { config } from './config.js';
import { buildContext } from './context.js';
import { schema } from './schema.js';

async function main() {
  const app = express();
  const server = new ApolloServer({ schema });
  await server.start();

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok' });
  });

  app.use(
    '/graphql',
    cors(),
    express.json(),
    expressMiddleware(server, {
      context: async ({ req }) => buildContext(req),
    }),
  );

  app.listen(config.port, () => {
    console.log(
      `Gateway GraphQL http://localhost:${config.port}/graphql (véhicules → ${config.vehicleServiceUrl})`,
    );
  });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
