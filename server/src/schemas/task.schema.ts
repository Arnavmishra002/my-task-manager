import { z } from 'zod';

const PriorityEnum = z.enum(['Low', 'Medium', 'High', 'Urgent']);
const StatusEnum = z.enum(['ToDo', 'InProgress', 'Review', 'Completed']);

export const createTaskSchema = z.object({
    body: z.object({
        title: z.string().min(1, 'Title is required').max(100, 'Title too long'),
        description: z.string(),
        dueDate: z.string().datetime(), // Expect ISO string
        priority: PriorityEnum,
        assignedToId: z.number().optional(),
    }),
});

export const updateTaskSchema = z.object({
    body: z.object({
        title: z.string().max(100).optional(),
        description: z.string().optional(),
        dueDate: z.string().datetime().optional(),
        priority: PriorityEnum.optional(),
        status: StatusEnum.optional(),
        assignedToId: z.number().optional(),
    }),
    params: z.object({
        id: z.string().regex(/^\d+$/, 'Invalid ID'),
    })
});
