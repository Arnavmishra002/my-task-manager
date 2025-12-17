import { useEffect, useState } from 'react';
import { useSocket } from '../hooks/useSocket';

export default function NotificationToast() {
    const socket = useSocket();
    const [notification, setNotification] = useState<string | null>(null);

    useEffect(() => {
        if (!socket) return;

        socket.on('taskAssigned', (data: any) => {
            // Assuming data contains task title or id
            const message = `You have been assigned to task: ${data.title || 'New Task'}`;
            setNotification(message);

            // Auto dismiss after 5s
            setTimeout(() => setNotification(null), 5000);
        });

        return () => {
            socket.off('taskAssigned');
        };
    }, [socket]);

    if (!notification) return null;

    return (
        <div className="fixed bottom-4 right-4 bg-indigo-600 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-bounce">
            <div className="flex items-center gap-2">
                <span>🔔</span>
                <p>{notification}</p>
                <button onClick={() => setNotification(null)} className="ml-2 hover:text-gray-200">&times;</button>
            </div>
        </div>
    );
}
