import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from '../context/AuthContext';
import { useQueryClient } from '@tanstack/react-query';

export const useSocket = () => {
    const { token } = useAuth();
    const socketRef = useRef<Socket | null>(null);
    const queryClient = useQueryClient();

    useEffect(() => {
        if (token && !socketRef.current) {
            let socketUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:4000';
            if (!socketUrl.startsWith('http')) {
                socketUrl = `https://${socketUrl}`;
            }

            socketRef.current = io(socketUrl, {
                auth: {
                    token: `Bearer ${token}` // Passing token for handshake auth if needed
                },
                transports: ['websocket'],
            });

            socketRef.current.on('connect', () => {
                console.log('Connected to socket server');
            });

            socketRef.current.on('taskCreated', (task) => {
                queryClient.invalidateQueries({ queryKey: ['tasks'] });
                // Optionally update cache directly
            });

            socketRef.current.on('taskUpdated', (task) => {
                queryClient.invalidateQueries({ queryKey: ['tasks'] });
            });

            socketRef.current.on('taskDeleted', (taskId) => {
                queryClient.invalidateQueries({ queryKey: ['tasks'] });
            });

            socketRef.current.on('taskAssigned', (task) => {
                // Notification logic could go here
                queryClient.invalidateQueries({ queryKey: ['tasks'] });
                alert(`You have been assigned a new task: ${task.title}`);
            });
        }

        return () => {
            if (socketRef.current) {
                socketRef.current.disconnect();
                socketRef.current = null;
            }
        };
    }, [token, queryClient]);

    return socketRef.current;
};
