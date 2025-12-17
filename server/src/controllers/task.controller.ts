import { Request, Response, NextFunction } from 'express';
import * as taskService from '../services/task.service';

export const createTask = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const task = await taskService.createTask(req.body, req.user!.id);

        // Real-time notification
        const io = req.app.get('io');
        io.emit('taskCreated', task);

        // If assigned to someone else, emit specific notification (Requirement 3)
        if (task.assignedToId && task.assignedToId !== req.user!.id) {
            // We could emit to specific user room 'user_ID' if implemented
            // io.to(`user_${task.assignedToId}`).emit('notification', { ... });
            // For simplicity, broadcasting global update or just relying on list update.
            io.emit('taskAssigned', task);
        }

        res.status(201).json({ status: 'success', data: { task } });
    } catch (error) {
        next(error);
    }
};

export const getTasks = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const tasks = await taskService.getTasks(req.query, req.user!.id);
        res.status(200).json({ status: 'success', results: tasks.length, data: { tasks } });
    } catch (error) {
        next(error);
    }
};

export const getTask = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const task = await taskService.getTaskById(Number(req.params.id));
        res.status(200).json({ status: 'success', data: { task } });
    } catch (error) {
        next(error);
    }
};

export const updateTask = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const task = await taskService.updateTask(Number(req.params.id), req.body, req.user!.id);

        const io = req.app.get('io');
        io.emit('taskUpdated', task);

        res.status(200).json({ status: 'success', data: { task } });
    } catch (error) {
        next(error);
    }
};

export const deleteTask = async (req: Request, res: Response, next: NextFunction) => {
    try {
        await taskService.deleteTask(Number(req.params.id), req.user!.id);

        const io = req.app.get('io');
        io.emit('taskDeleted', Number(req.params.id));

        res.status(204).json({ status: 'success', data: null });
    } catch (error) {
        next(error);
    }
};
