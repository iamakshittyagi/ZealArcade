import React, { useState, useEffect } from 'react';
import GameWrapper from '../components/GameWrapper';
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

    useEffect(() => {
        const timer = setTimeout(() => setIsSearching(false), 2000);
        return () => clearTimeout(timer);
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
        <GameWrapper title="Chess">
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2rem' }}>
                <div style={{
                    fontSize: '1.2rem', fontWeight: 600, color: 'var(--accent-primary)',
                    padding: '0.5rem 1.5rem', borderRadius: '20px',
                    background: 'rgba(155, 89, 182, 0.1)',
                    border: '1px solid rgba(155, 89, 182, 0.2)'
                }}>
                    {isSearching ? "Searching for opponent..." : status}
                </div>

                <div style={{
                    position: 'relative', width: 'min(90vw, 550px)', aspectRatio: '1',
                    borderRadius: '12px', boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
                    backgroundImage: 'url("/assets/chess-board.jpg")',
                    backgroundSize: '100% 100%', backgroundPosition: 'center',
                    padding: '4.8% 5.2%'
                }}>
                    <div style={{
                        display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)',
                        gridTemplateRows: 'repeat(8, 1fr)', height: '100%', width: '100%'
                    }}>
                        {board.map((row, r) => row.map((piece, c) => (
                            <div
                                key={`${r}-${c}`}
                                onClick={() => handleSquareClick(r, c)}
                                style={{
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    cursor: 'pointer', position: 'relative',
                                    boxShadow: selected?.r === r && selected?.c === c ? 'inset 0 0 0 4px rgba(155, 89, 182, 0.8)' : 'none',
                                    borderRadius: '4px'
                                }}
                            >
                                {piece && (
                                    <span style={{
                                        color: piece === piece.toUpperCase() ? '#ffffff' : '#1a1a1a',
                                        fontSize: 'min(7vw, 40px)', lineHeight: 1,
                                        filter: piece === piece.toUpperCase() ? 'drop-shadow(0 2px 2px rgba(0,0,0,0.4))' : 'none',
                                        userSelect: 'none', zIndex: 2
                                    }}>
                                        {PIECE_ICONS[piece]}
                                    </span>
                                )}
                            </div>
                        )))}

                        {isSearching && (
                            <div style={{
                                position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                                background: 'rgba(0,0,0,0.6)',
                                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                                backdropFilter: 'blur(4px)', borderRadius: '12px', zIndex: 10
                            }}>
                                <div style={{
                                    width: '50px', height: '50px',
                                    border: '4px solid #fff', borderTopColor: 'var(--accent-primary)',
                                    borderRadius: '50%', animation: 'spin 1s linear infinite',
                                    marginBottom: '1rem'
                                }} />
                                <p style={{ color: '#fff', fontWeight: 600 }}>Matching with Grandmaster...</p>
                            </div>
                        )}
                    </div>
                </div>

                <button onClick={resetGame} className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <RotateCcw size={18} /> New Game
                </button>
            </div>

            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </GameWrapper>
    );
};

export default Chess;