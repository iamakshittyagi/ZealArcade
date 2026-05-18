import React, { useState, useEffect, useRef } from 'react';
import Layout from '../components/Layout';
import { useGame } from '../context/GameContext';
import { RotateCcw } from 'lucide-react';

const INITIAL_BOARD = [
    ['r', 'n', 'b', 'q', 'k', 'b', 'n', 'r'],
    ['p', 'p', 'p', 'p', 'p', 'p', 'p', 'p'],
    ['', '', '', '', '', '', '', ''],
    ['', '', '', '', '', '', '', ''],
    ['', '', '', '', '', '', '', ''],
    ['', '', '', '', '', '', '', ''],
    ['P', 'P', 'P', 'P', 'P', 'P', 'P', 'P'],
    ['R', 'N', 'B', 'Q', 'K', 'B', 'N', 'R']
];

const PIECE_ICONS = {
    'k': '♚', 'q': '♛', 'r': '♜', 'b': '♝', 'n': '♞', 'p': '♟',
    'K': '♚', 'Q': '♛', 'R': '♜', 'B': '♝', 'N': '♞', 'P': '♟'
};

const Chess = () => {
    const { updateBalance } = useGame();
    const [board, setBoard] = useState(INITIAL_BOARD);
    const [selected, setSelected] = useState(null);
    const [turn, setTurn] = useState('white');
    const [status, setStatus] = useState("Your turn (White)");
    const [isGameOver, setIsGameOver] = useState(false);
    const [isSearching, setIsSearching] = useState(true);
    const bgCanvasRef = useRef(null);

    useEffect(() => {
        const timer = setTimeout(() => setIsSearching(false), 2000);
        return () => clearTimeout(timer);
    }, []);

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

    const isValidMove = (fromR, fromC, toR, toC, boardState) => {
        const piece = boardState[fromR][fromC];
        const target = boardState[toR][toC];
        const color = piece === piece.toUpperCase() ? 'white' : 'black';
        if (target && (target === target.toUpperCase() ? 'white' : 'black') === color) return false;

        const dr = toR - fromR;
        const dc = toC - fromC;
        const absDr = Math.abs(dr);
        const absDc = Math.abs(dc);
        const p = piece.toLowerCase();

        if (p === 'p') {
            const dir = color === 'white' ? -1 : 1;
            if (dc === 0 && dr === dir && !target) return true;
            if (dc === 0 && dr === 2 * dir && !target && ((color === 'white' && fromR === 6) || (color === 'black' && fromR === 1))) {
                if (!boardState[fromR + dir][fromC]) return true;
            }
            if (absDc === 1 && dr === dir && target) return true;
            return false;
        }
        if (p === 'r') {
            if (dr !== 0 && dc !== 0) return false;
            const stepR = dr === 0 ? 0 : dr / absDr;
            const stepC = dc === 0 ? 0 : dc / absDc;
            let cr = fromR + stepR, cc = fromC + stepC;
            while (cr !== toR || cc !== toC) {
                if (boardState[cr][cc]) return false;
                cr += stepR; cc += stepC;
            }
            return true;
        }
        if (p === 'n') return (absDr === 2 && absDc === 1) || (absDr === 1 && absDc === 2);
        if (p === 'b') {
            if (absDr !== absDc) return false;
            const stepR = dr / absDr, stepC = dc / absDc;
            let cr = fromR + stepR, cc = fromC + stepC;
            while (cr !== toR || cc !== toC) {
                if (boardState[cr][cc]) return false;
                cr += stepR; cc += stepC;
            }
            return true;
        }
        if (p === 'q') {
            if (dr !== 0 && dc !== 0 && absDr !== absDc) return false;
            const stepR = dr === 0 ? 0 : dr / absDr;
            const stepC = dc === 0 ? 0 : dc / absDc;
            let cr = fromR + stepR, cc = fromC + stepC;
            while (cr !== toR || cc !== toC) {
                if (boardState[cr][cc]) return false;
                cr += stepR; cc += stepC;
            }
            return true;
        }
        if (p === 'k') return absDr <= 1 && absDc <= 1;
        return false;
    };

    const handleSquareClick = (r, c) => {
        if (isGameOver || turn === 'black' || isSearching) return;
        const piece = board[r][c];

        if (selected) {
            if (selected.r === r && selected.c === c) {
                setSelected(null);
                return;
            }
            if (isValidMove(selected.r, selected.c, r, c, board)) {
                const newBoard = board.map(row => [...row]);
                newBoard[r][c] = board[selected.r][selected.c];
                newBoard[selected.r][selected.c] = '';
                setBoard(newBoard);
                setSelected(null);
                setTurn('black');
                setStatus("Opponent thinking...");
                setTimeout(() => makeAIMove(newBoard), 1000);
            } else if (piece && piece === piece.toUpperCase()) {
                setSelected({ r, c });
            }
        } else if (piece && piece === piece.toUpperCase()) {
            setSelected({ r, c });
        }
    };

    const makeAIMove = (currentBoard) => {
        const legalMoves = [];
        for (let fr = 0; fr < 8; fr++) {
            for (let fc = 0; fc < 8; fc++) {
                const piece = currentBoard[fr][fc];
                if (piece && piece === piece.toLowerCase()) {
                    for (let tr = 0; tr < 8; tr++) {
                        for (let tc = 0; tc < 8; tc++) {
                            if (isValidMove(fr, fc, tr, tc, currentBoard)) {
                                legalMoves.push({ fr, fc, tr, tc });
                            }
                        }
                    }
                }
            }
        }
        if (legalMoves.length === 0) {
            setIsGameOver(true);
            setStatus("Checkmate! You win!");
            updateBalance(200);
            return;
        }
        const move = legalMoves[Math.floor(Math.random() * legalMoves.length)];
        const newBoard = currentBoard.map(row => [...row]);
        newBoard[move.tr][move.tc] = currentBoard[move.fr][move.fc];
        newBoard[move.fr][move.fc] = '';
        setBoard(newBoard);
        setTurn('white');
        setStatus("Your turn (White)");
    };

    const resetGame = () => {
        setBoard(INITIAL_BOARD);
        setTurn('white');
        setStatus("Your turn (White)");
        setIsGameOver(false);
        setIsSearching(true);
        setTimeout(() => setIsSearching(false), 1500);
    };

    return (
        <Layout>
            <div className="ch-root">
                <canvas ref={bgCanvasRef} className="ch-bg-canvas" />
                <div className="ch-blob ch-blob-1" />
                <div className="ch-blob ch-blob-2" />

                <div className="ch-inner">
                    <div className="ch-page-header">
                        <h1 className="ch-title">
                            <span className="ch-title-dark">Grandmaster</span>
                            <span className="ch-title-purple"> Chess.</span>
                            <span className="ch-title-green"> Checkmate.</span>
                        </h1>
                    </div>

                    <div className="ch-status-row">
                        <div className="ch-status">
                            {isSearching ? "Searching for opponent..." : status}
                        </div>
                        <button className="ch-restart-btn" onClick={resetGame}>
                            <RotateCcw size={15} /> Restart
                        </button>
                    </div>

                    <div className="ch-board-wrap">
                        <div className="ch-board">
                            {board.map((row, r) => row.map((piece, c) => {
                                const isLight = (r + c) % 2 === 0;
                                const isSelected = selected?.r === r && selected?.c === c;
                                return (
                                    <div
                                        key={`${r}-${c}`}
                                        className={`ch-square ${isLight ? 'ch-light' : 'ch-dark'} ${isSelected ? 'ch-selected' : ''}`}
                                        onClick={() => handleSquareClick(r, c)}
                                    >
                                        {piece && (
                                            <span className={`ch-piece ${piece === piece.toUpperCase() ? 'ch-piece-white' : 'ch-piece-black'}`}>
                                                {PIECE_ICONS[piece]}
                                            </span>
                                        )}
                                    </div>
                                );
                            }))}

                            {isSearching && (
                                <div className="ch-searching-overlay">
                                    <div className="ch-spinner" />
                                    <p>Matching with Grandmaster...</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <style>{styles}</style>
            </div>
        </Layout>
    );
};

const styles = `
    .ch-root {
        position: relative;
        min-height: 100vh;
        overflow: hidden;
        background: linear-gradient(145deg, #faf8ff 0%, #f0f9f0 50%, #fdf6ff 100%);
    }
    .ch-bg-canvas {
        position: fixed; inset: 0;
        pointer-events: none; z-index: 0;
    }
    .ch-blob {
        position: fixed; border-radius: 50%;
        filter: blur(80px); pointer-events: none; z-index: 0;
    }
    .ch-blob-1 { width: 500px; height: 500px; background: rgba(142,68,173,0.07); top: -100px; right: -100px; }
    .ch-blob-2 { width: 400px; height: 400px; background: rgba(34,197,94,0.06); bottom: 80px; left: -80px; }

    .ch-inner {
        position: relative; z-index: 1;
        max-width: 720px; margin: 0 auto;
        padding: 3rem 2rem 5rem;
    }
    .ch-page-header { margin-bottom: 2rem; text-align: center; }
    .ch-title {
        display: inline-flex; flex-wrap: wrap; justify-content: center; gap: 0.4rem;
        font-family: var(--font-ui);
        font-size: clamp(1.8rem, 3.5vw, 2.6rem);
        font-weight: 900; line-height: 1.15; letter-spacing: -0.5px;
        margin: 0 0 0.6rem;
    }
    .ch-title-dark { color: var(--text-primary); }
    .ch-title-purple {
        background: linear-gradient(135deg, #8e44ad, #732d91);
        -webkit-background-clip: text; background-clip: text;
        -webkit-text-fill-color: transparent;
    }
    .ch-title-green {
        background: linear-gradient(135deg, #22c55e, #16a34a);
        -webkit-background-clip: text; background-clip: text;
        -webkit-text-fill-color: transparent;
    }

    .ch-status-row {
        display: flex; justify-content: space-between; align-items: center;
        margin-bottom: 1.2rem;
        background: rgba(255,255,255,0.85);
        border: 1px solid rgba(142,68,173,0.14);
        border-radius: 14px;
        padding: 0.75rem 1.2rem;
        backdrop-filter: blur(8px);
        box-shadow: 0 4px 14px rgba(142,68,173,0.06);
    }
    .ch-status {
        font-family: var(--font-ui);
        font-size: 1.1rem; font-weight: 800;
        color: var(--text-primary);
        margin: 0; flex: 1;
    }
    .ch-restart-btn {
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
    .ch-restart-btn:hover {
        background: rgba(142,68,173,0.12);
        transform: translateY(-1px);
    }

    .ch-board-wrap {
        background: rgba(255,255,255,0.9);
        border: 1px solid rgba(142,68,173,0.14);
        border-radius: 20px;
        padding: 1.5rem;
        box-shadow: 0 20px 60px rgba(142,68,173,0.12), 0 4px 16px rgba(0,0,0,0.06);
        backdrop-filter: blur(12px);
        display: flex; flex-direction: column; align-items: center; gap: 1.5rem;
        margin-bottom: 2rem;
    }
    .ch-board {
        position: relative;
        width: 100%;
        max-width: 520px;
        aspect-ratio: 1;
        border: 6px solid #4a4a4a;
        border-radius: 8px;
        box-shadow: 0 10px 30px rgba(0,0,0,0.25);
        display: grid;
        grid-template-columns: repeat(8, 1fr);
        grid-template-rows: repeat(8, 1fr);
        overflow: hidden;
    }
    .ch-square {
        display: flex; align-items: center; justify-content: center;
        cursor: pointer;
        position: relative;
    }
    .ch-light { background-color: #eeeed2; }
    .ch-dark { background-color: #769656; }
    .ch-selected { background-color: #baca44 !important; }
    
    .ch-piece {
        font-size: min(10vw, 48px);
        line-height: 1;
        user-select: none;
        z-index: 2;
        transition: transform 0.1s;
    }
    .ch-square:hover .ch-piece {
        transform: scale(1.05);
    }
    .ch-piece-white {
        color: #ffffff;
        filter: drop-shadow(0 2px 3px rgba(0,0,0,0.6));
    }
    .ch-piece-black {
        color: #000000;
        filter: drop-shadow(0 1px 1px rgba(255,255,255,0.4));
    }
    
    .ch-searching-overlay {
        position: absolute; inset: 0;
        background: rgba(0,0,0,0.7);
        display: flex; flex-direction: column; align-items: center; justify-content: center;
        backdrop-filter: blur(4px); z-index: 10;
        color: white; font-weight: 600; font-family: var(--font-ui);
    }
    .ch-spinner {
        width: 50px; height: 50px;
        border: 4px solid rgba(255,255,255,0.3);
        border-top-color: var(--accent-primary);
        border-radius: 50%;
        animation: spin 1s linear infinite;
        margin-bottom: 1rem;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
    @media (max-width: 640px) {
        .ch-inner { padding: 2rem 1.25rem 3rem; }
    }
`;

export default Chess;