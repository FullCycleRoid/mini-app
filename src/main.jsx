import React from 'react';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import { App } from './App.jsx';

// Инициализация Telegram SDK
import { init, miniApp, mainButton } from '@telegram-apps/sdk';

const initializeTelegramSDK = async () => {
    try {
        await init();

        // Готовность приложения
        if (miniApp.ready.isAvailable()) {
            await miniApp.ready();
            console.log('Mini App готово');
        }

        // Настройка главной кнопки
        if (mainButton.mount.isAvailable()) {
            mainButton.mount();
            mainButton.setParams({
                backgroundColor: '#aa1388',
                isEnabled: true,
                isVisible: true,
                text: 'Поделиться очками',
                textColor: '#000000',
            });

            mainButton.on('click', () => {
                const score = localStorage.getItem('memory-game-score') || 0;
                shareURL(`Посмотрите! У меня ${score} очков в игре!`);
            });
        }

        // Цвет заголовка
        miniApp.setHeaderColor('#54d923');
    } catch (error) {
        console.error('Ошибка инициализации Telegram SDK:', error);
    }
};

initializeTelegramSDK();

// Рендеринг приложения
createRoot(document.getElementById('root')).render(
    <StrictMode>
        <App />
    </StrictMode>
);