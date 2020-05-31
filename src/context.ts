import { PrismaClient } from '@prisma/client';
import { Request } from 'express';

export const prisma = new PrismaClient();

export interface Context {
    prisma: PrismaClient,
    request: any
}
export function createContext(request: Request): Context {
    return { prisma, request }
}