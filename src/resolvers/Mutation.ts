import bcrypt from 'bcryptjs';

import { Context } from '../context';
import { generateToken } from '../utils/generateToken';
import { getUserId } from '../utils/getUserId';
import { hashPassword } from '../utils/hashPassword';

export const Mutation = {
    async createUser(parent: any, args: { data: any }, { prisma }: Context, info: any) {
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
    async loginUser(parent: any, args: { data: any }, { prisma }: Context, info: any) {
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
    async updateUser(parent: any, args: { data: any }, { prisma, request }: Context, info: any) {
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
}