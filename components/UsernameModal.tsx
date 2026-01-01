'use client';

import { useState, useEffect } from 'react';

interface UsernameModalProps {
    isOpen: boolean;
    onClose: (username: string) => void;
}

export default function UsernameModal({ isOpen, onClose }: UsernameModalProps) {
    const [username, setUsername] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        // Check if username already exists in localStorage
        const savedUsername = localStorage.getItem('username');
        if (savedUsername && !isOpen) {
            onClose(savedUsername);
        }
    }, [isOpen, onClose]);

    const validateUsername = (name: string): boolean => {
        if (name.length < 2) {
            setError('Username must be at least 2 characters');
            return false;
        }
        if (name.length > 20) {
            setError('Username must be 20 characters or less');
            return false;
        }
        if (!/^[a-zA-Z0-9_\s]+$/.test(name)) {
            setError('Username can only contain letters, numbers, spaces, and underscores');
            return false;
        }
        setError('');
        return true;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (validateUsername(username)) {
            localStorage.setItem('username', username);
            onClose(username);
        }
    };

    const handlePlayAsGuest = () => {
        const guestName = 'Anonymous';
        localStorage.setItem('username', guestName);
        onClose(guestName);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/95 backdrop-blur-sm">
            {/* Modal Content */}
            <div className="relative glass rounded-2xl p-8 max-w-md w-full shadow-2xl">
                <h2 className="text-3xl font-black mb-6 uppercase">Welcome</h2>

                <p className="mb-6 font-semibold">
                    Enter your username to appear on the leaderboard
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="YOUR USERNAME"
                            className="w-full uppercase"
                            autoFocus
                            maxLength={20}
                        />
                        {error && (
                            <p className="mt-2 text-primary font-bold text-sm">{error}</p>
                        )}
                    </div>

                    <div className="flex flex-col gap-3">
                        <button
                            type="submit"
                            className="w-full bg-primary hover:bg-secondary transition-colors"
                            disabled={username.length < 2}
                        >
                            Start Playing
                        </button>

                        <button
                            type="button"
                            onClick={handlePlayAsGuest}
                            className="w-full"
                        >
                            Play as Guest
                        </button>
                    </div>
                </form>

                <p className="mt-6 text-sm opacity-70">
                    Your username will be stored locally and can be changed later in settings.
                </p>
            </div>
        </div>
    );
}
