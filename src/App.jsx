import React, { useReducer, useEffect } from 'react';
import './App.css';


const generateDeck = () => {
    const colors = ['#FF6347', '#4682B4', '#32CD32', '#FFD700', '#FF69B4', '#8A2BE2'];
    const deck = [];
    // Каждому цвету добавляем две карточки
    for (let color of colors) {
        deck.push({ color, matched: false });
        deck.push({ color, matched: false });
    }
    // Перемешиваем колоду
    return deck.sort(() => Math.random() - 0.5);
};

const loadInitialScore = () => {
    const savedScore = localStorage.getItem('memory-game-score');
    return savedScore ? parseInt(savedScore, 10) : 0;
};

const initialState = {
    deck: generateDeck(),
    flipped: [],
    matched: [],
    turns: 0,
    score: loadInitialScore(),
    pendingReset: false,
    gameOver: false,
};


const gameReducer = (state, action) => {
    console.log(state)
    switch (action.type) {
        case 'FLIP_CARD':
            // Переворачиваем карточку
            console.log(action, "erfgregeg")
            if (state.flipped.length < 2 && !state.flipped.includes(action.index) && !state.matched.includes(state.deck[action.index].color)) {
                return { ...state, flipped: [...state.flipped, action.index] };
            }
            return state;
        case 'CHECK_MATCH':
            const [first, second] = state.flipped;
            if (state.deck[first].color === state.deck[second].color) {
                const newMatched = [...state.matched, state.deck[first].color];
                const newScore = state.score + 1; // Увеличиваем счёт на 1
                const isGameOver = newMatched.length === state.deck.length / 2;

                return {
                    ...state,
                    matched: newMatched,
                    score: newScore,
                    flipped: [],
                    pendingReset: false,
                    gameOver: isGameOver,
                };
            } else {
                return { ...state, pendingReset: true };
            }
        case 'RESET_FLIPPED':
            // Сбрасываем перевернутые карточки
            return { ...state, flipped: [], pendingReset: false };
        case 'INCREMENT_TURN':
            // Увеличиваем счетчик попыток
            return { ...state, turns: state.turns + 1 };
        case 'RESET_GAME':
            // Сбрасываем состояние игры
            return {
                ...initialState,
                deck: generateDeck(),
            };
        default:
            return state;
    }
};


const App = () => {
    const [state, dispatch] = useReducer(gameReducer, initialState);

    useEffect(() => {
        console.log(window.Telegram, "window.Telegram window.Telegram 123")
        if (window.Telegram?.WebApp) {
            const tgWebApp = window.Telegram.WebApp;
            tgWebApp.ready();
            tgWebApp.expand();

            const user = tgWebApp.initDataUnsafe?.user;

            console.log(tgWebApp.initDataUnsafe, "tgWebApp.initDataUnsafe 123")
            console.log(tgWebApp.initDataUnsafe.user, "tgWebApp.initDataUnsafe.user 123")
            if (user) {
                dispatch({
                    type: 'SET_PLAYER',
                    player: {
                        id: user.id,
                        username: user.username || `user_${user.id}`,
                        name: [user.first_name, user.last_name].filter(Boolean).join(' ')
                    }
                });

                // Сохраняем в localStorage
                localStorage.setItem('tgPlayer', JSON.stringify({
                    id: user.id,
                    username: user.username || `user_${user.id}`
                }));
            }
        }
    }, []);

    // Проверка на совпадение перевернутых карточек
    useEffect(() => {
        if (state.flipped.length === 2) {
            dispatch({ type: 'CHECK_MATCH' });
            dispatch({ type: 'INCREMENT_TURN' });
        }
    }, [state.flipped]);


    // Таймер для сброса перевернутых карточек
    useEffect(() => {
        if (state.pendingReset) {
            const timer = setTimeout(() => {
                dispatch({ type: 'RESET_FLIPPED' });
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [state.pendingReset]);

    useEffect(() => {
        localStorage.setItem('memory-game-score', state.score);
    }, [state.score]);

    // Обработка клика на карточку
    const handleCardClick = (index) => {
        if (!state.gameOver && state.flipped.length < 2 && !state.flipped.includes(index)) {
            dispatch({ type: 'FLIP_CARD', index });
        }
    };


    const handlePlayAgain = () => {
        dispatch({ type: 'RESET_GAME' });
    };


    return (
        <div className="App">
            <h1>Memory Game</h1>
            <div className="info">
                <p>Очки: {state.score}</p>
                <p>Попытки: {state.turns}/15</p>
            </div>
            <div className="deck">
                {state.deck.map((card, index) => (
                    <div
                        key={index}
                        className={`card ${state.flipped.includes(index) || state.matched.includes(card.color) ? 'flipped show' : ''}`}
                        style={{ '--card-color': card.color }}
                        onClick={() => handleCardClick(index)}
                    />
                ))}
            </div>
            {state.gameOver && (
                <>
                    <div className="overlay" />
                    <div className="game-over">
                        <h2>Вы выиграли!</h2>
                        <button onClick={handlePlayAgain}>Заново</button>
                    </div>
                </>
            )}
            {!state.gameOver && state.turns >= 15 && (
                <>
                    <div className="overlay" />
                    <div className="game-over">
                        <h2>Игра окончена!</h2>
                        <button onClick={handlePlayAgain}>Заново</button>
                    </div>
                </>
            )}
        </div>
    );
};


export default App;