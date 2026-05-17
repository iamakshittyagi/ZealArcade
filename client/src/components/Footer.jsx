import React from 'react';
import { Link } from 'react-router-dom';
import { Twitter, Mail, Heart, Code2 } from 'lucide-react';

const Footer = () => {
    const year = new Date().getFullYear();

    return (
        <footer className="site-footer">
            <div className="footer-inner">
                <div className="footer-grid">
                    {/* Brand column */}
                    <div className="footer-col">
                        <div className="footer-brand">
                            <img src="/assets/logo_whitebg.png" alt="Zeal Arcade" />
                            <span>Zeal Arcade</span>
                        </div>
                        <p className="footer-tagline">
                            Premium web gaming platform. Classic games, reimagined.
                        </p>
                    </div>

                    {/* Navigation */}
                    <div className="footer-col">
                        <h4>Explore</h4>
                        <Link to="/arcade">Arcade</Link>
                        <Link to="/rewards">Rewards</Link>
                        <Link to="/login">Log In</Link>
                        <Link to="/signup">Sign Up</Link>
                    </div>

                    {/* Games */}
                    <div className="footer-col">
                        <h4>Popular Games</h4>
                        <Link to="/games/chess">Chess</Link>
                        <Link to="/games/ludo">Ludo</Link>
                        <Link to="/games/snake-ladder">Snake & Ladder</Link>
                        <Link to="/games/tic-tac-toe">Tic-Tac-Toe</Link>
                    </div>

                    {/* Connect */}
                    <div className="footer-col">
                        <h4>Connect</h4>
                        <div className="social-links">
                            <a href="https://github.com" target="_blank" rel="noreferrer noopener" aria-label="GitHub">
                                <Code2 size={20} />
                            </a>
                            <a href="https://twitter.com" target="_blank" rel="noreferrer noopener" aria-label="Twitter">
                                <Twitter size={20} />
                            </a>
                            <a href="mailto:hello@zealarcade.com" aria-label="Email">
                                <Mail size={20} />
                            </a>
                        </div>
                    </div>
                </div>

                <div className="footer-bottom">
                    <p>© {year} Zeal Arcade. All rights reserved.</p>
                    <p className="made-with">
                        Made with <Heart size={14} fill="#ef4444" color="#ef4444" /> by the Zeal team
                    </p>
                </div>
            </div>

            <style>{`
                .site-footer {
                    margin-top: 4rem;
                    background: rgba(155, 89, 182, 0.04);
                    border-top: 1px solid var(--card-border);
                    backdrop-filter: blur(10px);
                }
                .footer-inner {
                    max-width: 1200px;
                    margin: 0 auto;
                    padding: 3rem 2rem 1.5rem;
                }
                .footer-grid {
                    display: grid;
                    grid-template-columns: 2fr 1fr 1fr 1fr;
                    gap: 3rem;
                    margin-bottom: 2.5rem;
                }
                .footer-col {
                    display: flex;
                    flex-direction: column;
                    gap: 0.75rem;
                }
                .footer-col h4 {
                    font-size: 0.9rem;
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                    color: var(--text-primary);
                    margin-bottom: 0.5rem;
                }
                .footer-col a {
                    color: var(--text-secondary);
                    text-decoration: none;
                    font-size: 0.95rem;
                    transition: color 0.2s;
                }
                .footer-col a:hover {
                    color: var(--accent-primary);
                }
                .footer-brand {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    margin-bottom: 0.5rem;
                }
                .footer-brand img {
                    height: 40px;
                    width: auto;
                }
                .footer-brand span {
                    font-size: 1.25rem;
                    font-weight: 800;
                    background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
                    -webkit-background-clip: text;
                    background-clip: text;
                    -webkit-text-fill-color: transparent;
                }
                .footer-tagline {
                    color: var(--text-secondary);
                    font-size: 0.95rem;
                    line-height: 1.6;
                    max-width: 320px;
                }
                .social-links {
                    display: flex;
                    gap: 0.75rem;
                }
                .social-links a {
                    width: 40px;
                    height: 40px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: var(--card-bg);
                    border: 1px solid var(--card-border);
                    border-radius: 10px;
                    transition: all 0.2s;
                }
                .social-links a:hover {
                    background: var(--accent-primary);
                    color: white;
                    border-color: var(--accent-primary);
                    transform: translateY(-2px);
                }
                .footer-bottom {
                    border-top: 1px solid var(--card-border);
                    padding-top: 1.5rem;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    flex-wrap: wrap;
                    gap: 1rem;
                    color: var(--text-secondary);
                    font-size: 0.9rem;
                }
                .made-with {
                    display: flex;
                    align-items: center;
                    gap: 0.4rem;
                }
                @media (max-width: 768px) {
                    .footer-grid {
                        grid-template-columns: 1fr 1fr;
                        gap: 2rem;
                    }
                    .footer-inner {
                        padding: 2rem 1.5rem 1rem;
                    }
                    .footer-bottom {
                        flex-direction: column;
                        text-align: center;
                    }
                }
                @media (max-width: 480px) {
                    .footer-grid {
                        grid-template-columns: 1fr;
                    }
                }
            `}</style>
        </footer>
    );
};

export default Footer;