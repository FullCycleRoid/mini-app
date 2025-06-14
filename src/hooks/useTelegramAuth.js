import { useEffect, useState } from 'react';
import { init, initData } from '@telegram-apps/sdk';

// Хук для проверки авторизации через Telegram
export const useTelegramAuth = () => {
    const [isAuthorized, setIsAuthorized] = useState(null); // null = загрузка

    useEffect(() => {
        console.log(initData, "Init Data 123")
        console.log(window.Telegram?.WebApp, 'window.Telegram?.WebApp')

        const authData = window.Telegram.WebApp.initData;
        console.log('Получены данные авторизации:', authData);

        const checkAuth = async () => {
            try {
                await init(); // Инициализируем SDK

                // Проверяем наличие initData
                if (!initData.exists()) {
                    setIsAuthorized(false);
                    return;
                }

                // Проверка подписи (реализуйте на бэкенде)
                const isValid = await validateInitData(initData.raw());
                setIsAuthorized(isValid);
            } catch (error) {
                console.error('Ошибка проверки авторизации:', error);
                setIsAuthorized(false);
            }
        };

        checkAuth();
    }, []);

    return isAuthorized;
};

// Заглушка для валидации подписи (реализуйте на бэкенде)
const validateInitData = async (rawInitData) => {
    console.log(rawInitData, "rawInitData 777")

    // TODO: Отправьте rawInitData на сервер для проверки
    // Возвращайте true, если подпись валидна
    return true;
};