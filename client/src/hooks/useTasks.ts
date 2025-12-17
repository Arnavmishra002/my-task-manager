import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/axios';

export interface Task {
    id: number;
    title: string;
    description: string;
    priority: 'Low' | 'Medium' | 'High' | 'Urgent';
    status: 'ToDo' | 'InProgress' | 'Review' | 'Completed';
    dueDate: string;
    creatorId: number;
    assignedToId?: number;
    creator?: { name: string };
    assignedTo?: { name: string };
}

export const useTasks = (filters: any) => {
    return useQuery({
        queryKey: ['tasks', filters],
        queryFn: async () => {
            const params = new URLSearchParams(filters).toString();
            const res = await api.get(`/tasks?${params}`);
            return res.data.data.tasks as Task[];
        },
    });
};

export const useCreateTask = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (newTask: Partial<Task>) => api.post('/tasks', newTask),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tasks'] });
        },
    });
};

export const useUpdateTask = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: Partial<Task> }) => api.patch(`/tasks/${id}`, data),
        onMutate: async ({ id, data }) => {
            await queryClient.cancelQueries({ queryKey: ['tasks'] });
            const previousTasks = queryClient.getQueryData(['tasks']);
            // Optimistically update ALL task queries (e.g. ['tasks'], ['tasks', {filter: 'created'}])
            queryClient.setQueriesData({ queryKey: ['tasks'] }, (old: Task[] | undefined) => {
                if (!old) return [];
                return old.map(task => task.id === id ? { ...task, ...data } : task);
            });
            return { previousTasks };
        },
        onError: (_err, _newTodo, context) => {
            queryClient.setQueryData(['tasks'], context?.previousTasks);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tasks'] });
        },
    });
};

export const useDeleteTask = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: number) => api.delete(`/tasks/${id}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tasks'] });
        },
    });
};
