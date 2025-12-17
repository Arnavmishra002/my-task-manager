import { Request, Response, NextFunction } from 'express';
import * as AuthService from '../services/auth.service';
import { prisma } from '../config/db';
import { AppError } from '../utils/AppError';

export const register = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { name, email, password } = req.body;
        const result = await AuthService.register({ name, email, password });
        res.status(201).json({
            status: 'success',
            token: result.token,
            data: { user: result.user }
        });
    } catch (error) {
        next(error);
    }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email, password } = req.body;
        const result = await AuthService.login({ email, password });
        res.status(200).json({
            status: 'success',
            token: result.token,
            data: { user: result.user }
        });
    } catch (error) {
        next(error);
    }
};

export const getMe = async (req: Request, res: Response) => {
    const user = await prisma.user.findUnique({ where: { id: (req as any).user.id } });
    res.status(200).json({ status: 'success', data: { user } });
};

export const updateProfile = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = (req as any).user.id;
        const { name, email } = req.body;
        const updatedUser = await AuthService.updateUser(userId, { name, email });
        res.status(200).json({ status: 'success', data: { user: updatedUser } });
    } catch (error) {
        next(error);
    }
};
