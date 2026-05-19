import { useState, useEffect, useRef } from 'react';
import Layout from '../components/Layout';
import { Medal, Crown, Search, ArrowUp, ArrowDown } from 'lucide-react';

const mockLeaderboardData = [
    { rank: 1, username: 'PixelMaster', score: 12500, avatar: '🦊', game: 'Snake' },
    { rank: 2, username: 'ArcadeQueen', score: 11200, avatar: '🐱', game: 'Pac-Man' },
    { rank: 3, username: 'RetroKing', score: 10800, avatar: '🦁', game: 'Space Invaders' },
    { rank: 4, username: 'CyberPunk', score: 9500, avatar: '🤖', game: 'Chess' },
    { rank: 5, username: 'LudoBoss', score: 9200, avatar: '🎲', game: 'Ludo' },
    { rank: 6, username: 'SudokuNinja', score: 8900, avatar: '🥷', game: 'Sudoku' },
    { rank: 7, username: 'FlappyPro', score: 8500, avatar: '🐦', game: 'Flappy Bird' },
    { rank: 8, username: 'SeaCaptain', score: 8100, avatar: '⚓', game: 'Sea Battle' },
    { rank: 9, username: 'PongGod', score: 7800, avatar: '🏓', game: 'Ping Pong' },
    { rank: 10, username: 'ChillGamer', score: 7500, avatar: '🦥', game: 'Tic-Tac-Toe' },
];

const gamesList = [
    'All Games', 'Snake', 'Pac-Man', 'Chess', 'Ludo', 'Sudoku', 'Flappy Bird', 'Sea Battle', 'Ping Pong', 'Tic-Tac-Toe'
];

