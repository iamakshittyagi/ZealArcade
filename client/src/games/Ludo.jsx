import React, { useState, useEffect, useRef } from 'react';
import { useGame } from '../context/GameContext';
import Layout from '../components/Layout';
import { RotateCcw } from 'lucide-react';

const TRACK_COORDS = [
    {r: 7, c: 2}, {r: 7, c: 3}, {r: 7, c: 4}, {r: 7, c: 5}, {r: 7, c: 6},
    {r: 6, c: 7}, {r: 5, c: 7}, {r: 4, c: 7}, {r: 3, c: 7}, {r: 2, c: 7}, {r: 1, c: 7},
    {r: 1, c: 8}, {r: 1, c: 9},
    {r: 2, c: 9}, {r: 3, c: 9}, {r: 4, c: 9}, {r: 5, c: 9}, {r: 6, c: 9},
    {r: 7, c: 10}, {r: 7, c: 11}, {r: 7, c: 12}, {r: 7, c: 13}, {r: 7, c: 14}, {r: 7, c: 15},
    {r: 8, c: 15}, {r: 9, c: 15},
    {r: 9, c: 14}, {r: 9, c: 13}, {r: 9, c: 12}, {r: 9, c: 11}, {r: 9, c: 10},
    {r: 10, c: 9}, {r: 11, c: 9}, {r: 12, c: 9}, {r: 13, c: 9}, {r: 14, c: 9}, {r: 15, c: 9},
    {r: 15, c: 8}, {r: 15, c: 7},
    {r: 14, c: 7}, {r: 13, c: 7}, {r: 12, c: 7}, {r: 11, c: 7}, {r: 10, c: 7},
    {r: 9, c: 6}, {r: 9, c: 5}, {r: 9, c: 4}, {r: 9, c: 3}, {r: 9, c: 2}, {r: 9, c: 1},
    {r: 8, c: 1}, {r: 7, c: 1}
];

const PATHS = {
    green: TRACK_COORDS.slice(0, 51).concat([{r: 8, c: 2}, {r: 8, c: 3}, {r: 8, c: 4}, {r: 8, c: 5}, {r: 8, c: 6}]),
    yellow: TRACK_COORDS.slice(13, 52).concat(TRACK_COORDS.slice(0, 12)).concat([{r: 2, c: 8}, {r: 3, c: 8}, {r: 4, c: 8}, {r: 5, c: 8}, {r: 6, c: 8}]),
    blue: TRACK_COORDS.slice(26, 52).concat(TRACK_COORDS.slice(0, 25)).concat([{r: 8, c: 14}, {r: 8, c: 13}, {r: 8, c: 12}, {r: 8, c: 11}, {r: 8, c: 10}]),
    red: TRACK_COORDS.slice(39, 52).concat(TRACK_COORDS.slice(0, 38)).concat([{r: 14, c: 8}, {r: 13, c: 8}, {r: 12, c: 8}, {r: 11, c: 8}, {r: 10, c: 8}])
};

const BASE_COORDS = {
    red: [{r: 12, c: 3}, {r: 12, c: 4}, {r: 13, c: 3}, {r: 13, c: 4}],
    green: [{r: 3, c: 3}, {r: 3, c: 4}, {r: 4, c: 3}, {r: 4, c: 4}],
    blue: [{r: 12, c: 12}, {r: 12, c: 13}, {r: 13, c: 12}, {r: 13, c: 13}],
    yellow: [{r: 3, c: 12}, {r: 3, c: 13}, {r: 4, c: 12}, {r: 4, c: 13}]
};

