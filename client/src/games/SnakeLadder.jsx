import React, { useState, useEffect, useRef } from 'react';
import Layout from '../components/Layout';
import { useGame } from '../context/GameContext';
import { RotateCcw } from 'lucide-react';

const SNAKES_AND_LADDERS = {
    4: 26, 13: 46, 27: 5, 33: 49, 39: 3, 42: 63, 43: 18, 50: 69,
    54: 31, 62: 81, 66: 45, 74: 92, 89: 51, 95: 75, 99: 41
};

const SnakeLadder = () => {
    const { updateBalance } = useGame();
    const [currentPos, setCurrentPos] = useState(1);
    const bgCanvasRef = useRef(null);

    useEffect(() => {
        const canvas = bgCanvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        let animId;
        let W = canvas.width = window.innerWidth;
        let H = canvas.height = window.innerHeight;

        const dots = Array.from({ length: 45 }, () => ({
            x: Math.random() * W,
            y: Math.random() * H,
            r: Math.random() * 2 + 1,
            vx: (Math.random() - 0.5) * 0.35,
            vy: (Math.random() - 0.5) * 0.35,
            color: Math.random() > 0.6 ? '#22c55e' : '#8e44ad',
        }));

        const draw = () => {
            ctx.clearRect(0, 0, W, H);
            dots.forEach(d => {
                d.x += d.vx; d.y += d.vy;
                if (d.x < 0 || d.x > W) d.vx *= -1;
                if (d.y < 0 || d.y > H) d.vy *= -1;
                ctx.beginPath();
                ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
                ctx.fillStyle = d.color + '55';
                ctx.fill();
            });
            dots.forEach((a, i) => {
                dots.slice(i + 1).forEach(b => {
                    const dist = Math.hypot(a.x - b.x, a.y - b.y);
                    if (dist < 120) {
                        ctx.beginPath();
                        ctx.moveTo(a.x, a.y);
                        ctx.lineTo(b.x, b.y);
                        ctx.strokeStyle = `rgba(142,68,173,${0.10 * (1 - dist / 120)})`;
                        ctx.lineWidth = 0.6;
                        ctx.stroke();
                    }
                });
            });
            animId = requestAnimationFrame(draw);
        };
        draw();

        const onResize = () => { W = canvas.width = window.innerWidth; H = canvas.height = window.innerHeight; };
        window.addEventListener('resize', onResize);
        return () => { cancelAnimationFrame(animId); window.removeEventListener('resize', onResize); };
    }, []);
    const [diceValue, setDiceValue] = useState(null);
    const [status, setStatus] = useState("Roll the dice to start!");
    const [isRolling, setIsRolling] = useState(false);
    const [isGameOver, setIsGameOver] = useState(false);

    const squares = [];
    let currentNum = 100;
    for (let row = 0; row < 10; row++) {
        let rowArray = [];
        for (let col = 0; col < 10; col++) {
            rowArray.push(currentNum - col);
        }
        if (row % 2 !== 0) rowArray.reverse();
        squares.push(...rowArray);
        currentNum -= 10;
    }

    const rollDice = () => {
        if (isRolling || isGameOver) return;
        setIsRolling(true);
        const finalRoll = Math.floor(Math.random() * 6) + 1;

        let rolls = 0;
        const interval = setInterval(() => {
            setDiceValue(Math.floor(Math.random() * 6) + 1);
            rolls++;
            if (rolls > 10) {
                clearInterval(interval);
                setDiceValue(finalRoll);
                movePlayer(finalRoll);
            }
        }, 50);
    };

    const movePlayer = (roll) => {
        const nextPos = currentPos + roll;
        if (nextPos > 100) {
            setStatus(`Rolled ${roll}. Too high to finish!`);
            setIsRolling(false);
            return;
        }
        setStatus(`Rolled ${roll}! Moved to ${nextPos}.`);
        setCurrentPos(nextPos);

        setTimeout(() => {
            let finalPos = nextPos;
            if (SNAKES_AND_LADDERS[nextPos]) {
                finalPos = SNAKES_AND_LADDERS[nextPos];
                setStatus(finalPos > nextPos ? `Yay! Ladder to ${finalPos}! 🪜` : `Oh no! Snake to ${finalPos}! 🐍`);
                setCurrentPos(finalPos);
            }
            if (finalPos === 100) {
                setStatus("You Win! 🎉 (+30 Z Coins)");
                updateBalance(30);
                setIsGameOver(true);
            }
            setIsRolling(false);
        }, 600);
    };

    const resetGame = () => {
        setCurrentPos(1);
        setDiceValue(null);
        setStatus("Roll the dice to start!");
        setIsGameOver(false);
    };

    const ladderStarts = Object.keys(SNAKES_AND_LADDERS).filter(k => SNAKES_AND_LADDERS[k] > parseInt(k)).map(Number);
    const snakeStarts = Object.keys(SNAKES_AND_LADDERS).filter(k => SNAKES_AND_LADDERS[k] < parseInt(k)).map(Number);

    const renderSVGOverlay = () => {
        return (
            <svg className="sl-svg-overlay" width="100%" height="100%" style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 5 }}>
                {Object.entries(SNAKES_AND_LADDERS).map(([startStr, end]) => {
                    const start = parseInt(startStr);
                    const isLadder = end > start;
                    
                    const getCoords = (N) => {
                        const row = Math.floor((N - 1) / 10);
                        const col = row % 2 === 0 ? (N - 1) % 10 : 9 - ((N - 1) % 10);
                        return { x: col * 10 + 5, y: (9 - row) * 10 + 5 };
                    };

                    const c1 = getCoords(start);
                    const c2 = getCoords(end);

                    if (isLadder) {
                        return (
                            <g key={`ladder-${start}`}>
                                <line x1={`${c1.x}%`} y1={`${c1.y}%`} x2={`${c2.x}%`} y2={`${c2.y}%`} stroke="#fcd34d" strokeWidth="12" strokeLinecap="round" opacity="0.9" />
                                <line x1={`${c1.x}%`} y1={`${c1.y}%`} x2={`${c2.x}%`} y2={`${c2.y}%`} stroke="#d97706" strokeWidth="12" strokeDasharray="4 8" opacity="0.9" />
                                <text x={`${c1.x}%`} y={`${c1.y}%`} fontSize="18" textAnchor="middle" dominantBaseline="central" dy="12">🪜</text>
                            </g>
                        );
                    } else {
                        const dx = c2.x - c1.x;
                        const dy = c2.y - c1.y;
                        const cx = (c1.x + c2.x) / 2 - dy * 0.25;
                        const cy = (c1.y + c2.y) / 2 + dx * 0.25;

                        return (
                            <g key={`snake-${start}`}>
                                <path d={`M ${c1.x}% ${c1.y}% Q ${cx}% ${cy}% ${c2.x}% ${c2.y}%`} fill="none" stroke="#fca5a5" strokeWidth="10" strokeLinecap="round" opacity="0.9" />
                                <path d={`M ${c1.x}% ${c1.y}% Q ${cx}% ${cy}% ${c2.x}% ${c2.y}%`} fill="none" stroke="#ef4444" strokeWidth="10" strokeDasharray="6 8" strokeLinecap="round" />
                                <text x={`${c1.x}%`} y={`${c1.y}%`} fontSize="18" textAnchor="middle" dominantBaseline="central" dy="12">🐍</text>
                            </g>
                        );
                    }
                })}
            </svg>
        );
    };

    return (
        <Layout>
            <div className="sl-root">
                <canvas ref={bgCanvasRef} className="sl-bg-canvas" />
                <div className="sl-blob sl-blob-1" />
                <div className="sl-blob sl-blob-2" />

                <div className="sl-inner">
                    <div className="sl-page-header">
                        <h1 className="sl-title">
                            <span className="sl-title-dark">Snake &</span>
                            <span className="sl-title-purple"> Ladder.</span>
                            <span className="sl-title-green"> Climb to win.</span>
                        </h1>
                    </div>

                    {/* Status bar */}
                    <div className="sl-status-row">
                        <div className="sl-status">
                            {status.includes('Z Coins') ? (
                                <>{status.split('(+')[0]}<span className="sl-coin-text">(+{status.split('(+')[1]}</span></>
                            ) : status}
                        </div>
                        <button className="sl-restart-btn" onClick={resetGame}>
                            <RotateCcw size={15} /> Restart
                        </button>
                    </div>

                    {/* Board & Controls Wrap */}
                    <div className="sl-board-wrap">
                        <div className="sl-board">
                            {renderSVGOverlay()}
                            {squares.map((num, i) => {
                                const isEven = (Math.floor(i / 10) + (i % 10)) % 2 === 0;
                                let cellType = '';
                                if (ladderStarts.includes(num)) cellType = 'sl-cell-ladder';
                                if (snakeStarts.includes(num)) cellType = 'sl-cell-snake';
                                
                                return (
                                    <div key={num} className={`sl-cell ${isEven ? 'sl-cell-even' : 'sl-cell-odd'} ${cellType}`}>
                                        <span className="sl-cell-num">{num}</span>
                                        {currentPos === num && <div className="sl-pawn" />}
                                    </div>
                                );
                            })}
                        </div>

                        <div className="sl-controls">
                            <button
                                onClick={rollDice}
                                disabled={isRolling || isGameOver}
                                className="sl-roll-btn"
                            >
                                {isGameOver ? 'Game Over' : 'Roll Dice 🎲'}
                            </button>

                            <div className="sl-dice">{diceValue || '–'}</div>
                        </div>
                    </div>
                </div>

                <style>{styles}</style>
            </div>
        </Layout>
    );
};

