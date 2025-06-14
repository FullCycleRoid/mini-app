import React from 'react';
import { AuthScreen } from './components/AuthScreen';
import { Game } from './components/Game';
import { useTelegramAuth } from './hooks/useTelegramAuth';

export const App = () => {
    const isAuthorized = useTelegramAuth();

    if (isAuthorized === null) {
        return <div>Загрузка...</div>;
    }

    if (!isAuthorized) {
        return <AuthScreen onAuthorize={() => window.location.reload()} />;
    }

    return <Game />;
};