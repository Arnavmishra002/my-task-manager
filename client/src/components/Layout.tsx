import { useState } from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ProfileModal from './ProfileModal';
import NotificationToast from './NotificationToast';

export default function Layout() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [isProfileOpen, setIsProfileOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
            <nav className="bg-white shadow">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex">
                            <Link to="/dashboard" className="flex-shrink-0 flex items-center">
                                <span className="font-bold text-xl text-indigo-600">TaskFlow</span>
                            </Link>
                        </div>
                        <div className="flex items-center">
                            {user ? (
                                <div className="flex items-center gap-4">
                                    <span className="text-gray-700">Hello, {user.name}</span>
                                    <button
                                        onClick={() => setIsProfileOpen(true)}
                                        className="text-sm text-indigo-600 hover:text-indigo-800"
                                    >
                                        Edit Profile
                                    </button>
                                    <button
                                        onClick={handleLogout}
                                        className="text-sm text-gray-500 hover:text-gray-700"
                                    >
                                        Logout
                                    </button>
                                </div>

                            ) : (
                                <div className="flex gap-4">
                                    <Link to="/login" className="text-gray-500 hover:text-gray-700">Login</Link>
                                    <Link to="/register" className="text-gray-500 hover:text-gray-700">Register</Link>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </nav>
            <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                <Outlet />
            </main>
            <ProfileModal isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />
            <NotificationToast />
        </div>
    );
}