const styles = `
    .sl-root {
        position: relative;
        min-height: 100vh;
        overflow: hidden;
        background: linear-gradient(145deg, #faf8ff 0%, #f0f9f0 50%, #fdf6ff 100%);
    }
    .sl-bg-canvas {
        position: fixed; inset: 0;
        pointer-events: none; z-index: 0;
    }
    .sl-blob {
        position: fixed; border-radius: 50%;
        filter: blur(80px); pointer-events: none; z-index: 0;
    }
    .sl-blob-1 { width: 500px; height: 500px; background: rgba(142,68,173,0.07); top: -100px; right: -100px; }
    .sl-blob-2 { width: 400px; height: 400px; background: rgba(34,197,94,0.06); bottom: 80px; left: -80px; }

    .sl-inner {
        position: relative; z-index: 1;
        max-width: 720px; margin: 0 auto;
        padding: 3rem 2rem 5rem;
    }
    .sl-page-header { margin-bottom: 2rem; text-align: center; }
    .sl-title {
        display: inline-flex; flex-wrap: wrap; justify-content: center; gap: 0.4rem;
        font-family: var(--font-ui);
        font-size: clamp(1.8rem, 3.5vw, 2.6rem);
        font-weight: 900; line-height: 1.15; letter-spacing: -0.5px;
        margin: 0 0 0.6rem;
    }
    .sl-title-dark { color: var(--text-primary); }
    .sl-title-purple {
        background: linear-gradient(135deg, #8e44ad, #732d91);
        -webkit-background-clip: text; background-clip: text;
        -webkit-text-fill-color: transparent;
    }
    .sl-title-green {
        background: linear-gradient(135deg, #22c55e, #16a34a);
        -webkit-background-clip: text; background-clip: text;
        -webkit-text-fill-color: transparent;
    }

    .sl-status-row {
        display: flex; justify-content: space-between; align-items: center;
        margin-bottom: 1.2rem;
        background: rgba(255,255,255,0.85);
        border: 1px solid rgba(142,68,173,0.14);
        border-radius: 14px;
        padding: 0.75rem 1.2rem;
        backdrop-filter: blur(8px);
        box-shadow: 0 4px 14px rgba(142,68,173,0.06);
    }
    .sl-status {
        font-family: var(--font-ui);
        font-size: 1.1rem; font-weight: 800;
        color: var(--text-primary);
        margin: 0; flex: 1;
    }
    .sl-coin-text { color: #FFD700; }
    .sl-restart-btn {
        display: inline-flex; align-items: center; gap: 0.4rem;
        background: rgba(142,68,173,0.06);
        border: 1px solid rgba(142,68,173,0.18);
        color: var(--accent-primary);
        padding: 0.5rem 1rem;
        border-radius: 999px;
        font-weight: 700; font-size: 0.85rem;
        font-family: var(--font-ui);
        cursor: pointer;
        transition: all 0.2s;
    }
    .sl-restart-btn:hover {
        background: rgba(142,68,173,0.12);
        transform: translateY(-1px);
    }

    .sl-board-wrap {
        background: rgba(255,255,255,0.9);
        border: 1px solid rgba(142,68,173,0.14);
        border-radius: 20px;
        padding: 1.5rem;
        box-shadow: 0 20px 60px rgba(142,68,173,0.12), 0 4px 16px rgba(0,0,0,0.06);
        backdrop-filter: blur(12px);
        display: flex; flex-direction: column; align-items: center; gap: 1.5rem;
        margin-bottom: 2rem;
    }
    .sl-board {
        position: relative;
        width: 100%;
        max-width: 520px;
        aspect-ratio: 1;
        background-color: white;
        border: 4px solid var(--accent-primary);
        border-radius: 12px;
        box-shadow: 0 10px 30px rgba(142,68,173,0.25);
        display: grid;
        grid-template-columns: repeat(10, 1fr);
        grid-template-rows: repeat(10, 1fr);
        overflow: hidden;
    }
    .sl-cell {
        position: relative; display: flex; align-items: center; justify-content: center;
        border: 1px solid rgba(0,0,0,0.04);
    }
    .sl-cell-even { background-color: rgba(142,68,173,0.03); }
    .sl-cell-odd { background-color: rgba(255,255,255,0.8); }
    .sl-cell-ladder { background-color: rgba(34,197,94,0.12) !important; }
    .sl-cell-snake { background-color: rgba(239,68,68,0.12) !important; }
    
    .sl-cell-num {
        position: absolute;
        top: 3px; left: 5px;
        font-size: 0.75rem;
        font-weight: 700;
        color: rgba(0,0,0,0.25);
        font-family: var(--font-ui);
    }

    .sl-pawn {
        position: relative;

        width: 70%; height: 70%;
        background: radial-gradient(circle at 30% 30%, #ff4b2b, #ff416c);
        border-radius: 50%;
        box-shadow: 0 5px 15px rgba(0,0,0,0.4);
        z-index: 10;
        border: 2px solid white;
        animation: slPulse 1s infinite;
    }

    .sl-controls {
        display: flex; align-items: center; justify-content: center;
        gap: 1.5rem; flex-wrap: wrap; width: 100%;
    }
    .sl-roll-btn {
        padding: 0.95rem 2rem;
        background: linear-gradient(135deg, #8e44ad, #732d91);
        color: white; border: none;
        border-radius: 999px;
        font-weight: 700; font-family: var(--font-ui);
        font-size: 1rem; cursor: pointer;
        transition: all 0.3s;
        box-shadow: 0 6px 20px rgba(142,68,173,0.28);
    }
    .sl-roll-btn:hover:not(:disabled) {
        transform: translateY(-2px);
        box-shadow: 0 10px 28px rgba(142,68,173,0.38);
    }
    .sl-roll-btn:disabled { opacity: 0.55; cursor: not-allowed; }

    .sl-dice {
        width: 64px; height: 64px;
        background: rgba(142,68,173,0.08);
        border: 2px solid var(--accent-primary);
        border-radius: 14px;
        display: flex; align-items: center; justify-content: center;
        font-size: 2rem; font-weight: 900;
        color: var(--accent-primary);
        font-family: var(--font-ui);
        box-shadow: 0 8px 18px rgba(142,68,173,0.18);
    }

    @keyframes slPulse {
        0% { transform: scale(1); }
        50% { transform: scale(1.1); }
        100% { transform: scale(1); }
    }
    @media (max-width: 640px) {
        .sl-inner { padding: 2rem 1.25rem 3rem; }
    }
`;

export default SnakeLadder;