import { Request } from 'express';
import { GraphQLServer } from 'graphql-yoga';

import { createContext } from './context';


const server = new GraphQLServer({
    typeDefs: './src/schema.graphql',
    // resolvers,
    context: (request: Request) => createContext(request),
    // fragmentReplacements
});

server.start(() => {
    console.log('running');
});
