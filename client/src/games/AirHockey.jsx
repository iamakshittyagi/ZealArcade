import React, { useState, useEffect, useRef } from 'react';
import Layout from '../components/Layout';
import { useGame } from '../context/GameContext';
import { RotateCcw } from 'lucide-react';

const AirHockey = () => {
    const { updateBalance } = useGame();
    const canvasRef = useRef(null);
    const bgCanvasRef = useRef(null);
    const [score, setScore] = useState(0);
    const [aiScore, setAiScore] = useState(0);
    const [isSearching, setIsSearching] = useState(true);
    const animationIdRef = useRef(null);

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
            vx: (Math.random() - 0.5) * 0.4,
            vy: (Math.random() - 0.5) * 0.4,
            color: Math.random() > 0.5 ? '#8e44ad' : '#ef4444',
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
                        ctx.lineWidth = 0.5;
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

    const puck = useRef({ x: 250, y: 400, dx: 0, dy: 0, radius: 15 });
    const player = useRef({ x: 250, y: 700, radius: 30 });
    const ai = useRef({ x: 250, y: 100, radius: 30 });

    useEffect(() => {
        const timer = setTimeout(() => setIsSearching(false), 2000);
        return () => clearTimeout(timer);
    }, []);

    const update = () => {
        if (isSearching) return;
        const p = puck.current;
        const u = player.current;
        const a = ai.current;

        p.x += p.dx;
        p.y += p.dy;
        p.dx *= 0.99;
        p.dy *= 0.99;

        const targetX = p.x;
        const aiSpeed = 4;
        if (a.x < targetX) a.x += aiSpeed;
        else a.x -= aiSpeed;
        a.y = 100;

        if (p.x - p.radius < 0 || p.x + p.radius > 500) {
            p.dx *= -1;
            p.x = p.x < 250 ? p.radius : 500 - p.radius;
        }

        const checkCollision = (mallet) => {
            const dx = p.x - mallet.x;
            const dy = p.y - mallet.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < p.radius + mallet.radius) {
                const angle = Math.atan2(dy, dx);
                const force = 10;
                p.dx = Math.cos(angle) * force;
                p.dy = Math.sin(angle) * force;
            }
        };
        checkCollision(u);
        checkCollision(a);

        if (p.y < 0) {
            if (p.x > 150 && p.x < 350) {
                setScore(s => s + 1);
                updateBalance(50);
                resetPuck();
            } else {
                p.dy *= -1;
                p.y = p.radius;
            }
        }
        if (p.y > 800) {
            if (p.x > 150 && p.x < 350) {
                setAiScore(s => s + 1);
                resetPuck();
            } else {
                p.dy *= -1;
                p.y = 800 - p.radius;
            }
        }
    };

    const resetPuck = () => {
        puck.current = { x: 250, y: 400, dx: 0, dy: 0, radius: 15 };
    };

    const draw = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, 500, 800);

        ctx.fillStyle = '#f8fafc';
        ctx.fillRect(0, 0, 500, 800);

        ctx.strokeStyle = 'rgba(155, 89, 182, 0.2)';
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.moveTo(0, 400);
        ctx.lineTo(500, 400);
        ctx.stroke();

        ctx.fillStyle = '#334155';
        ctx.fillRect(150, 0, 200, 10);
        ctx.fillRect(150, 790, 200, 10);

        ctx.fillStyle = '#8e44ad';
        ctx.beginPath();
        ctx.arc(player.current.x, player.current.y, player.current.radius, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.arc(ai.current.x, ai.current.y, ai.current.radius, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#0f172a';
        ctx.beginPath();
        ctx.arc(puck.current.x, puck.current.y, puck.current.radius, 0, Math.PI * 2);
        ctx.fill();

        if (isSearching) {
            ctx.fillStyle = 'rgba(255,255,255,0.8)';
            ctx.fillRect(0, 0, 500, 800);
            ctx.fillStyle = '#8e44ad';
            ctx.font = 'bold 24px Outfit';
            ctx.textAlign = 'center';
            ctx.fillText('Searching for Pro Player...', 250, 400);
        }
    };

    useEffect(() => {
        const loop = () => {
            update();
            draw();
            animationIdRef.current = requestAnimationFrame(loop);
        };
        animationIdRef.current = requestAnimationFrame(loop);
        return () => cancelAnimationFrame(animationIdRef.current);
    }, [isSearching]);

    const handleTouchMove = (e) => {
        const rect = canvasRef.current.getBoundingClientRect();
        const touch = e.touches[0];
        const x = (touch.clientX - rect.left) * (500 / rect.width);
        const y = (touch.clientY - rect.top) * (800 / rect.height);
        player.current.x = Math.max(player.current.radius, Math.min(500 - player.current.radius, x));
        player.current.y = Math.max(400 + player.current.radius, Math.min(800 - player.current.radius, y));
    };

    const handleMouseMove = (e) => {
        const rect = canvasRef.current.getBoundingClientRect();
        const x = (e.clientX - rect.left) * (500 / rect.width);
        const y = (e.clientY - rect.top) * (800 / rect.height);
        player.current.x = Math.max(player.current.radius, Math.min(500 - player.current.radius, x));
        player.current.y = Math.max(400 + player.current.radius, Math.min(800 - player.current.radius, y));
    };

    const resetGame = () => {
        setScore(0);
        setAiScore(0);
        setIsSearching(true);
        player.current = { x: 250, y: 700, radius: 30 };
        ai.current = { x: 250, y: 100, radius: 30 };
        resetPuck();
        setTimeout(() => setIsSearching(false), 2000);
    };

    return (
        <Layout>
            <div className="ah-root">
                <canvas ref={bgCanvasRef} className="ah-bg-canvas" />
                <div className="ah-blob ah-blob-1" />
                <div className="ah-blob ah-blob-2" />

                <div className="ah-inner">
                    <div className="ah-page-header">
                        <h1 className="ah-title">
                            <span className="ah-title-dark">Neon</span>
                            <span className="ah-title-purple"> Air</span>
                            <span className="ah-title-green"> Hockey.</span>
                        </h1>
                    </div>

                    <div className="ah-status-row">
                        <div className="ah-status">
                            {isSearching ? 'Finding Opponent...' : 'First to 7 wins!'}
                        </div>
                        <div className="ah-score-chip">
                            <span style={{color: '#8e44ad'}}>You: {score}</span>
                            <span style={{color: '#444'}}>|</span>
                            <span style={{color: '#ef4444'}}>AI: {aiScore}</span>
                        </div>
                        <button className="ah-restart-btn" onClick={resetGame}>
                            <RotateCcw size={15} /> Restart
                        </button>
                    </div>

                    <div className="ah-board-wrap">
                        <canvas
                            ref={canvasRef}
                            width="500"
                            height="800"
                            onMouseMove={handleMouseMove}
                            onTouchMove={(e) => { e.preventDefault(); handleTouchMove(e); }}
                            className="ah-arena-canvas"
                        />
                        <p className="ah-instructions">Drag to control your mallet</p>
                    </div>
                </div>

                <style>{styles}</style>
            </div>
        </Layout>
    );
};

