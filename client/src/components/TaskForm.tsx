import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Task, useCreateTask, useUpdateTask } from '../hooks/useTasks';

const taskSchema = z.object({
    title: z.string().min(1, 'Title is required').max(100),
    description: z.string().min(1, 'Description is required'),
    dueDate: z.string().min(1, 'Due date is required'), // Simplified validation
    priority: z.enum(['Low', 'Medium', 'High', 'Urgent']),
    // assignedToId: z.number().optional(), // Could be select if we load users
});

type TaskInputs = z.infer<typeof taskSchema>;

interface TaskFormProps {
    task?: Task | null;
    onClose: () => void;
}

export default function TaskForm({ task, onClose }: TaskFormProps) {
    const isEditing = !!task;
    const createTaskMutation = useCreateTask();
    const updateTaskMutation = useUpdateTask();

    const { register, handleSubmit, reset, formState: { errors } } = useForm<TaskInputs>({
        resolver: zodResolver(taskSchema),
        defaultValues: {
            priority: 'Medium',
        }
    });

    useEffect(() => {
        if (task) {
            reset({
                title: task.title,
                description: task.description,
                priority: task.priority,
                dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '',
            });
        }
    }, [task, reset]);

    const onSubmit = (data: TaskInputs) => {
        // Convert date to ISO
        const payload = {
            ...data,
            dueDate: new Date(data.dueDate).toISOString(),
        };

        if (isEditing && task) {
            updateTaskMutation.mutate({ id: task.id, data: payload }, {
                onSuccess: onClose
            });
        } else {
            createTaskMutation.mutate(payload as any, {
                onSuccess: onClose
            });
        }
    };

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
                <h2 className="text-xl font-bold mb-4">{isEditing ? 'Edit Task' : 'Create New Task'}</h2>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Title</label>
                        <input {...register('title')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 border p-2" />
                        {errors.title && <span className="text-red-500 text-xs">{errors.title.message}</span>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Description</label>
                        <textarea {...register('description')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 border p-2" rows={3} />
                        {errors.description && <span className="text-red-500 text-xs">{errors.description.message}</span>}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Due Date</label>
                            <input type="date" {...register('dueDate')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 border p-2" />
                            {errors.dueDate && <span className="text-red-500 text-xs">{errors.dueDate.message}</span>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Priority</label>
                            <select {...register('priority')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 border p-2">
                                <option value="Low">Low</option>
                                <option value="Medium">Medium</option>
                                <option value="High">High</option>
                                <option value="Urgent">Urgent</option>
                            </select>
                        </div>
                    </div>

                    <div className="flex justify-end space-x-2 pt-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50">
                            Cancel
                        </button>
                        <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">
                            {isEditing ? 'Update' : 'Create'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
