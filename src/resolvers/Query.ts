import { Context } from '../context';

export const Query = {
    users(parent: any, args: any, { prisma }: Context, info: any) {
        return prisma.user.findMany();
    }
};