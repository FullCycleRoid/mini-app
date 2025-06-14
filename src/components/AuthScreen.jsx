import React from 'react';

export const AuthScreen = ({ onAuthorize }) => {
    const handleAuth = () => {
        console.log(window.Telegram?.WebApp, 'window.Telegram?.WebApp')
        if (window.Telegram?.WebApp) {
            // Получаем данные из Telegram
            const authData = window.Telegram.WebApp.initData;
            console.log('Получены данные авторизации:', authData);

            // После получения данных вызываем обратный вызов
            setTimeout(() => {
                onAuthorize();
            }, 1000);
        }
    };

    return (
        <div className="auth-screen">
            <h2>Для продолжения войдите через Telegram</h2>
            <button onClick={handleAuth} className="auth-button">
                Войти через Telegram
            </button>
        </div>
    );
};