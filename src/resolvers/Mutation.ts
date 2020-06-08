import bcrypt from 'bcryptjs';

import { Context } from '../context';
import { generateToken } from '../utils/generateToken';
import { getUserId } from '../utils/getUserId';
import { hashPassword } from '../utils/hashPassword';

export const Mutation = {
    async createUser(parent: any, args: { data: any }, { prisma }: Context) {
        const password = await hashPassword(args.data.password);
        const user = await prisma.user.create({
            data: {
                ...args.data,
                password
            }
        });
        return {
            user,
            token: generateToken(user.id)
        }
    },
    async loginUser(parent: any, args: { data: any }, { prisma }: Context) {
        const user = await prisma.user.findOne({
            where: {
                email: args.data.email
            }
        });

        if (!user)
            throw new Error('Invalid email or password');

        const isMatch = await bcrypt.compare(args.data.password, user.password);
        if (!isMatch)
            throw new Error('Invalid email or password');
        return {
            user,
            token: generateToken(user.id)
        };
    },
    async updateUser(parent: any, args: { data: any }, { prisma, request }: Context) {
        const userId = getUserId(request) as number;
        if (typeof args.data.password === 'string')
            args.data.password = await hashPassword(args.data.password);

        return prisma.user.update({
            where: {
                id: userId
            },
            data: args.data
        });
    },
    async createAccount(parent: any, { data }: any, { prisma, request }: Context) {
        const userId = getUserId(request) as number;

        const budgetExists = await prisma.budget.count({
            where: {
                id: data.budgetId,
                userId
            }
        });

        if (!budgetExists)
            throw new Error('Budget does not exist');

        return prisma.account.create({
            data: {
                budget: {
                    connect: {
                        id: data.budgetId
                    }
                },
                balance: data.balance,
                workingBalance: data.balance,
                name: data.name,
            }
        });
    },
    async createTransaction(parent: any, { data }: any, { prisma, request }: Context) {
        const userId = getUserId(request) as number;
        const accountId = data.accountId;
        const date = new Date(data.date).toISOString();
        delete data.accountId;

        const accountExists = await prisma.account.count({
            where: {
                id: accountId,
                budget: { userId }
            }
        }) > 0;

        if (!accountExists)
            throw new Error('Could not create transaction for this account');

        let sumOfSlices = 0;
        const categoryAmounts: { [key: number]: number } = {};
        const slices: any = [];
        for (let i = 0; i < data.slices.length; i++) {
            const slice = data.slices[i];
            const category = await prisma.category.findMany({
                where: {
                    id: slice.categoryId,
                    parent: {
                        budget: {
                            userId
                        }
                    }
                }
            });
            if (category.length === 0)
                throw new Error('Category does not exist');

            const payee = await prisma.payee.findMany({
                where: {
                    id: slice.payeeId,
                    userId
                }
            });
            if (payee.length === 0)
                throw new Error('Payee does not exist')

            categoryAmounts[slice.categoryId] = categoryAmounts[slice.categoryId]
                ? categoryAmounts[slice.categoryId] - slice.amount
                : category[0].available - slice.amount;

            sumOfSlices += slice.amount;
            slices.push({
                amount: slice.amount,
                category: {
                    connect: {
                        id: slice.categoryId
                    }
                },
                payee: {
                    connect: {
                        id: slice.payeeId
                    }
                }
            });
        }

        if (sumOfSlices !== data.amount)
            throw new Error('Sum of slices does not equal total of transaction');

        const categoryKeys = Object.keys(categoryAmounts);
        for (let i = 0; i < categoryKeys.length; i++) {
            const categoryId = parseInt(categoryKeys[i]);
            await prisma.category.update({
                where: { id: categoryId },
                data: {
                    available: categoryAmounts[categoryId]
                }
            })
        }

        return prisma.transaction.create({
            data: {
                ...data,
                date,
                account: {
                    connect: { id: accountId }
                },
                slices: {
                    create: slices
                }
            }, include: {
                slices: true
            }
        });
    },
    async createRootCategory(parent: any, { data }: any, { prisma, request }: Context) {
        const userId = getUserId(request) as number;

        const budgetExists = await prisma.budget.count({
            where: {
                userId
            }
        }) > 0;

        return prisma.rootCategory.create({
            data: {
                ...data,
                budget: data.budgetId
            }
        });
    },
    async updateRootCategory(parent: any, { data }: any, { prisma, request }: Context) {
        const userId = getUserId(request) as number;
        const rootCategoryExists = await prisma.rootCategory.count({
            where: {
                id: data.id,
                budget: { userId }
            }
        }) > 0;

        if (!rootCategoryExists)
            throw new Error('Could not update root category');

        return prisma.rootCategory.update({
            where: { id: data.id },
            data
        });
    },
    async createCategory(parent: any, { data }: any, { prisma, request }: Context) {
        const userId = getUserId(request) as number;

        const rootCategoryExists = await prisma.rootCategory.count({
            where: {
                budget: { userId },
                id: data.parent
            }
        }) > 0;

        if (!rootCategoryExists)
            throw new Error('Parent category does not exist');

        return prisma.category.create({
            data: {
                ...data,
                parent: {
                    connect: {
                        id: data.parent
                    }
                }
            }
        });
    },
    createPayee(parent: any, { data }: any, { prisma, request }: Context) {
        const userId = getUserId(request) as number;
        return prisma.payee.create({
            data: {
                ...data,
                user: {
                    connect: {
                        id: userId
                    }
                }
            }
        });
    },
    async updatePayee(parent: any, { data }: any, { prisma, request }: Context) {
        const userId = getUserId(request) as number;
        const payeeExists = await prisma.payee.count({ where: { id: data.id, userId } }) > 0;
        if (!payeeExists)
            throw new Error('Could not update payee');
        return prisma.payee.update({
            where: { id: data.id },
            data
        });
    },
    async updateCategory(parent: any, { data }: any, { prisma, request }: Context) {
        const userId = getUserId(request) as number;
        const categoryExists = await prisma.category.count({
            where: {
                id: data.id,
                parent: {
                    budget: {
                        userId
                    }
                }
            }
        }) > 0;

        if (!categoryExists)
            throw new Error('Could not update category');

        return prisma.category.update({
            where: { id: data.id },
            data
        });
    }
}