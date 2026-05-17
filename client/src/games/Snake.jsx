import React, { useState, useEffect, useCallback, useRef } from 'react';
import GameWrapper from '../components/GameWrapper';
import { useGame } from '../context/GameContext';
import { Play, RotateCcw } from 'lucide-react';

const GRID_SIZE = 20;
const INITIAL_SNAKE = [{ x: 10, y: 10 }, { x: 10, y: 11 }, { x: 10, y: 12 }];
const INITIAL_DIRECTION = { x: 0, y: -1 };
const SPEED = 150;

const Snake = () => {
    const { updateBalance } = useGame();
    const [snake, setSnake] = useState(INITIAL_SNAKE);
    const [food, setFood] = useState({ x: 5, y: 5 });
    const [direction, setDirection] = useState(INITIAL_DIRECTION);
    const [isGameOver, setIsGameOver] = useState(false);
    const [score, setScore] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
    const [hasStarted, setHasStarted] = useState(false);
    const [highScore, setHighScore] = useState(parseInt(localStorage.getItem('snake_highscore')) || 0);

    const setGameOver = (status, finalScore) => {
        setIsGameOver(status);
        if (finalScore > highScore) {
            setHighScore(finalScore);
            localStorage.setItem('snake_highscore', finalScore);
        }
        updateBalance(finalScore * 2);
    };

    const gameLoopRef = useRef();

    const generateFood = useCallback(() => {
        let newFood;
        while (true) {
            newFood = {
                x: Math.floor(Math.random() * GRID_SIZE),
                y: Math.floor(Math.random() * GRID_SIZE)
            };
            const onSnake = snake.some(s => s.x === newFood.x && s.y === newFood.y);
            if (!onSnake) break;
        }
        setFood(newFood);
    }, [snake]);

    const moveSnake = useCallback(() => {
        if (isGameOver || isPaused || !hasStarted) return;

        setSnake(prevSnake => {
            const head = { ...prevSnake[0] };
            head.x += direction.x;
            head.y += direction.y;

            if (
                head.x < 0 || head.x >= GRID_SIZE ||
                head.y < 0 || head.y >= GRID_SIZE ||
                prevSnake.some(s => s.x === head.x && s.y === head.y)
            ) {
                setGameOver(true, score);
                return prevSnake;
            }

            const newSnake = [head, ...prevSnake];
            if (head.x === food.x && head.y === food.y) {
                setScore(s => s + 10);
                generateFood();
            } else {
                newSnake.pop();
            }
            return newSnake;
        });
    }, [direction, food, isGameOver, isPaused, hasStarted, score, generateFood]);

    useEffect(() => {
        gameLoopRef.current = setInterval(moveSnake, SPEED);
        return () => clearInterval(gameLoopRef.current);
    }, [moveSnake]);

    useEffect(() => {
        const handleKeyPress = (e) => {
            if (!hasStarted && (e.key.startsWith('Arrow') || e.key === ' ')) {
                setHasStarted(true);
                return;
            }
            switch (e.key) {
                case 'ArrowUp': if (direction.y !== 1) setDirection({ x: 0, y: -1 }); break;
                case 'ArrowDown': if (direction.y !== -1) setDirection({ x: 0, y: 1 }); break;
                case 'ArrowLeft': if (direction.x !== 1) setDirection({ x: -1, y: 0 }); break;
                case 'ArrowRight': if (direction.x !== -1) setDirection({ x: 1, y: 0 }); break;
                case ' ': setIsPaused(p => !p); break;
                default: break;
            }
        };
        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, [direction, hasStarted]);

    const resetGame = () => {
        setSnake(INITIAL_SNAKE);
        setDirection(INITIAL_DIRECTION);
        setIsGameOver(false);
        setScore(0);
        setIsPaused(false);
        setHasStarted(true);
        generateFood();
    };

    return (
        <GameWrapper title="Snake">
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem' }}>
                    <div className="glass-card" style={{ padding: '0.5rem 1.5rem' }}>
                        <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Score</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>{score}</div>
                    </div>
                    <div className="glass-card" style={{ padding: '0.5rem 1.5rem' }}>
                        <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>High Score</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>{highScore}</div>
                    </div>
                </div>

                <div style={{ position: 'relative', width: 'fit-content', margin: '0 auto' }}>
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: `repeat(${GRID_SIZE}, 20px)`,
                        gridTemplateRows: `repeat(${GRID_SIZE}, 20px)`,
                        background: 'rgba(155, 89, 182, 0.05)',
                        border: '4px solid var(--accent-secondary)',
                        boxShadow: '0 0 20px rgba(155, 89, 182, 0.3)',
                        borderRadius: '12px',
                        overflow: 'hidden'
                    }}>
                        {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, i) => {
                            const x = i % GRID_SIZE;
                            const y = Math.floor(i / GRID_SIZE);
                            const isHead = snake[0].x === x && snake[0].y === y;
                            const isBody = snake.slice(1).some(s => s.x === x && s.y === y);
                            const isFood = food.x === x && food.y === y;

                            return (
                                <div key={i} style={{
                                    width: '20px', height: '20px',
                                    background: isHead ? 'var(--accent-primary)' : isBody ? 'var(--accent-secondary)' : 'transparent',
                                    border: isHead || isBody ? '1px solid #1a0a2e' : '1px solid rgba(155, 89, 182, 0.1)',
                                    borderRadius: isHead ? '6px' : isBody ? '2px' : '0',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                                }}>
                                    {isFood && (
                                        <div style={{
                                            width: '16px', height: '16px',
                                            background: '#27ae60',
                                            borderRadius: '50%',
                                            boxShadow: '0 0 10px rgba(39, 174, 96, 0.4)'
                                        }} />
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    {(!hasStarted || isGameOver || isPaused) && (
                        <div className="modal-overlay" style={{ position: 'absolute', borderRadius: '12px' }}>
                            <div className="modal-content">
                                {!hasStarted ? (
                                    <>
                                        <h2 style={{ marginBottom: '1rem' }}>Ready?</h2>
                                        <p style={{ marginBottom: '1.5rem', color: 'var(--text-secondary)' }}>Press any Arrow Key or the button to start!</p>
                                        <button onClick={() => setHasStarted(true)} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: '0 auto' }}>
                                            <Play size={18} /> Start Game
                                        </button>
                                    </>
                                ) : isGameOver ? (
                                    <>
                                        <h2 style={{ marginBottom: '1rem' }}>Game Over!</h2>
                                        <p style={{ marginBottom: '1.5rem' }}>You earned <span style={{ color: '#FFD700', fontWeight: 800 }}>{score * 2} Z Coins</span></p>
                                        <button onClick={resetGame} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: '0 auto' }}>
                                            <RotateCcw size={18} /> Play Again
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <h2 style={{ marginBottom: '1rem' }}>Paused</h2>
                                        <p style={{ marginBottom: '1.5rem', color: 'var(--text-secondary)' }}>Press Space or the button to resume</p>
                                        <button onClick={() => setIsPaused(false)} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: '0 auto' }}>
                                            <Play size={18} /> Resume
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                <p style={{ color: 'var(--text-secondary)' }}>Use Arrow Keys to move • Space to Pause</p>
            </div>
        </GameWrapper>
    );
};

export default Snake;