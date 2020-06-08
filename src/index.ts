import { Request } from 'express';
import { GraphQLServer } from 'graphql-yoga';

import { createContext } from './context';
import { resolvers } from './resolvers';


const server = new GraphQLServer({
    typeDefs: './src/schema.graphql',
    resolvers,
    context: (request: Request) => createContext(request),
});

server.start(() => {
    console.log('running');
});
