import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';


const initTelegramWebApp = () => {
    console.log(window.Telegram.WebApp, "window.Telegram.WebApp window.Telegram.WebApp 123")
    if (window.Telegram?.WebApp) {
        try {
            const webApp = window.Telegram.WebApp;

            webApp.ready();
            webApp.expand();

            webApp.MainButton.text = 'Поделиться очками';
            webApp.MainButton.color = '#aa1388';
            webApp.MainButton.textColor = '#000000';
            webApp.MainButton.show();

            // Обработчик клика на кнопку
            webApp.MainButton.onClick(() => {
                const score = localStorage.getItem('memory-game-score') || 0;
                const user = webApp.initDataUnsafe?.user;
                const username = user?.username ? `@${user.username}` : 'Я';

                webApp.showSharePopup(`${username} набрал ${score} очков в Memory Game!`);
            });

            // Цвет заголовка
            webApp.setHeaderColor('#54d923');

            console.log('Telegram WebApp инициализирован');
            return true;
        } catch (error) {
            console.error('Ошибка инициализации Telegram WebApp:', error);
        }
    }
    return false;
};

// Пытаемся инициализировать Telegram WebApp
if (!initTelegramWebApp()) {
    console.warn('Приложение запущено вне Telegram. Функции Telegram недоступны.');
}

// Рендеринг приложения
createRoot(document.getElementById('root')).render(
    <StrictMode>
        <App />
    </StrictMode>
);