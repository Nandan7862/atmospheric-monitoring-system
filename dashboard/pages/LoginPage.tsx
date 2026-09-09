import React, { useState } from 'react';

// Icons
const UserIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
);

const LockIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
    </svg>
);

interface LoginPageProps {
    onLoginSuccess: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isShaking, setIsShaking] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsShaking(false);

        // Simulated authentication
        if (username === 'tomin' && password === 'tomin123') {
            onLoginSuccess();
        } else {
            setError('Invalid username or password.');
            setIsShaking(true);
            setTimeout(() => setIsShaking(false), 500); // Reset shake animation
        }
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-gray-100 dark:bg-[#050816] font-sans text-gray-800 dark:text-gray-200 p-4 overflow-hidden relative">
            {/* Animated background elements */}
            <div className="absolute top-0 -left-1/3 w-96 h-96 bg-cyan-500/30 rounded-full filter blur-3xl animate-blob opacity-30"></div>
            <div className="absolute top-0 -right-1/4 w-96 h-96 bg-blue-500/30 rounded-full filter blur-3xl animate-blob animation-delay-2000 opacity-30"></div>
            <div className="absolute -bottom-8 left-1/4 w-96 h-96 bg-purple-500/30 rounded-full filter blur-3xl animate-blob animation-delay-4000 opacity-30"></div>

            <div className={`relative z-10 w-full max-w-md ${isShaking ? 'animate-shake' : ''}`}>
                <div className="bg-white/40 dark:bg-black/30 backdrop-blur-lg border border-gray-200 dark:border-white/10 rounded-2xl shadow-2xl shadow-black/20 p-8">
                    <div className="text-center mb-8">
                         <div className="w-16 h-16 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-full flex items-center justify-center shadow-lg shadow-cyan-500/20 mx-auto mb-4">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-9 w-9 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                        </div>
                        <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-700 dark:from-cyan-300 dark:to-blue-500">
                            Welcome Back
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400 mt-2">Sign in to access the dashboard</p>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className="relative mb-4">
                            <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                                <UserIcon />
                            </div>
                            <input
                                type="text"
                                placeholder="Username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full bg-gray-200 dark:bg-gray-700/50 border border-gray-300 dark:border-white/20 rounded-lg py-3 pl-12 pr-4 text-gray-800 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all duration-300"
                                required
                            />
                        </div>
                        <div className="relative mb-6">
                           <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                                <LockIcon />
                            </div>
                            <input
                                type="password"
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-gray-200 dark:bg-gray-700/50 border border-gray-300 dark:border-white/20 rounded-lg py-3 pl-12 pr-4 text-gray-800 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all duration-300"
                                required
                            />
                        </div>

                        {error && (
                            <p className="text-red-500 dark:text-red-400 text-sm text-center mb-4">{error}</p>
                        )}

                        <button
                            type="submit"
                            className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold rounded-lg py-3 hover:scale-105 transform transition-transform duration-300 shadow-lg shadow-cyan-500/20 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-gray-100 dark:focus:ring-offset-[#050816]"
                        >
                            Sign In
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};