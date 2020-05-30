import { extractFragmentReplacements } from 'prisma-binding';

const resolvers = {

};

const fragmentReplacements = extractFragmentReplacements(resolvers);

export {
    resolvers,
    fragmentReplacements
}