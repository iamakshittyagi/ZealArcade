import React, { useState } from 'react';
import GameWrapper from '../components/GameWrapper';
import { useGame } from '../context/GameContext';
import { RotateCcw } from 'lucide-react';

const CHOICES = [
    { name: 'rock', emoji: '✊' },
    { name: 'paper', emoji: '✋' },
    { name: 'scissors', emoji: '✌️' }
];

const RPS = () => {
    const { updateBalance } = useGame();
    const [userChoice, setUserChoice] = useState(null);
    const [aiChoice, setAiChoice] = useState(null);
    const [result, setResult] = useState(null);
    const [score, setScore] = useState({ user: 0, ai: 0 });
    const [isRolling, setIsRolling] = useState(false);

    const determineWinner = (user, ai) => {
        if (user === ai) return 'draw';
        if (
            (user === 'rock' && ai === 'scissors') ||
            (user === 'paper' && ai === 'rock') ||
            (user === 'scissors' && ai === 'paper')
        ) return 'user';
        return 'ai';
    };

    const handleChoice = (choice) => {
        if (isRolling) return;
        setIsRolling(true);
        setUserChoice(choice);
        setResult(null);

        // Suspense — flash AI choice a few times before settling
        let flashCount = 0;
        const flash = setInterval(() => {
            setAiChoice(CHOICES[Math.floor(Math.random() * 3)]);
            flashCount++;
            if (flashCount > 8) {
                clearInterval(flash);
                const finalAi = CHOICES[Math.floor(Math.random() * 3)];
                setAiChoice(finalAi);
                const outcome = determineWinner(choice.name, finalAi.name);
                setResult(outcome);
                if (outcome === 'user') {
                    setScore(s => ({ ...s, user: s.user + 1 }));
                    updateBalance(20);
                } else if (outcome === 'ai') {
                    setScore(s => ({ ...s, ai: s.ai + 1 }));
                } else {
                    updateBalance(5);
                }
                setIsRolling(false);
            }
        }, 100);
    };

    const resetGame = () => {
        setUserChoice(null);
        setAiChoice(null);
        setResult(null);
        setScore({ user: 0, ai: 0 });
    };

    const resultText = {
        user: '🎉 You Win! +20 Z Coins',
        ai: '😢 You Lose',
        draw: '🤝 Draw! +5 Z Coins'
    };

    return (
        <GameWrapper title="Rock Paper Scissors">
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2rem' }}>
                <div style={{ display: 'flex', gap: '4rem', fontSize: '1.5rem', fontWeight: 800, color: 'var(--accent-primary)' }}>
                    <div>You: {score.user}</div>
                    <div>AI: {score.ai}</div>
                </div>

                <div style={{ display: 'flex', gap: '3rem', alignItems: 'center', minHeight: '160px' }}>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '5rem', minHeight: '90px' }}>{userChoice?.emoji || '❓'}</div>
                        <div style={{ color: 'var(--text-secondary)' }}>You</div>
                    </div>

                    <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--accent-secondary)' }}>VS</div>

                    <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '5rem', minHeight: '90px' }}>{aiChoice?.emoji || '❓'}</div>
                        <div style={{ color: 'var(--text-secondary)' }}>AI</div>
                    </div>
                </div>

                {result && (
                    <div style={{
                        fontSize: '1.5rem',
                        fontWeight: 700,
                        color: result === 'user' ? '#10b981' : result === 'ai' ? '#ef4444' : 'var(--accent-primary)',
                        padding: '0.5rem 1.5rem',
                        background: 'rgba(155, 89, 182, 0.1)',
                        borderRadius: '20px'
                    }}>
                        {resultText[result]}
                    </div>
                )}

                <div style={{ display: 'flex', gap: '1.5rem' }}>
                    {CHOICES.map((c) => (
                        <button
                            key={c.name}
                            onClick={() => handleChoice(c)}
                            disabled={isRolling}
                            style={{
                                fontSize: '3rem',
                                padding: '1rem 1.5rem',
                                background: 'var(--card-bg)',
                                border: '2px solid var(--card-border)',
                                borderRadius: '16px',
                                cursor: isRolling ? 'not-allowed' : 'pointer',
                                transition: 'transform 0.2s, border-color 0.2s',
                                opacity: isRolling ? 0.6 : 1
                            }}
                            onMouseEnter={(e) => !isRolling && (e.currentTarget.style.transform = 'translateY(-4px)')}
                            onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
                        >
                            {c.emoji}
                        </button>
                    ))}
                </div>

                {(score.user > 0 || score.ai > 0) && (
                    <button onClick={resetGame} className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <RotateCcw size={18} /> Reset Scores
                    </button>
                )}
            </div>
        </GameWrapper>
    );
};

export default RPS;