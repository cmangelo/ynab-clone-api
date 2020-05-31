import { extractFragmentReplacements } from 'prisma-binding';

import { Mutation } from './Mutation';
import { Query } from './Query';

export const resolvers = {
    Query,
    Mutation
};

const fragmentReplacements = extractFragmentReplacements(resolvers);