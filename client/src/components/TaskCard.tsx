import { Task, useDeleteTask, useUpdateTask } from '../hooks/useTasks';
import { useAuth } from '../context/AuthContext';
import clsx from 'clsx';
// import { format } from 'date-fns'; // unused

// Helper for priority colors
const priorityColors = {
    Low: 'bg-green-100 text-green-800',
    Medium: 'bg-yellow-100 text-yellow-800',
    High: 'bg-orange-100 text-orange-800',
    Urgent: 'bg-red-100 text-red-800',
};

const statusColors = {
    ToDo: 'bg-gray-100 text-gray-800',
    InProgress: 'bg-blue-100 text-blue-800',
    Review: 'bg-purple-100 text-purple-800',
    Completed: 'bg-green-100 text-green-800 green-check', // using custom class or just generic
};

interface TaskCardProps {
    task: Task;
    onEdit: (task: Task) => void;
}

export default function TaskCard({ task, onEdit }: TaskCardProps) {
    const { user } = useAuth();
    const deleteTaskMutation = useDeleteTask();
    const updateTaskMutation = useUpdateTask();

    const isCreator = user?.id === task.creatorId;

    const handleDelete = () => {
        if (confirm('Are you sure?')) {
            deleteTaskMutation.mutate(task.id);
        }
    };

    const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        updateTaskMutation.mutate({ id: task.id, data: { status: e.target.value as any } });
    };

    return (
        <div className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow duration-300 border border-gray-100">
            <div className="px-4 py-5 sm:p-6">
                <div className="flex justify-between items-start">
                    <h3 className="text-lg leading-6 font-medium text-gray-900 truncate w-3/4">
                        {task.title}
                    </h3>
                    <span className={clsx('px-2 inline-flex text-xs leading-5 font-semibold rounded-full', priorityColors[task.priority])}>
                        {task.priority}
                    </span>
                </div>
                <p className="mt-1 text-sm text-gray-500 line-clamp-2">
                    {task.description}
                </p>

                <div className="mt-4 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <select
                            value={task.status}
                            onChange={handleStatusChange}
                            className={clsx('text-sm rounded border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50', statusColors[task.status])}
                        >
                            <option value="ToDo">To Do</option>
                            <option value="InProgress">In Progress</option>
                            <option value="Review">Review</option>
                            <option value="Completed">Completed</option>
                        </select>
                    </div>
                    <div className="text-xs text-gray-500">
                        Due: {new Date(task.dueDate).toLocaleDateString()}
                    </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center text-xs text-gray-500">
                    <div>
                        Assigned: {task.assignedTo ? task.assignedTo.name : 'Unassigned'}
                    </div>
                    <div className="flex space-x-2">
                        <button onClick={() => onEdit(task)} className="text-indigo-600 hover:text-indigo-900">Edit</button>
                        {isCreator && (
                            <button onClick={handleDelete} className="text-red-600 hover:text-red-900">
                                Delete
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