const styles = `
    .ah-root {
        position: relative;
        min-height: 100vh;
        overflow: hidden;
        background: linear-gradient(145deg, #faf8ff 0%, #f0f9f0 50%, #fdf6ff 100%);
    }
    .ah-bg-canvas {
        position: fixed; inset: 0;
        pointer-events: none; z-index: 0;
    }
    .ah-blob {
        position: fixed; border-radius: 50%;
        filter: blur(80px); pointer-events: none; z-index: 0;
    }
    .ah-blob-1 { width: 500px; height: 500px; background: rgba(142,68,173,0.07); top: -100px; right: -100px; }
    .ah-blob-2 { width: 400px; height: 400px; background: rgba(239, 68, 68, 0.06); bottom: 80px; left: -80px; }

    .ah-inner {
        position: relative; z-index: 1;
        max-width: 720px; margin: 0 auto;
        padding: 3rem 2rem 5rem;
    }
    .ah-page-header { margin-bottom: 2rem; text-align: center; }
    .ah-title {
        display: inline-flex; flex-wrap: wrap; justify-content: center; gap: 0.4rem;
        font-family: var(--font-ui);
        font-size: clamp(1.8rem, 3.5vw, 2.6rem);
        font-weight: 900; line-height: 1.15; letter-spacing: -0.5px;
        margin: 0 0 0.6rem;
    }
    .ah-title-dark { color: var(--text-primary); }
    .ah-title-purple {
        background: linear-gradient(135deg, #8e44ad, #732d91);
        -webkit-background-clip: text; background-clip: text;
        -webkit-text-fill-color: transparent;
    }
    .ah-title-green {
        background: linear-gradient(135deg, #22c55e, #16a34a);
        -webkit-background-clip: text; background-clip: text;
        -webkit-text-fill-color: transparent;
    }

    .ah-status-row {
        display: flex; justify-content: space-between; align-items: center;
        margin-bottom: 1.2rem;
        background: rgba(255,255,255,0.85);
        border: 1px solid rgba(142,68,173,0.14);
        border-radius: 14px;
        padding: 0.75rem 1.2rem;
        backdrop-filter: blur(8px);
        box-shadow: 0 4px 14px rgba(142,68,173,0.06);
        gap: 1rem;
        flex-wrap: wrap;
    }
    .ah-status {
        font-family: var(--font-ui);
        font-size: 1.1rem; font-weight: 800;
        color: var(--text-primary);
        margin: 0; flex: 1;
    }
    .ah-score-chip {
        display: flex; gap: 0.5rem;
        font-family: var(--font-ui);
        font-weight: 800; font-size: 1rem;
        background: rgba(0,0,0,0.03);
        padding: 0.3rem 0.8rem; border-radius: 20px;
    }
    .ah-restart-btn {
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
    .ah-restart-btn:hover { background: rgba(142,68,173,0.12); transform: translateY(-1px); }

    .ah-board-wrap {
        background: rgba(255,255,255,0.9);
        border: 1px solid rgba(142,68,173,0.14);
        border-radius: 20px;
        padding: 2.5rem 1.5rem;
        box-shadow: 0 20px 60px rgba(142,68,173,0.12), 0 4px 16px rgba(0,0,0,0.06);
        backdrop-filter: blur(12px);
        display: flex; flex-direction: column; align-items: center; gap: 1.5rem;
        margin-bottom: 2rem;
    }

    .ah-arena-canvas {
        background: #f8fafc;
        border: 8px solid #334155;
        border-radius: 20px;
        cursor: crosshair;
        width: 100%; max-width: 400px; height: auto;
        box-shadow: inset 0 0 20px rgba(0,0,0,0.05);
        touch-action: none;
    }

    .ah-instructions {
        font-family: var(--font-ui);
        color: var(--text-secondary);
        font-size: 1rem; margin: 0;
        font-weight: 500;
        text-align: center;
    }

    @media (max-width: 640px) {
        .ah-inner { padding: 2rem 1.25rem 3rem; }
    }
`;

export default AirHockey;