const Leaderboard = () => {
    const [selectedGame, setSelectedGame] = useState('All Games');
    const [searchTerm, setSearchTerm] = useState('');
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        let animId;
        let W = canvas.width = window.innerWidth;
        let H = canvas.height = window.innerHeight;

        const dots = Array.from({ length: 50 }, () => ({
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

    const filteredData = mockLeaderboardData.filter(item => {
        const matchesGame = selectedGame === 'All Games' || item.game === selectedGame;
        const matchesSearch = item.username.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesGame && matchesSearch;
    });

    const topThree = filteredData.slice(0, 3);
    const restOfPlayers = filteredData.slice(3);

    return (
        <Layout>
            <div className="lb-root">
                <canvas ref={canvasRef} className="lb-canvas" />
                <div className="lb-blob lb-blob-1" />
                <div className="lb-blob lb-blob-2" />

                <div className="lb-inner">
                    {/* Header */}
                    <div className="lb-header">
                        <div className="lb-header-text">
                            <h1 className="lb-title">
                                <span className="lb-title-dark">Arcade</span>
                                <span className="lb-title-gradient"> Leaderboard</span>
                            </h1>
                            <p className="lb-subtitle">Compete with the best and claim your spot at the top!</p>
                        </div>

                        {/* Search and Filter */}
                        <div className="lb-controls">
                            <div className="lb-search-wrapper">
                                <Search size={16} className="lb-search-icon" />
                                <input
                                    type="text"
                                    placeholder="Search player..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="lb-search-input"
                                />
                            </div>
                            <select
                                value={selectedGame}
                                onChange={(e) => setSelectedGame(e.target.value)}
                                className="lb-select"
                            >
                                {gamesList.map(game => (
                                    <option key={game} value={game}>{game}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Top 3 Podium */}
                    {topThree.length > 0 && (
                        <div className="lb-podium">
                            {/* Rank 2 */}
                            {topThree[1] && (
                                <div className="lb-podium-card lb-rank-2">
                                    <div className="lb-avatar-wrapper">
                                        <span className="lb-avatar">{topThree[1].avatar}</span>
                                        <Medal className="lb-medal-icon lb-silver" size={24} />
                                    </div>
                                    <div className="lb-podium-info">
                                        <h3 className="lb-podium-name">{topThree[1].username}</h3>
                                        <p className="lb-podium-score">{topThree[1].score.toLocaleString()} pts</p>
                                        <span className="lb-podium-game">{topThree[1].game}</span>
                                    </div>
                                    <div className="lb-podium-base base-2">2nd</div>
                                </div>
                            )}

                            {/* Rank 1 */}
                            {topThree[0] && (
                                <div className="lb-podium-card lb-rank-1">
                                    <div className="lb-avatar-wrapper">
                                        <span className="lb-avatar">{topThree[0].avatar}</span>
                                        <Crown className="lb-medal-icon lb-gold" size={32} />
                                    </div>
                                    <div className="lb-podium-info">
                                        <h3 className="lb-podium-name">{topThree[0].username}</h3>
                                        <p className="lb-podium-score">{topThree[0].score.toLocaleString()} pts</p>
                                        <span className="lb-podium-game">{topThree[0].game}</span>
                                    </div>
                                    <div className="lb-podium-base base-1">1st</div>
                                </div>
                            )}

                            {/* Rank 3 */}
                            {topThree[2] && (
                                <div className="lb-podium-card lb-rank-3">
                                    <div className="lb-avatar-wrapper">
                                        <span className="lb-avatar">{topThree[2].avatar}</span>
                                        <Medal className="lb-medal-icon lb-bronze" size={24} />
                                    </div>
                                    <div className="lb-podium-info">
                                        <h3 className="lb-podium-name">{topThree[2].username}</h3>
                                        <p className="lb-podium-score">{topThree[2].score.toLocaleString()} pts</p>
                                        <span className="lb-podium-game">{topThree[2].game}</span>
                                    </div>
                                    <div className="lb-podium-base base-3">3rd</div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Table for rest of players */}
                    <div className="lb-table-wrapper">
                        <table className="lb-table">
                            <thead>
                                <tr>
                                    <th>Rank</th>
                                    <th>Player</th>
                                    <th>Game</th>
                                    <th>Score</th>
                                    <th>Trend</th>
                                </tr>
                            </thead>
                            <tbody>
                                {restOfPlayers.map((player) => (
                                    <tr key={player.rank} className="lb-table-row">
                                        <td className="lb-rank-col">
                                            <span className="lb-rank-badge">#{player.rank}</span>
                                        </td>
                                        <td className="lb-player-col">
                                            <div className="lb-player-cell">
                                                <span className="lb-player-avatar">{player.avatar}</span>
                                                <span className="lb-player-name">{player.username}</span>
                                            </div>
                                        </td>
                                        <td className="lb-game-col">
                                            <span className="lb-game-badge">{player.game}</span>
                                        </td>
                                        <td className="lb-score-col">
                                            <span className="lb-score">{player.score.toLocaleString()}</span>
                                        </td>
                                        <td className="lb-trend-col">
                                            {player.rank % 3 === 0 ? (
                                                <ArrowUp size={16} className="lb-trend-up" />
                                            ) : player.rank % 5 === 0 ? (
                                                <ArrowDown size={16} className="lb-trend-down" />
                                            ) : (
                                                <span className="lb-trend-neutral">-</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {filteredData.length === 0 && (
                            <div className="lb-no-results">
                                <p>No players found for this selection.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <style>{`
                .lb-root {
                    position: relative;
                    min-height: 100vh;
                    overflow: hidden;
                    background: linear-gradient(145deg, #faf8ff 0%, #f0f9f0 50%, #fdf6ff 100%);
                    font-family: var(--font-ui, sans-serif);
                }
                .lb-canvas {
                    position: fixed;
                    inset: 0;
                    pointer-events: none;
                    z-index: 0;
                }
                .lb-blob {
                    position: fixed;
                    border-radius: 50%;
                    filter: blur(80px);
                    pointer-events: none;
                    z-index: 0;
                }
                .lb-blob-1 {
                    width: 500px; height: 500px;
                    background: rgba(142,68,173,0.06);
                    top: -100px; right: -100px;
                }
                .lb-blob-2 {
                    width: 400px; height: 400px;
                    background: rgba(34,197,94,0.06);
                    bottom: 100px; left: -80px;
                }

                .lb-inner {
                    position: relative;
                    z-index: 1;
                    max-width: 1000px;
                    margin: 0 auto;
                    padding: 3rem 2rem 4rem;
                }

                /* Header */
                .lb-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 2rem;
                    margin-bottom: 3rem;
                    flex-wrap: wrap;
                }
                .lb-header-text { display: flex; flex-direction: column; gap: 0.5rem; }
                .lb-title {
                    font-size: clamp(2rem, 4vw, 2.8rem);
                    font-weight: 900; line-height: 1.1;
                    letter-spacing: -0.5px; margin: 0;
                }
                .lb-title-dark { color: #1a1a1a; }
                .lb-title-gradient {
                    background: linear-gradient(135deg, #8e44ad, #22c55e);
                    -webkit-background-clip: text; background-clip: text;
                    -webkit-text-fill-color: transparent;
                }
                .lb-subtitle {
                    font-size: 1rem; color: #666;
                    margin: 0; font-weight: 400;
                }

                .lb-controls {
                    display: flex;
                    gap: 1rem;
                    align-items: center;
                }
                .lb-search-wrapper {
                    position: relative;
                    display: flex;
                    align-items: center;
                }
                .lb-search-icon {
                    position: absolute;
                    left: 12px;
                    color: #8e44ad;
                }
                .lb-search-input {
                    padding: 0.6rem 1rem 0.6rem 2.5rem;
                    border-radius: 12px;
                    border: 1px solid rgba(142,68,173,0.2);
                    background: rgba(255, 255, 255, 0.8);
                    backdrop-filter: blur(5px);
                    font-size: 0.9rem;
                    width: 200px;
                    transition: all 0.3s ease;
                }
                .lb-search-input:focus {
                    outline: none;
                    border-color: #8e44ad;
                    box-shadow: 0 0 0 3px rgba(142,68,173,0.1);
                    width: 240px;
                }
                .lb-select {
                    padding: 0.6rem 1rem;
                    border-radius: 12px;
                    border: 1px solid rgba(142,68,173,0.2);
                    background: rgba(255, 255, 255, 0.8);
                    backdrop-filter: blur(5px);
                    font-size: 0.9rem;
                    color: #333;
                    cursor: pointer;
                    transition: all 0.3s ease;
                }
                .lb-select:focus {
                    outline: none;
                    border-color: #8e44ad;
                    box-shadow: 0 0 0 3px rgba(142,68,173,0.1);
                }

                /* Podium */
                .lb-podium {
                    display: flex;
                    align-items: flex-end;
                    justify-content: center;
                    gap: 1.5rem;
                    margin-bottom: 4rem;
                    padding-top: 2rem;
                }
                .lb-podium-card {
                    background: rgba(255,255,255,0.8);
                    border: 1px solid rgba(142,68,173,0.15);
                    border-radius: 24px;
                    padding: 1.5rem;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 1rem;
                    backdrop-filter: blur(10px);
                    box-shadow: 0 10px 30px rgba(0,0,0,0.05);
                    transition: transform 0.3s ease;
                    width: 200px;
                    position: relative;
                }
                .lb-podium-card:hover {
                    transform: translateY(-5px);
                }
                .lb-rank-1 {
                    height: 280px;
                    border-color: rgba(254, 202, 87, 0.5);
                    background: linear-gradient(145deg, rgba(255, 255, 255, 0.9), rgba(254, 202, 87, 0.05));
                    box-shadow: 0 15px 35px rgba(254, 202, 87, 0.15);
                    z-index: 2;
                }
                .lb-rank-2 {
                    height: 240px;
                    border-color: rgba(200, 200, 200, 0.5);
                    z-index: 1;
                }
                .lb-rank-3 {
                    height: 220px;
                    border-color: rgba(205, 127, 50, 0.4);
                    z-index: 1;
                }

                .lb-avatar-wrapper {
                    position: relative;
                    width: 64px;
                    height: 64px;
                    background: white;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border: 2px solid #eee;
                    box-shadow: 0 4px 10px rgba(0,0,0,0.05);
                }
                .lb-rank-1 .lb-avatar-wrapper { border-color: #feca57; width: 80px; height: 80px; }
                .lb-rank-2 .lb-avatar-wrapper { border-color: #ccd1d9; }
                .lb-rank-3 .lb-avatar-wrapper { border-color: #cd7f32; }

                .lb-avatar { font-size: 2rem; }
                .lb-rank-1 .lb-avatar { font-size: 2.5rem; }

                .lb-medal-icon {
                    position: absolute;
                    bottom: -5px;
                    right: -5px;
                    background: white;
                    border-radius: 50%;
                    padding: 3px;
                }
                .lb-gold { color: #feca57; }
                .lb-silver { color: #aab2bd; }
                .lb-bronze { color: #cd7f32; }

                .lb-podium-info {
                    text-align: center;
                    display: flex;
                    flex-direction: column;
                    gap: 0.25rem;
                }
                .lb-podium-name {
                    font-size: 1.1rem;
                    font-weight: 800;
                    color: #1a1a1a;
                    margin: 0;
                }
                .lb-rank-1 .lb-podium-name { font-size: 1.2rem; }
                .lb-podium-score {
                    font-size: 1rem;
                    font-weight: 700;
                    color: #8e44ad;
                    margin: 0;
                }
                .lb-podium-game {
                    font-size: 0.75rem;
                    color: #666;
                    font-weight: 600;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                }

                .lb-podium-base {
                    position: absolute;
                    bottom: 0;
                    left: 0;
                    right: 0;
                    background: rgba(0,0,0,0.05);
                    text-align: center;
                    padding: 0.4rem;
                    font-size: 0.8rem;
                    font-weight: 800;
                    border-radius: 0 0 24px 24px;
                    color: #666;
                }
                .lb-rank-1 .lb-podium-base { background: #feca57; color: white; }
                .lb-rank-2 .lb-podium-base { background: #ccd1d9; color: #555; }
                .lb-rank-3 .lb-podium-base { background: #cd7f32; color: white; }

                /* Table */
                .lb-table-wrapper {
                    background: rgba(255,255,255,0.85);
                    border: 1px solid rgba(142,68,173,0.15);
                    border-radius: 20px;
                    overflow: hidden;
                    backdrop-filter: blur(10px);
                    box-shadow: 0 10px 30px rgba(0,0,0,0.03);
                }
                .lb-table {
                    width: 100%;
                    border-collapse: collapse;
                    text-align: left;
                }
                .lb-table th {
                    background: rgba(142,68,173,0.05);
                    padding: 1rem 1.5rem;
                    font-size: 0.85rem;
                    font-weight: 700;
                    color: #8e44ad;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                }
                .lb-table td {
                    padding: 1rem 1.5rem;
                    border-bottom: 1px solid rgba(142,68,173,0.05);
                    vertical-align: middle;
                }
                .lb-table-row {
                    transition: background 0.2s ease;
                }
                .lb-table-row:hover {
                    background: rgba(142,68,173,0.02);
                }

                .lb-rank-badge {
                    font-weight: 800;
                    color: #666;
                    font-size: 0.9rem;
                }
                .lb-player-cell {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                }
                .lb-player-avatar {
                    font-size: 1.4rem;
                }
                .lb-player-name {
                    font-weight: 700;
                    color: #1a1a1a;
                }
                .lb-game-badge {
                    font-size: 0.75rem;
                    font-weight: 700;
                    color: #16a34a;
                    background: rgba(34,197,94,0.1);
                    padding: 0.25rem 0.6rem;
                    border-radius: 8px;
                    border: 1px solid rgba(34,197,94,0.2);
                }
                .lb-score {
                    font-family: monospace;
                    font-weight: 700;
                    color: #8e44ad;
                    font-size: 1rem;
                }

                .lb-trend-up { color: #22c55e; }
                .lb-trend-down { color: #ff6b6b; }
                .lb-trend-neutral { color: #aaa; }

                .lb-no-results {
                    padding: 3rem;
                    text-align: center;
                    color: #666;
                    font-size: 0.95rem;
                }

                @media (max-width: 768px) {
                    .lb-inner { padding: 2rem 1rem; }
                    .lb-header { flex-direction: column; align-items: flex-start; }
                    .lb-controls { width: 100%; flex-direction: column; }
                    .lb-search-wrapper, .lb-search-input, .lb-select { width: 100%; }
                    .lb-search-input:focus { width: 100%; }
                    .lb-podium { flex-direction: column; align-items: center; gap: 2rem; }
                    .lb-podium-card { width: 100%; max-width: 300px; }
                    .lb-rank-1, .lb-rank-2, .lb-rank-3 { height: auto; padding-bottom: 2.5rem; }
                    .lb-podium-base { border-radius: 0; }
                    .lb-table th, .lb-table td { padding: 0.75rem 1rem; }
                    .lb-game-col { display: none; } /* Hide game column on small screens */
                }
            `}</style>
        </Layout>
    );
};

export default Leaderboard;
