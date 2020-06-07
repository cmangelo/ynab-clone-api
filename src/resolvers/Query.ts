import { Context } from '../context';
import { getUserId } from '../utils/getUserId';

export const Query = {
    user(parent: any, args: any, { prisma, request }: Context, info: any) {
        const userId = getUserId(request) as number;
        return prisma.user.findOne({ where: { id: userId } });
    },
    users(parent: any, args: any, { prisma }: Context) {
        return prisma.user.findMany();
    },
    accounts(parent: any, args: any, { prisma, request }: Context, info: any) {
        const userId = getUserId(request) as number;
        return prisma.account.findMany({
            where: { userId },
            include: { user: true }
        });
    },
    //be able to filter transactions by account, payee, category
    transactions(parent: any, { query }: any, { prisma, request }: Context) {
        //need to use this to make sure they have access to the account or payee that they're trying to get transactions for
        const userId = getUserId(request) as number;

        const args = Object.keys(query).map(key => {
            return {
                [key]: query[key]
            }
        });

        return prisma.transaction.findMany({
            where: {
                AND: args
            },
            include: {
                slices: {
                    include: {
                        payee: true,
                        category: true
                    }
                }
            }
        });
    },
    payees(parent: any, args: any, { prisma, request }: Context) {
        const userId = getUserId(request) as number;
        return prisma.payee.findMany({ where: { userId } });
    },
    rootCategories(parent: any, args: any, { prisma, request }: Context, info: any) {
        const userId = getUserId(request) as number;
        return prisma.rootCategory.findMany({
            where: { userId },
            include: { categories: true }
        });
    }
};