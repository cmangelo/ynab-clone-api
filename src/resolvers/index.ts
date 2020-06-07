import { extractFragmentReplacements } from 'prisma-binding';

import { Mutation } from './Mutation';
import { Query } from './Query';

export const resolvers = {
    Query,
    Mutation
};

export const fragmentReplacements = extractFragmentReplacements(resolvers);