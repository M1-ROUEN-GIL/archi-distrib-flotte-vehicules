import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadFilesSync } from '@graphql-tools/load-files';
import { mergeTypeDefs } from '@graphql-tools/merge';
import { makeExecutableSchema } from '@graphql-tools/schema';
import { resolvers } from './resolvers/index.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const typeDefs = mergeTypeDefs(
  loadFilesSync(path.join(__dirname, '../graphql/**/*.graphql')),
);

export const schema = makeExecutableSchema({ typeDefs, resolvers });
