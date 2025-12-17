import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AppError } from '../utils/AppError';
import { prisma } from '../config/db';

interface JwtPayload {
    id: number;
}

declare global {
    namespace Express {
        interface Request {
            user?: {
                id: number;
            };
        }
    }
}

export const protect = async (req: Request, res: Response, next: NextFunction) => {
    let token;

    if (
        req.headers['authorization'] &&
        req.headers['authorization'].startsWith('Bearer')
    ) {
        token = req.headers['authorization'].split(' ')[1];
    } else if (req.cookies?.jwt) { // Assuming cookie-parser is used
        token = req.cookies.jwt;
    }

    if (!token) {
        return next(new AppError('You are not logged in! Please log in to get access.', 401));
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as JwtPayload;

        const currentUser = await prisma.user.findUnique({
            where: { id: decoded.id },
        });

        if (!currentUser) {
            return next(new AppError('The user belonging to this token no longer does exist.', 401));
        }

        req.user = { id: currentUser.id };
        next();
    } catch (error) {
        return next(new AppError('Invalid token. Please log in again!', 401));
    }
};
