import { Prisma } from 'prisma-binding';

import { fragmentReplacements } from './resolvers';

const prisma = new Prisma({
    typeDefs: 'src/generated/prisma.graphql',
    endpoint: 'http://192.168.100:4466',
    secret: '3234w3epa0239rne0awf',
    fragmentReplacements
});

export {
    prisma as
    default
};