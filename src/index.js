import { GraphQLServer } from 'graphql-yoga';

import prisma from './prisma';
import { fragmentReplacements, resolvers } from './resolvers';

const server = new GraphQLServer({
    typeDefs: './src/schema.graphql',
    resolvers,
    context(request) {
        return {
            prisma,
            request
        }
    },
    fragmentReplacements
});

server.start(() => {
    console.log('running');
});