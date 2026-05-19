import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { GameProvider, useGame } from './context/GameContext';

// Pages
import Welcome from './pages/Welcome';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Arcade from './pages/Arcade';
import Rewards from './pages/Rewards';
import Leaderboard from './pages/Leaderboard';


// Games
import TicTacToe from './games/TicTacToe';
import SnakeLadder from './games/SnakeLadder';
import Ludo from './games/Ludo';
import Chess from './games/Chess';
import Snake from './games/Snake';
import Sudoku from './games/Sudoku';
import ConnectFour from './games/ConnectFour';
import FlappyBird from './games/FlappyBird';
import Arrows from './games/Arrows';
import Pacman from './games/Pacman';
import SeaBattle from './games/SeaBattle';
import PingPong from './games/PingPong';
import HandSlap from './games/HandSlap';
import RPS from './games/RPS';
import AirHockey from './games/AirHockey';

// Route guard — redirects to /login if no user is logged in
const ProtectedRoute = ({ children }) => {
    const { user } = useGame();
    if (!user) return <Navigate to="/login" replace />;
    return children;
};

function App() {
    return (
        <GameProvider>
            <Router>
                <Routes>
                    {/* Public */}
                    <Route path="/" element={<Welcome />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/signup" element={<Signup />} />

                    {/* Protected — main app */}
                    <Route path="/arcade" element={
                        <ProtectedRoute><Arcade /></ProtectedRoute>
                    } />
                    <Route path="/rewards" element={
                        <ProtectedRoute><Rewards /></ProtectedRoute>
                    } />
                    <Route path="/leaderboard" element={
                        <ProtectedRoute><Leaderboard /></ProtectedRoute>
                    } />

                    {/* Games (all protected) */}
                    <Route path="/games/tic-tac-toe" element={
                        <ProtectedRoute><TicTacToe /></ProtectedRoute>
                    } />
                    <Route path="/games/snake-ladder" element={
                        <ProtectedRoute><SnakeLadder /></ProtectedRoute>
                    } />
                    <Route path="/games/ludo" element={
                        <ProtectedRoute><Ludo /></ProtectedRoute>
                    } />
                    <Route path="/games/chess" element={
                        <ProtectedRoute><Chess /></ProtectedRoute>
                    } />
                    <Route path="/games/snake" element={
                        <ProtectedRoute><Snake /></ProtectedRoute>
                    } />
                    <Route path="/games/sudoku" element={
                        <ProtectedRoute><Sudoku /></ProtectedRoute>
                    } />
                    <Route path="/games/connect-four" element={
                        <ProtectedRoute><ConnectFour /></ProtectedRoute>
                    } />
                    <Route path="/games/flappy-bird" element={
                        <ProtectedRoute><FlappyBird /></ProtectedRoute>
                    } />
                    <Route path="/games/arrows" element={
                        <ProtectedRoute><Arrows /></ProtectedRoute>
                    } />
                    <Route path="/games/pacman" element={
                        <ProtectedRoute><Pacman /></ProtectedRoute>
                    } />
                    <Route path="/games/sea-battle" element={
                        <ProtectedRoute><SeaBattle /></ProtectedRoute>
                    } />
                    <Route path="/games/ping-pong" element={
                        <ProtectedRoute><PingPong /></ProtectedRoute>
                    } />
                    <Route path="/games/hand-slap" element={
                        <ProtectedRoute><HandSlap /></ProtectedRoute>
                    } />
                    <Route path="/games/rps" element={
                        <ProtectedRoute><RPS /></ProtectedRoute>
                    } />
                    <Route path="/games/air-hockey" element={
                        <ProtectedRoute><AirHockey /></ProtectedRoute>
                    } />

                    {/* Catch-all */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </Router>
        </GameProvider>
    );
}

export default App;