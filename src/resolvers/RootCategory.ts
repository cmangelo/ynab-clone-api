import { Category, RootCategory as RootCategoryModel } from '@prisma/client';

import { Context } from '../context';

export const RootCategory = {
    async available(parent: RootCategoryModel & { categories?: Category[]; }, args: any, { prisma, request }: Context) {
        const categories = parent.categories
            ? parent.categories
            : await prisma.category.findMany({ where: { parentId: parent.id } });
        return categories.reduce((acc: number, category: Category) => acc + category.available, 0);
    },
    async budgeted(parent: RootCategoryModel & { categories?: Category[]; }, args: any, { prisma, request }: Context) {
        const categories = parent.categories
            ? parent.categories
            : await prisma.category.findMany({ where: { parentId: parent.id } });
        return categories.reduce((acc: number, category: Category) => acc + category.budgeted, 0);
    }
};