import React, { createContext, useContext, useState, useEffect } from 'react';

const GameContext = createContext();

const STARTING_BALANCE = 100;

// Helpers — keep localStorage logic in one place
const loadBalance = (username) => {
    if (!username) return 0;
    const saved = localStorage.getItem(`zealux_balance_${username}`);
    return saved !== null ? parseInt(saved, 10) : STARTING_BALANCE;
};

const saveBalance = (username, amount) => {
    if (!username) return;
    localStorage.setItem(`zealux_balance_${username}`, String(amount));
};

export const GameProvider = ({ children }) => {
    // Initialize from localStorage so a page refresh keeps the user logged in
    const [user, setUser] = useState(() => localStorage.getItem('zealUser'));
    const [balance, setBalance] = useState(() => loadBalance(localStorage.getItem('zealUser')));

    // Whenever `user` changes (login, logout, switch account), sync everything
    useEffect(() => {
        if (user) {
            localStorage.setItem('zealUser', user);
            const newBalance = loadBalance(user);
            setBalance(newBalance);
            // Ensure first-time users have their starting balance persisted
            if (localStorage.getItem(`zealux_balance_${user}`) === null) {
                saveBalance(user, STARTING_BALANCE);
            }
        } else {
            localStorage.removeItem('zealUser');
            setBalance(0);
        }
    }, [user]);

    const login = (username) => setUser(username);

    const logout = () => setUser(null);

    const updateBalance = (amount) => {
        setBalance(prev => {
            const next = prev + amount;
            saveBalance(user, next);
            return next;
        });
    };

    return (
        <GameContext.Provider value={{ user, balance, login, logout, updateBalance }}>
            {children}
        </GameContext.Provider>
    );
};

export const useGame = () => useContext(GameContext);