const renderBoardCells = () => {
    const cells = [];
    for (let r = 1; r <= 15; r++) {
        for (let c = 1; c <= 15; c++) {
            if (r <= 6 && c <= 6) continue;
            if (r <= 6 && c >= 10) continue;
            if (r >= 10 && c <= 6) continue;
            if (r >= 10 && c >= 10) continue;
            if (r >= 7 && r <= 9 && c >= 7 && c <= 9) continue;

            let cellClass = "lu-cell";
            let content = null;

            if (r === 8 && c >= 2 && c <= 6) cellClass += " bg-green-safe";
            else if (c === 8 && r >= 2 && r <= 6) cellClass += " bg-yellow-safe";
            else if (r === 8 && c >= 10 && c <= 14) cellClass += " bg-blue-safe";
            else if (c === 8 && r >= 10 && r <= 14) cellClass += " bg-red-safe";
            else if (r === 7 && c === 2) { cellClass += " bg-green-safe lu-star-cell"; content = "★"; }
            else if (r === 2 && c === 9) { cellClass += " bg-yellow-safe lu-star-cell"; content = "★"; }
            else if (r === 9 && c === 14) { cellClass += " bg-blue-safe lu-star-cell"; content = "★"; }
            else if (r === 14 && c === 7) { cellClass += " bg-red-safe lu-star-cell"; content = "★"; }
            else if (r === 3 && c === 7) { cellClass += " lu-star-cell"; content = "★"; }
            else if (r === 7 && c === 13) { cellClass += " lu-star-cell"; content = "★"; }
            else if (r === 13 && c === 9) { cellClass += " lu-star-cell"; content = "★"; }
            else if (r === 9 && c === 3) { cellClass += " lu-star-cell"; content = "★"; }

            cells.push(
                <div key={`cell-${r}-${c}`} className={cellClass} style={{ gridArea: `${r} / ${c} / ${r + 1} / ${c + 1}` }}>
                    {content}
                </div>
            );
        }
    }
    return cells;
};

const renderBoardVisuals = () => {
    return (
        <>
            <div className="lu-base bg-green" style={{ gridArea: '1 / 1 / 7 / 7' }} />
            <div className="lu-base-inner" style={{ gridArea: '2 / 2 / 6 / 6' }} />
            
            <div className="lu-base bg-yellow" style={{ gridArea: '1 / 10 / 7 / 16' }} />
            <div className="lu-base-inner" style={{ gridArea: '2 / 11 / 6 / 15' }} />

            <div className="lu-base bg-blue" style={{ gridArea: '10 / 10 / 16 / 16' }} />
            <div className="lu-base-inner" style={{ gridArea: '11 / 11 / 15 / 15' }} />

            <div className="lu-base bg-red" style={{ gridArea: '10 / 1 / 16 / 7' }} />
            <div className="lu-base-inner" style={{ gridArea: '11 / 2 / 15 / 6' }} />

            {['green', 'yellow', 'blue', 'red'].map(color => (
                BASE_COORDS[color].map((pos, i) => (
                    <div key={`${color}-spot-${i}`} className="lu-base-spot-wrap" style={{ gridArea: `${pos.r} / ${pos.c} / ${pos.r+1} / ${pos.c+1}` }}>
                        <div className={`lu-base-spot bg-${color}`} />
                    </div>
                ))
            ))}

            <div className="lu-center-home" style={{ gridArea: '7 / 7 / 10 / 10' }}>
                <div className="lu-center-t-top bg-yellow" />
                <div className="lu-center-t-right bg-blue" />
                <div className="lu-center-t-bottom bg-red" />
                <div className="lu-center-t-left bg-green" />
            </div>

            {renderBoardCells()}
        </>
    );
};

