import { prisma } from '../config/db';
import { AppError } from '../utils/AppError';

/**
 * Creates a new task and links it to the creator.
 * If assignedToId is provided, it links to that user as well.
 * @param data Task data (title, desc, etc.)
 * @param userId ID of the creator
 */
export const createTask = async (data: any, userId: number) => {
    return await prisma.task.create({
        data: {
            ...data,
            creatorId: userId,
        },
        include: {
            assignedTo: { select: { id: true, name: true, email: true } },
            creator: { select: { id: true, name: true, email: true } },
        }
    });
};

/**
 * Retrieves tasks based on filters (status, priority, assignment).
 * @param query Query parameters for filtering (status, priority, filter=assigned|created)
 * @param userId ID of the current user (for context-aware filtering)
 */
export const getTasks = async (query: any, userId: number) => {
    const { status, priority, sort } = query;

    const where: any = {};

    if (status) where.status = status;
    if (priority) where.priority = priority;

    if (query.filter === 'assigned') where.assignedToId = userId;
    if (query.filter === 'created') where.creatorId = userId;

    const tasks = await prisma.task.findMany({
        where,
        orderBy: sort === 'dueDate' ? { dueDate: 'asc' } : { createdAt: 'desc' },
        include: {
            assignedTo: { select: { id: true, name: true, email: true } },
            creator: { select: { id: true, name: true, email: true } },
        }
    });

    return tasks;
};

/**
 * Retrieves a single task by ID.
 * @param id Task ID
 * @throws AppError 404 if not found
 */
export const getTaskById = async (id: number) => {
    const task = await prisma.task.findUnique({
        where: { id },
        include: {
            assignedTo: { select: { id: true, name: true, email: true } },
            creator: { select: { id: true, name: true, email: true } },
        }
    });
    if (!task) throw new AppError('Task not found', 404);
    return task;
};

export const updateTask = async (id: number, data: any, userId: number) => {
    const task = await prisma.task.findUnique({ where: { id } });
    if (!task) throw new AppError('Task not found', 404);

    // Authorization check? Can anyone update?
    // Prompt doesn't specify roles. Assuming all auth users can update tasks for collaboration.

    const updatedTask = await prisma.task.update({
        where: { id },
        data,
        include: {
            assignedTo: { select: { id: true, name: true, email: true } },
            creator: { select: { id: true, name: true, email: true } },
        }
    });

    // Audit Logging
    await prisma.auditLog.create({
        data: {
            action: 'UPDATE',
            taskId: id,
            userId: userId,
            details: `Updated fields: ${Object.keys(data).join(', ')}`
        }
    });

    return updatedTask;
};

export const deleteTask = async (id: number, userId: number) => {
    const task = await prisma.task.findUnique({ where: { id } });
    if (!task) throw new AppError('Task not found', 404);

    // Only creator can delete?
    if (task.creatorId !== userId) {
        throw new AppError('You are not authorized to delete this task', 403);
    }

    await prisma.task.delete({ where: { id } });
    return null;
};
