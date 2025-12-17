import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/db';
import { AppError } from '../utils/AppError';

const signToken = (id: number) => {
    const secret = process.env.JWT_SECRET || 'fallback-secret-for-dev-only';
    return jwt.sign({ id }, secret, {
        expiresIn: '7d',
    });
};

export const register = async (data: any) => {
    const { name, email, password } = data;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
        throw new AppError('Email already in use', 400);
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const newUser = await prisma.user.create({
        data: {
            name,
            email,
            password: hashedPassword,
        },
    });

    const token = signToken(newUser.id);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _, ...userWithoutPassword } = newUser;

    return { user: userWithoutPassword, token };
};

export const login = async (data: any) => {
    const { email, password } = data;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !(await bcrypt.compare(password, user.password))) {
        throw new AppError('Invalid email or password', 401);
    }

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET as string, { expiresIn: '1d' });
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _, ...userWithoutPassword } = user;

    return { user: userWithoutPassword, token };
};

export const updateUser = async (userId: number, data: { name?: string; email?: string }) => {
    if (data.email) {
        const existing = await prisma.user.findUnique({ where: { email: data.email } });
        if (existing && existing.id !== userId) {
            throw new AppError('Email already in use', 400);
        }
    }
    const user = await prisma.user.update({
        where: { id: userId },
        data
    });
    return user;
};