const Ludo = () => {
    const { user, updateBalance } = useGame();
    const [gamePhase, setGamePhase] = useState('SETUP');
    const [numHumanPlayers, setNumHumanPlayers] = useState(1);
    const [playerConfigs, setPlayerConfigs] = useState([
        { name: user?.username || user || 'Player 1', color: 'red', isAI: false },
        { name: 'AI 1', color: 'green', isAI: true },
        { name: 'AI 2', color: 'blue', isAI: true },
        { name: 'AI 3', color: 'yellow', isAI: true }
    ]);

    const [players, setPlayers] = useState([]);
    const [currentTurn, setCurrentTurn] = useState(0);
    const [diceValue, setDiceValue] = useState(null);
    const [status, setStatus] = useState("");
    const [isRolling, setIsRolling] = useState(false);
    const [isGameOver, setIsGameOver] = useState(false);
    const [waitingForChoice, setWaitingForChoice] = useState(false);

    const bgCanvasRef = useRef(null);
    const availableColors = ['red', 'green', 'blue', 'yellow'];

    // ── Background particle canvas (matches Welcome/Arcade/Rewards) ──
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

    // ── Game logic (unchanged) ──
    const handleSetupSubmit = () => {
        const initialPlayers = playerConfigs.map(config => ({
            ...config,
            pawns: [
                { pos: -1, finished: false },
                { pos: -1, finished: false },
                { pos: -1, finished: false },
                { pos: -1, finished: false }
            ]
        }));
        setPlayers(initialPlayers);
        setGamePhase('PLAYING');
        setCurrentTurn(0);
        setStatus(`${initialPlayers[0].name}'s turn! Roll the dice!`);
    };

    const updateHumanCount = (count) => {
        setNumHumanPlayers(count);
        const newConfigs = [...playerConfigs];
        for (let i = 0; i < 4; i++) {
            if (i < count) {
                newConfigs[i].isAI = false;
                if (newConfigs[i].name.startsWith('AI')) newConfigs[i].name = `Player ${i + 1}`;
            } else {
                newConfigs[i].isAI = true;
                newConfigs[i].name = `AI ${i - count + 1}`;
            }
        }
        setPlayerConfigs(newConfigs);
    };

    const updatePlayerConfig = (index, field, value) => {
        const newConfigs = [...playerConfigs];
        newConfigs[index][field] = value;
        setPlayerConfigs(newConfigs);
    };

    const rollDice = () => {
        if (isRolling || isGameOver || gamePhase !== 'PLAYING' || waitingForChoice) return;
        setIsRolling(true);
        const finalRoll = Math.floor(Math.random() * 6) + 1;
        let rolls = 0;
        const interval = setInterval(() => {
            setDiceValue(Math.floor(Math.random() * 6) + 1);
            rolls++;
            if (rolls > 10) {
                clearInterval(interval);
                setDiceValue(finalRoll);
                processRoll(finalRoll);
            }
        }, 50);
    };

    const processRoll = (roll) => {
        const p = players[currentTurn];
        const movablePawns = getMovablePawns(p, roll);
        if (movablePawns.length === 0) {
            setStatus(`${p.name} rolled a ${roll}. No moves possible!`);
            setTimeout(() => { nextTurn(); setIsRolling(false); }, 1000);
        } else if (movablePawns.length === 1 && (p.isAI || roll !== 6 || p.pawns.filter(pn => pn.pos >= 0).length === 0)) {
            movePawn(movablePawns[0], roll);
        } else {
            setStatus(`${p.name}, choose a pawn to move!`);
            setWaitingForChoice(true);
            if (p.isAI) {
                setTimeout(() => {
                    const choice = aiChoosePawn(p, movablePawns, roll);
                    movePawn(choice, roll);
                }, 1000);
            }
        }
    };

    const getMovablePawns = (player, roll) => {
        return player.pawns.reduce((acc, pawn, idx) => {
            if (pawn.finished) return acc;
            if (pawn.pos === -1 && roll === 6) acc.push(idx);
            else if (pawn.pos >= 0) {
                if (pawn.pos + roll < PATHS[player.color].length) acc.push(idx);
            }
            return acc;
        }, []);
    };

    const aiChoosePawn = (player, movableIndices, roll) => {
        const finishers = movableIndices.filter(idx => player.pawns[idx].pos + roll === PATHS[player.color].length - 1);
        if (finishers.length > 0) return finishers[0];
        const onTrack = movableIndices.filter(idx => player.pawns[idx].pos >= 0);
        if (onTrack.length > 0) {
            return onTrack.reduce((prev, curr) => (player.pawns[curr].pos > player.pawns[prev].pos ? curr : prev));
        }
        return movableIndices[0];
    };

    const movePawn = (pawnIdx, roll) => {
        const p = players[currentTurn];
        const newPlayers = [...players];
        const pawn = newPlayers[currentTurn].pawns[pawnIdx];
        let nextPos;
        if (pawn.pos === -1) nextPos = 0;
        else nextPos = pawn.pos + roll;
        pawn.pos = nextPos;
        if (nextPos === PATHS[p.color].length - 1) {
            pawn.finished = true;
            if (!p.isAI) updateBalance(100);
            setStatus(`${p.name} finished a pawn! 🎉`);
        } else {
            setStatus(`${p.name} moved a pawn!`);
        }
        setPlayers(newPlayers);
        setWaitingForChoice(false);
        setTimeout(() => {
            if (roll === 6 && !newPlayers[currentTurn].pawns.every(pn => pn.finished)) {
                setStatus(`${p.name} rolled a 6! Roll again! 🎲`);
                setIsRolling(false);
            } else {
                nextTurn(newPlayers);
                setIsRolling(false);
            }
        }, 1000);
    };

    const nextTurn = (currentPlayers = players) => {
        if (currentPlayers.every(p => p.pawns.every(pn => pn.finished))) {
            setIsGameOver(true);
            setStatus("Game Over! All players finished!");
            return;
        }
        let nextIdx = (currentTurn + 1) % 4;
        while (currentPlayers[nextIdx].pawns.every(pn => pn.finished)) {
            nextIdx = (nextIdx + 1) % 4;
        }
        setCurrentTurn(nextIdx);
        setStatus(`${currentPlayers[nextIdx].name}'s turn!`);
    };

    const handlePawnClick = (pIdx) => {
        if (!waitingForChoice || players[currentTurn].isAI) return;
        const movable = getMovablePawns(players[currentTurn], diceValue);
        if (movable.includes(pIdx)) movePawn(pIdx, diceValue);
    };

    const resetGame = () => {
        setGamePhase('SETUP');
        setIsGameOver(false);
        setDiceValue(null);
        setWaitingForChoice(false);
    };

    const getTokenStyle = (color) => {
        switch (color) {
            case 'red': return 'radial-gradient(circle at 30% 30%, #ef4444, #991b1b)';
            case 'green': return 'radial-gradient(circle at 30% 30%, #22c55e, #14532d)';
            case 'yellow': return 'radial-gradient(circle at 30% 30%, #eab308, #713f12)';
            case 'blue': return 'radial-gradient(circle at 30% 30%, #3b82f6, #1e3a8a)';
            default: return 'white';
        }
    };

    // ── SETUP screen ──
    if (gamePhase === 'SETUP') {
        return (
            <Layout>
                <div className="lu-root">
                    <canvas ref={bgCanvasRef} className="lu-bg-canvas" />
                    <div className="lu-blob lu-blob-1" />
                    <div className="lu-blob lu-blob-2" />

                    <div className="lu-inner">
                        <div className="lu-page-header">
                            <h1 className="lu-title">
                                <span className="lu-title-dark">Set up</span>
                                <span className="lu-title-purple"> your</span>
                                <span className="lu-title-green"> Ludo board.</span>
                            </h1>
                            <p className="lu-subtitle">Pick how many humans are playing, then name your team.</p>
                        </div>

                        <div className="lu-setup-card">
                            <div className="lu-setup-section">
                                <label className="lu-setup-label">Number of Human Players</label>
                                <div className="lu-count-row">
                                    {[1, 2, 3, 4].map(n => (
                                        <button
                                            key={n}
                                            onClick={() => updateHumanCount(n)}
                                            className={`lu-count-btn ${numHumanPlayers === n ? 'lu-count-btn--active' : ''}`}
                                        >
                                            {n}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="lu-players-list">
                                {playerConfigs.map((config, i) => (
                                    <div key={i} className="lu-player-row" style={{ borderLeftColor: config.color === 'yellow' ? '#eab308' : config.color }}>
                                        <div className="lu-player-field">
                                            <label className="lu-field-label">
                                                {config.isAI ? `AI ${i - numHumanPlayers + 1}` : `Player ${i + 1}`}
                                            </label>
                                            <input
                                                type="text"
                                                value={config.name}
                                                disabled={config.isAI}
                                                onChange={(e) => updatePlayerConfig(i, 'name', e.target.value)}
                                                className="lu-text-input"
                                            />
                                        </div>
                                        <div className="lu-color-field">
                                            <label className="lu-field-label">Color</label>
                                            <select
                                                value={config.color}
                                                onChange={(e) => updatePlayerConfig(i, 'color', e.target.value)}
                                                className="lu-select-input"
                                            >
                                                {availableColors.map(c => (
                                                    <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <button onClick={handleSetupSubmit} className="lu-start-btn">
                                Start Game →
                            </button>
                        </div>
                    </div>

                    <style>{styles}</style>
                </div>
            </Layout>
        );
    }

    // ── PLAYING screen ──
    return (
        <Layout>
            <div className="lu-root">
                <canvas ref={bgCanvasRef} className="lu-bg-canvas" />
                <div className="lu-blob lu-blob-1" />
                <div className="lu-blob lu-blob-2" />

                <div className="lu-inner">
                    <div className="lu-page-header">
                        <h1 className="lu-title">
                            <span className="lu-title-dark">Ludo.</span>
                            <span className="lu-title-purple"> Roll.</span>
                            <span className="lu-title-green"> Race. Win.</span>
                        </h1>
                    </div>

                    {/* Status bar */}
                    <div className="lu-status-row">
                        <div className="lu-status" style={{
                            color: players[currentTurn] ? (
                                players[currentTurn].color === 'red' ? '#ef4444' :
                                players[currentTurn].color === 'green' ? '#22c55e' :
                                players[currentTurn].color === 'yellow' ? '#eab308' : '#3b82f6'
                            ) : 'var(--text-primary)'
                        }}>
                            {status}
                        </div>
                        <button className="lu-restart-btn" onClick={resetGame}>
                            <RotateCcw size={15} /> Restart
                        </button>
                    </div>

                    {/* Board & Controls Wrap */}
                    <div className="lu-board-wrap">
                        <div className="lu-board">
                            {renderBoardVisuals()}
                            {players.map((player, pIdx) => (
                                player.pawns.map((pawn, pnIdx) => {
                                    const coord = pawn.pos === -1
                                        ? BASE_COORDS[player.color][pnIdx]
                                        : (PATHS[player.color] ? PATHS[player.color][pawn.pos] : null);
                                    if (!coord) return null;
                                    const isMovable = waitingForChoice && currentTurn === pIdx && !player.isAI &&
                                        getMovablePawns(player, diceValue).includes(pnIdx);
                                    return (
                                        <div
                                            key={`${player.color}-${pnIdx}`}
                                            onClick={() => handlePawnClick(pnIdx)}
                                            className="lu-pawn-wrap"
                                            style={{
                                                gridArea: `${coord.r} / ${coord.c} / ${coord.r + 1} / ${coord.c + 1}`,
                                                zIndex: 10 + pnIdx + (pIdx * 4),
                                                cursor: isMovable ? 'pointer' : 'default'
                                            }}
                                        >
                                            <div
                                                className={`lu-pawn ${isMovable ? 'lu-pawn--movable' : ''}`}
                                                style={{
                                                    background: getTokenStyle(player.color),
                                                    opacity: pawn.finished ? 0.3 : 1,
                                                }}
                                            />
                                            {(pawn.pos >= 0 || (pawn.pos === -1 && pnIdx === 0)) && (
                                                <div
                                                    className="lu-pawn-label"
                                                    style={{ borderColor: player.color === 'yellow' ? '#eab308' : player.color }}
                                                >
                                                    {player.name}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })
                            ))}
                        </div>

                        <div className="lu-controls">
                            <button
                                onClick={rollDice}
                                disabled={isRolling || isGameOver || (players[currentTurn] && players[currentTurn].isAI) || waitingForChoice}
                                className="lu-roll-btn"
                            >
                                {isGameOver
                                    ? 'Game Over'
                                    : (waitingForChoice && !players[currentTurn].isAI
                                        ? 'Choose Pawn'
                                        : (players[currentTurn] && players[currentTurn].isAI ? 'AI Thinking…' : 'Roll Dice 🎲'))}
                            </button>

                            <div className="lu-dice">{diceValue || '–'}</div>
                        </div>
                    </div>
                </div>

                <style>{styles}</style>
            </div>
        </Layout>
    );
};

const styles = `
    .lu-root {
        position: relative;
        min-height: 100vh;
        overflow: hidden;
        background: linear-gradient(145deg, #faf8ff 0%, #f0f9f0 50%, #fdf6ff 100%);
    }
    .lu-bg-canvas {
        position: fixed; inset: 0;
        pointer-events: none; z-index: 0;
    }
    .lu-blob {
        position: fixed; border-radius: 50%;
        filter: blur(80px); pointer-events: none; z-index: 0;
    }
    .lu-blob-1 { width: 500px; height: 500px; background: rgba(142,68,173,0.07); top: -100px; right: -100px; }
    .lu-blob-2 { width: 400px; height: 400px; background: rgba(34,197,94,0.06); bottom: 80px; left: -80px; }

    .lu-inner {
        position: relative; z-index: 1;
        max-width: 720px; margin: 0 auto;
        padding: 3rem 2rem 5rem;
    }
    .lu-page-header { margin-bottom: 2rem; text-align: center; }
    .lu-title {
        display: inline-flex; flex-wrap: wrap; justify-content: center; gap: 0.4rem;
        font-family: var(--font-ui);
        font-size: clamp(1.8rem, 3.5vw, 2.6rem);
        font-weight: 900; line-height: 1.15; letter-spacing: -0.5px;
        margin: 0 0 0.6rem;
    }
    .lu-title-dark { color: var(--text-primary); }
    .lu-title-purple {
        background: linear-gradient(135deg, #8e44ad, #732d91);
        -webkit-background-clip: text; background-clip: text;
        -webkit-text-fill-color: transparent;
    }
    .lu-title-green {
        background: linear-gradient(135deg, #22c55e, #16a34a);
        -webkit-background-clip: text; background-clip: text;
        -webkit-text-fill-color: transparent;
    }
    .lu-subtitle {
        color: var(--text-secondary);
        font-size: 1rem; line-height: 1.6;
        max-width: 480px; margin: 0 auto;
    }

    /* Setup */
    .lu-setup-card {
        background: rgba(255,255,255,0.9);
        border: 1px solid rgba(142,68,173,0.14);
        border-radius: 20px;
        padding: 2rem;
        backdrop-filter: blur(12px);
        box-shadow: 0 20px 60px rgba(142,68,173,0.12), 0 4px 16px rgba(0,0,0,0.06);
    }
    .lu-setup-section { margin-bottom: 1.5rem; }
    .lu-setup-label {
        display: block;
        font-size: 0.8rem; font-weight: 700;
        color: var(--text-secondary);
        text-transform: uppercase; letter-spacing: 0.07em;
        margin-bottom: 0.75rem;
        font-family: var(--font-ui);
    }
    .lu-count-row { display: flex; gap: 0.75rem; }
    .lu-count-btn {
        flex: 1;
        padding: 0.7rem 1rem;
        border-radius: 12px;
        border: 1.5px solid rgba(142,68,173,0.2);
        background: rgba(142,68,173,0.04);
        color: var(--accent-primary);
        font-weight: 700; font-family: var(--font-ui);
        font-size: 1rem; cursor: pointer;
        transition: all 0.25s;
    }
    .lu-count-btn:hover {
        background: rgba(142,68,173,0.1);
        transform: translateY(-1px);
    }
    .lu-count-btn--active {
        background: linear-gradient(135deg, #8e44ad, #732d91);
        color: white; border-color: transparent;
        box-shadow: 0 4px 14px rgba(142,68,173,0.28);
    }

    .lu-players-list {
        display: flex; flex-direction: column; gap: 0.85rem;
        margin-bottom: 1.5rem;
    }
    .lu-player-row {
        display: flex; gap: 1rem; align-items: center;
        padding: 0.85rem 1rem;
        border-radius: 12px;
        background: rgba(142,68,173,0.04);
        border: 1px solid rgba(142,68,173,0.12);
        border-left-width: 5px; border-left-style: solid;
    }
    .lu-player-field { flex: 1; }
    .lu-color-field { width: 130px; }
    .lu-field-label {
        display: block;
        font-size: 0.7rem; font-weight: 700;
        color: var(--text-secondary);
        text-transform: uppercase; letter-spacing: 0.06em;
        margin-bottom: 0.3rem;
        font-family: var(--font-ui);
    }
    .lu-text-input, .lu-select-input {
        width: 100%;
        padding: 0.55rem 0.75rem;
        border-radius: 10px;
        border: 1.5px solid rgba(142,68,173,0.18);
        background: white;
        color: var(--text-primary);
        font-family: inherit; font-size: 0.9rem;
        outline: none; transition: all 0.2s;
        box-sizing: border-box;
    }
    .lu-text-input:focus, .lu-select-input:focus {
        border-color: #8e44ad;
        box-shadow: 0 0 0 3px rgba(142,68,173,0.1);
    }
    .lu-text-input:disabled { opacity: 0.6; cursor: not-allowed; }

    .lu-start-btn {
        width: 100%;
        padding: 1rem 2rem;
        background: linear-gradient(135deg, #8e44ad, #732d91);
        color: white; border: none;
        border-radius: 999px;
        font-weight: 700; font-family: var(--font-ui);
        font-size: 1rem; cursor: pointer;
        transition: all 0.3s;
        box-shadow: 0 6px 20px rgba(142,68,173,0.28);
    }
    .lu-start-btn:hover {
        transform: translateY(-2px);
        box-shadow: 0 10px 28px rgba(142,68,173,0.38);
    }

    /* Playing */
    .lu-status-row {
        display: flex; justify-content: space-between; align-items: center;
        margin-bottom: 1.2rem;
        background: rgba(255,255,255,0.85);
        border: 1px solid rgba(142,68,173,0.14);
        border-radius: 14px;
        padding: 0.75rem 1.2rem;
        backdrop-filter: blur(8px);
        box-shadow: 0 4px 14px rgba(142,68,173,0.06);
    }
    .lu-status {
        font-family: var(--font-ui);
        font-size: 1.1rem; font-weight: 800;
        margin: 0; flex: 1;
    }
    .lu-restart-btn {
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
    .lu-restart-btn:hover {
        background: rgba(142,68,173,0.12);
        transform: translateY(-1px);
    }

    .lu-board-wrap {
        background: rgba(255,255,255,0.9);
        border: 1px solid rgba(142,68,173,0.14);
        border-radius: 20px;
        padding: 1.5rem;
        box-shadow: 0 20px 60px rgba(142,68,173,0.12), 0 4px 16px rgba(0,0,0,0.06);
        backdrop-filter: blur(12px);
        display: flex; flex-direction: column; align-items: center; gap: 1.5rem;
        margin-bottom: 2rem;
    }
    .lu-board {
        position: relative;
        width: 100%;
        max-width: 520px;
        aspect-ratio: 1;
        background-color: white;
        border: 4px solid var(--accent-primary);
        border-radius: 12px;
        box-shadow: 0 10px 30px rgba(142,68,173,0.25);
        display: grid;
        grid-template-columns: repeat(15, 1fr);
        grid-template-rows: repeat(15, 1fr);
        overflow: hidden;
    }

    .bg-green { background-color: #22c55e; }
    .bg-yellow { background-color: #eab308; }
    .bg-blue { background-color: #3b82f6; }
    .bg-red { background-color: #ef4444; }

    .bg-green-safe { background-color: rgba(34,197,94,0.2); }
    .bg-yellow-safe { background-color: rgba(234,179,8,0.2); }
    .bg-blue-safe { background-color: rgba(59,130,246,0.2); }
    .bg-red-safe { background-color: rgba(239,68,68,0.2); }

    .lu-base { border-radius: 8px; z-index: 1; }
    .lu-base-inner {
        background: white;
        border-radius: 16%;
        border: 2px solid rgba(0,0,0,0.06);
        z-index: 2;
    }
    .lu-base-spot-wrap {
        display: flex; align-items: center; justify-content: center;
        z-index: 3;
    }
    .lu-base-spot {
        width: 65%; height: 65%;
        border-radius: 50%;
        box-shadow: inset 0 2px 4px rgba(0,0,0,0.15);
    }
    
    .lu-cell {
        border: 1px solid rgba(0,0,0,0.05);
        display: flex; align-items: center; justify-content: center;
        z-index: 1;
    }
    .lu-star-cell {
        font-size: 1.2rem;
        color: rgba(0,0,0,0.2);
    }

    .lu-center-home {
        position: relative;
        z-index: 1;
    }
    .lu-center-t-top { position: absolute; inset: 0; clip-path: polygon(0 0, 100% 0, 50% 50%); }
    .lu-center-t-right { position: absolute; inset: 0; clip-path: polygon(100% 0, 100% 100%, 50% 50%); }
    .lu-center-t-bottom { position: absolute; inset: 0; clip-path: polygon(0 100%, 100% 100%, 50% 50%); }
    .lu-center-t-left { position: absolute; inset: 0; clip-path: polygon(0 0, 0 100%, 50% 50%); }
    .lu-pawn-wrap {
        display: flex; align-items: center; justify-content: center;
        position: relative;
        transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    }
    .lu-pawn {
        width: 70%; height: 70%;
        border-radius: 50%;
        box-shadow: 0 4px 8px rgba(0,0,0,0.4);
        border: 1px solid white;
        z-index: 2;
    }
    .lu-pawn--movable {
        box-shadow: 0 0 10px #fff, 0 4px 8px rgba(0,0,0,0.4);
        border: 2px solid white;
        animation: luPulse 1s infinite;
    }
    .lu-pawn-label {
        position: absolute;
        top: -18px; left: 50%;
        transform: translateX(-50%);
        font-size: 0.6rem; font-weight: bold;
        background: rgba(0,0,0,0.8); color: white;
        padding: 1px 5px; border-radius: 8px;
        white-space: nowrap; z-index: 20;
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        border: 1px solid;
        pointer-events: none;
    }

    .lu-controls {
        display: flex; align-items: center; justify-content: center;
        gap: 1.5rem; flex-wrap: wrap; width: 100%;
    }
    .lu-roll-btn {
        padding: 0.95rem 2rem;
        background: linear-gradient(135deg, #8e44ad, #732d91);
        color: white; border: none;
        border-radius: 999px;
        font-weight: 700; font-family: var(--font-ui);
        font-size: 1rem; cursor: pointer;
        transition: all 0.3s;
        box-shadow: 0 6px 20px rgba(142,68,173,0.28);
    }
    .lu-roll-btn:hover:not(:disabled) {
        transform: translateY(-2px);
        box-shadow: 0 10px 28px rgba(142,68,173,0.38);
    }
    .lu-roll-btn:disabled { opacity: 0.55; cursor: not-allowed; }

    .lu-dice {
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

    @keyframes luPulse {
        0% { transform: scale(1); }
        50% { transform: scale(1.1); }
        100% { transform: scale(1); }
    }

    @media (max-width: 640px) {
        .lu-inner { padding: 2rem 1.25rem 3rem; }
        .lu-player-row { flex-direction: column; align-items: stretch; }
        .lu-color-field { width: 100%; }
    }
`;

export default Ludo;