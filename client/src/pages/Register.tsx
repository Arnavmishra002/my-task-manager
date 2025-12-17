import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';

const registerSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
});

type RegisterInputs = z.infer<typeof registerSchema>;

export default function Register() {
    const { register, handleSubmit, formState: { errors } } = useForm<RegisterInputs>({
        resolver: zodResolver(registerSchema),
    });
    const { login } = useAuth();
    const navigate = useNavigate();
    const [serverError, setServerError] = useState('');

    const onSubmit = async (data: RegisterInputs) => {
        try {
            setServerError('');
            const res = await api.post('/auth/register', data);
            login(res.data.token, res.data.data.user);
            navigate('/dashboard');
        } catch (error: any) {
            setServerError(error.response?.data?.message || 'Registration failed');
            console.error("Registration Error Details:", error);
            const debugMsg = JSON.stringify(error.response?.data || error.message);
            alert(`Registration Failed: ${debugMsg}`);
            if (error.response) console.error("Response Data:", error.response.data);
        }
    };

    // Debug helper
    const debugUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:4000';

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="w-full max-w-md space-y-8 bg-white p-8 rounded-xl shadow-lg">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                        Create your account
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-600">
                        Or{' '}
                        <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
                            sign in to your existing account
                        </Link>
                    </p>
                </div>
                <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
                    <div className="rounded-md shadow-sm">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Full Name</label>
                            <input
                                type="text"
                                {...register('name')}
                                className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            />
                            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
                        </div>
                        <div className="mt-4">
                            <label className="block text-sm font-medium text-gray-700">Email address</label>
                            <input
                                type="email"
                                {...register('email')}
                                className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            />
                            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
                        </div>
                        <div className="mt-4">
                            <label className="block text-sm font-medium text-gray-700">Password</label>
                            <input
                                type="password"
                                {...register('password')}
                                className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            />
                            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
                        </div>
                    </div>

                    {serverError && <div className="text-red-500 text-sm text-center">{serverError}</div>}

                    <div>
                        <button
                            type="submit"
                            className="group relative flex w-full justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                        >
                            Register
                        </button>
                    </div>
                </form>

                <div className="mt-4 p-2 bg-gray-100 rounded text-xs text-gray-500 break-all">
                    <p><strong>Debug Info:</strong></p>
                    <p>API URL: {debugUrl}</p>
                    <p>Mode: {import.meta.env.MODE}</p>
                </div>
            </div>
        </div>
    );
}
