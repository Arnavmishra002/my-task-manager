import * as AuthService from '../services/auth.service';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/db';

// Mock dependencies
jest.mock('../config/db', () => ({
    prisma: {
        user: {
            create: jest.fn(),
            findUnique: jest.fn(),
        },
    },
}));

jest.mock('bcryptjs');
jest.mock('jsonwebtoken');

describe('AuthService', () => {
    describe('register', () => {
        it('should hash password and create user', async () => {
            const mockUser = { id: 1, name: 'Test', email: 'test@test.com', password: 'hashedpassword' };
            (bcrypt.hash as jest.Mock).mockResolvedValue('hashedpassword');
            (prisma.user.findUnique as jest.Mock).mockResolvedValue(null); // No existing user
            (prisma.user.create as jest.Mock).mockResolvedValue(mockUser);
            (jwt.sign as jest.Mock).mockReturnValue('mocktoken');

            const result = await AuthService.register({ name: 'Test', email: 'test@test.com', password: 'password123' });

            expect(bcrypt.hash).toHaveBeenCalledWith('password123', 12);
            expect(prisma.user.create).toHaveBeenCalled();
            expect(result).toHaveProperty('token', 'mocktoken');
            const { password, ...expectedUser } = mockUser;
            expect(result.user).toEqual(expectedUser);
        });

        it('should throw error if user already exists', async () => {
            (prisma.user.findUnique as jest.Mock).mockResolvedValue({ id: 1 });

            await expect(AuthService.register({ name: 'Test', email: 'test@test.com', password: 'pass' }))
                .rejects
                .toThrow('Email already in use');
        });
    });

    describe('login', () => {
        it('should return token for valid credentials', async () => {
            const mockUser = { id: 1, email: 'test@test.com', password: 'hashedpassword' };
            (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
            (bcrypt.compare as jest.Mock).mockResolvedValue(true);
            (jwt.sign as jest.Mock).mockReturnValue('mocktoken');

            const result = await AuthService.login({ email: 'test@test.com', password: 'password123' });
            expect(result.token).toBe('mocktoken');
        });

        it('should throw error for invalid password', async () => {
            const mockUser = { id: 1, email: 'test@test.com', password: 'hashedpassword' };
            (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
            (bcrypt.compare as jest.Mock).mockResolvedValue(false);

            await expect(AuthService.login({ email: 'test@test.com', password: 'wrongpass' }))
                .rejects
                .toThrow('Invalid email or password');
        });
    });
});
