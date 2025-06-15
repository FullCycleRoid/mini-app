import React, { useReducer, useEffect, useRef } from 'react';
import './App.css';

// Конфигурация игры
const cardSymbols = ['♦', '♠', '♥', '♣', '★', '☀', '☄', '♫'];
const cardColors = [
    '#ff00ff', '#00ffff', '#ffff00', '#ff7700',
    '#00ff77', '#ff0077', '#7700ff', '#ffaa00'
];

// Звуковые эффекты
const useSound = (src) => {
    const soundRef = useRef(null);

    useEffect(() => {
        soundRef.current = new Audio(src);
    }, [src]);

    const play = () => {
        if (soundRef.current) {
            soundRef.current.currentTime = 0;
            soundRef.current.play().catch(e => console.log("Ошибка воспроизведения звука"));
        }
    };

    return play;
};

const initialState = {
    deck: [],
    flipped: [],
    matched: [],
    turns: 0,
    score: 0,
    pendingReset: false,
    gameOver: false,
    player: null,
    seconds: 0,
    musicOn: true
};

const gameReducer = (state, action) => {
    switch (action.type) {
        case 'FLIP_CARD':
            if (state.flipped.length < 2 &&
                !state.flipped.includes(action.index) &&
                !state.matched.includes(state.deck[action.index].symbol)) {
                return { ...state, flipped: [...state.flipped, action.index] };
            }
            return state;

        case 'CHECK_MATCH':
            const [first, second] = state.flipped;
            const firstCard = state.deck[first];
            const secondCard = state.deck[second];

            if (firstCard.symbol === secondCard.symbol) {
                console.log(state.score, "state.score state.score 123")
                const newMatched = [...state.matched, firstCard.symbol];
                const newScore = state.score + 1;
                const isGameOver = newMatched.length === cardSymbols.length;

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
            return { ...state, flipped: [], pendingReset: false };

        case 'INCREMENT_TURN':
            return { ...state, turns: state.turns + 1 };

        case 'RESET_GAME':
            return {
                ...initialState,
                deck: generateDeck(),
                player: state.player,
                seconds: 0,
                score: 0,
                turns: 0
            };

        case 'SET_PLAYER':
            return { ...state, player: action.player };

        case 'INCREMENT_TIME':
            return { ...state, seconds: state.seconds + 1 };

        case 'TOGGLE_MUSIC':
            return { ...state, musicOn: !state.musicOn };

        default:
            return state;
    }
};

const generateDeck = () => {
    const deck = [];
    for (let symbol of cardSymbols) {
        const color = cardColors[cardSymbols.indexOf(symbol) % cardColors.length];
        deck.push({ symbol, color, matched: false });
        deck.push({ symbol, color, matched: false });
    }
    return deck.sort(() => Math.random() - 0.5);
};

const loadInitialScore = () => {
    const savedScore = localStorage.getItem('memory-game-score');
    return savedScore ? parseInt(savedScore, 10) : 0;
};

const App = () => {
    const [state, dispatch] = useReducer(gameReducer, {
        ...initialState,
        deck: generateDeck(),
        score: loadInitialScore()
    });

    const timerRef = useRef(null);

    // Звуковые эффекты
    const playFlipSound = useSound('https://assets.codepen.io/1468070/card-flip.wav');
    const playMatchSound = useSound('https://assets.codepen.io/1468070/match-sound.wav');
    const playWinSound = useSound('https://assets.codepen.io/1468070/win-sound.wav');
    const backgroundMusicRef = useRef(null);

    useEffect(() => {
        const initTg = () => {
            if (window.Telegram?.WebApp) {
                const webApp = window.Telegram.WebApp;
                webApp.ready();
                webApp.expand();

                const user = webApp.initDataUnsafe?.user;
                if (user) {
                    dispatch({
                        type: 'SET_PLAYER',
                        player: {
                            id: user.id,
                            username: user.username || `user_${user.id}`,
                            name: [user.first_name, user.last_name].filter(Boolean).join(' ') || 'NEO-MATRIX'
                        }
                    });
                }

                webApp.MainButton.text = 'Поделиться очками';
                webApp.MainButton.color = '#aa1388';
                webApp.MainButton.textColor = '#000000';
                webApp.MainButton.show();

                webApp.MainButton.onClick(() => {
                    const score = localStorage.getItem('memory-game-score') || 0;
                    const user = webApp.initDataUnsafe?.user;
                    const username = user?.username ? `@${user.username}` : 'Я';
                    webApp.showSharePopup(`${username} набрал ${score} очков в Memory Game!`);
                });
            }
        };

        initTg();

        // Запуск таймера
        timerRef.current = setInterval(() => {
            dispatch({ type: 'INCREMENT_TIME' });
        }, 1000);

        // Запуск музыки
        if (state.musicOn) {
            backgroundMusicRef.current = new Audio('https://assets.codepen.io/1468070/8bit-music.mp3');
            backgroundMusicRef.current.loop = true;
            backgroundMusicRef.current.play().catch(e => console.log("Автовоспроизведение заблокировано"));
        }

        return () => {
            clearInterval(timerRef.current);
            if (backgroundMusicRef.current) {
                backgroundMusicRef.current.pause();
            }
        };
    }, [state.musicOn]);

    // Проверка совпадений
    useEffect(() => {
        if (state.flipped.length === 2) {
            dispatch({ type: 'CHECK_MATCH' });
            dispatch({ type: 'INCREMENT_TURN' });

            // Проигрываем звук
            if (state.musicOn) {
                playFlipSound();
            }
        }
    }, [state.flipped, state.musicOn]);

    // Таймер для сброса карточек
    useEffect(() => {
        if (state.pendingReset) {
            const timer = setTimeout(() => {
                dispatch({ type: 'RESET_FLIPPED' });
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [state.pendingReset]);

    // Сохранение счета
    useEffect(() => {
        localStorage.setItem('memory-game-score', state.score);
    }, [state.score]);

    // Обработка победы
    useEffect(() => {
        if (state.gameOver && state.musicOn) {
            playWinSound();

            // Бонус за время
            const timeBonus = Math.max(0, 300 - state.seconds);
            dispatch({ type: 'INCREMENT_SCORE', amount: timeBonus });
        }
    }, [state.gameOver, state.seconds, state.musicOn]);

    const handleCardClick = (index) => {
        if (!state.gameOver && state.flipped.length < 2 && !state.flipped.includes(index)) {
            dispatch({ type: 'FLIP_CARD', index });
        }
    };

    const handlePlayAgain = () => {
        dispatch({ type: 'RESET_GAME' });
    };

    const toggleMusic = () => {
        dispatch({ type: 'TOGGLE_MUSIC' });
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
        const secs = (seconds % 60).toString().padStart(2, '0');
        return `${mins}:${secs}`;
    };

    return (
        <div className="App">
            <h1 className="title">8-BIT CARD MATCH</h1>

            {state.player ? (
                <div className="player-info">
                    <p>Игрок: {state.player.name}</p>
                    {state.player.username && <p>@{state.player.username}</p>}
                </div>
            ) : (
                <div className="player-info">
                    <p>Игрок: NEO-MATRIX</p>
                </div>
            )}

            <div className="info">
                <p>Очки: {state.score}</p>
                <p>Ходы: {state.turns}</p>
                <p>Время: {formatTime(state.seconds)}</p>
            </div>

            <div className="deck">
                {state.deck.map((card, index) => (
                    <div
                        key={index}
                        className={`card ${
                            state.flipped.includes(index) || state.matched.includes(card.symbol)
                                ? 'flipped show'
                                : ''
                        }`}
                        style={{ '--card-color': card.color }}
                        onClick={() => handleCardClick(index)}
                    >
                        <div className="card-front">
                            <div className="card-symbol">{card.symbol}</div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="controls">
                <button onClick={handlePlayAgain}>Перезапуск</button>
                <button onClick={toggleMusic}>
                    Музыка: {state.musicOn ? 'Вкл' : 'Выкл'}
                </button>
            </div>

            {state.gameOver && (
                <>
                    <div className="overlay" />
                    <div className="game-over">
                        <h2>Вы выиграли!</h2>
                        <p>Ваш счет: {state.score}</p>
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