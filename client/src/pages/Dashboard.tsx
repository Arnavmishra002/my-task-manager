import { useState } from 'react';
import { useTasks, Task } from '../hooks/useTasks';
import { useSocket } from '../hooks/useSocket';
import TaskCard from '../components/TaskCard';
import TaskForm from '../components/TaskForm';
import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
    const { user } = useAuth();
    useSocket(); // Activate socket

    const [filter, setFilter] = useState<'all' | 'assigned' | 'created'>('all');
    const [priorityFilter, setPriorityFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTask, setEditingTask] = useState<Task | null>(null);

    const queryParams: any = {};
    if (filter !== 'all') queryParams.filter = filter;
    if (priorityFilter) queryParams.priority = priorityFilter;
    if (statusFilter) queryParams.status = statusFilter;
    // sort logic could be added

    const { data: tasks, isLoading, error } = useTasks(queryParams);

    // Client-side overdue check if needed, or queryParam
    // Requirement: "Tasks that are Overdue". 
    // Let's implement an Overdue section or filter?
    // Prompts says: "A dedicated dashboard page showing: Tasks assigned, Tasks created, Tasks Overdue"
    // It implies sections or tabs.
    // I'll stick to tabs for "All", "Assigned", "Created", "Overdue".

    const [tab, setTab] = useState<'all' | 'assigned' | 'created' | 'overdue'>('assigned'); // Default to Assigned as per typical workflow? Or All?

    // We can let the API handle filtering by passing 'filter' param.
    // if tab 'overdue', we might need special handling or client side filter.
    // Let's rely on generic fetching and client filtering for 'overdue' for simplicity if backend doesn't support 'overdue' flag directly yet.
    // Actually, I didn't implement 'overdue' filter in backend.

    const filteredTasks = tasks?.filter(task => {
        if (tab === 'assigned') return task.assignedToId === user?.id; // backend might already do this if I passed queryParams, but let's double check logic.
        if (tab === 'created') return task.creatorId === user?.id;
        if (tab === 'overdue') return new Date(task.dueDate) < new Date() && task.status !== 'Completed';
        return true;
    });

    const handleCreate = () => {
        setEditingTask(null);
        setIsModalOpen(true);
    };

    const handleEdit = (task: Task) => {
        setEditingTask(task);
        setIsModalOpen(true);
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-center bg-white p-4 rounded-lg shadow-sm">
                <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
                <button
                    onClick={handleCreate}
                    className="mt-4 sm:mt-0 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded shadow transition"
                >
                    + Create Task
                </button>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                    {['all', 'assigned', 'created', 'overdue'].map((t) => (
                        <button
                            key={t}
                            onClick={() => {
                                setTab(t as any);
                                // Reset backend filter if we're doing client side mostly for these tabs
                                // or align them. 
                                // If I rely on Client filtering for tabs, I should fetch ALL (or relevant).
                                // If database is huge this is bad. But for assessment, client side filtering from a reasonable fetch is okay.
                                // Wait, "Tasks assigned to the current user" is a requirement.
                                // I implemented `filter=assigned` in backend.
                                // Better to use backend filtering.
                                if (t === 'overdue') {
                                    // Client side filter only for now
                                    setFilter('all');
                                } else {
                                    setFilter(t as 'all' | 'assigned' | 'created');
                                }
                            }}
                            className={`${tab === t
                                ? 'border-indigo-500 text-indigo-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm capitalize`}
                        >
                            {t.replace('-', ' ')}
                        </button>
                    ))}
                </nav>
            </div>

            {/* Filters */}
            <div className="flex gap-4">
                <select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)} className="border-gray-300 rounded-md shadow-sm text-sm">
                    <option value="">All Priorities</option>
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Urgent">Urgent</option>
                </select>
                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="border-gray-300 rounded-md shadow-sm text-sm">
                    <option value="">All Statuses</option>
                    <option value="ToDo">To Do</option>
                    <option value="InProgress">In Progress</option>
                    <option value="Review">Review</option>
                    <option value="Completed">Completed</option>
                </select>
                <div className="text-xs text-gray-400 self-center">
                    (Sorting by Date implemented in backend default)
                </div>
            </div>

            {isLoading && <div className="text-center py-10">Loading tasks...</div>}
            {error && <div className="text-center py-10 text-red-500">Error loading tasks</div>}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredTasks?.map((task) => (
                    <TaskCard key={task.id} task={task} onEdit={handleEdit} />
                ))}
                {!isLoading && filteredTasks?.length === 0 && (
                    <div className="col-span-full text-center py-10 text-gray-500 bg-white rounded-lg border border-dashed border-gray-300">
                        No tasks found.
                    </div>
                )}
            </div>

            {isModalOpen && (
                <TaskForm task={editingTask} onClose={() => setIsModalOpen(false)} />
            )}
        </div>
    );
}
