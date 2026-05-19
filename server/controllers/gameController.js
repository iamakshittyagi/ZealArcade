import Game from '../models/Game.js';
import GameSession from '../models/GameSession.js';
import Score from '../models/Score.js';
import User from '../models/User.js';

// GET /api/games  — list all games
export const listGames = async (req, res) => {
  try {
    const games = await Game.find().sort({ name: 1 });
    res.json({ games });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// POST /api/sessions — start a new game session
export const startSession = async (req, res) => {
  try {
    const { gameId } = req.body;
    if (!gameId) return res.status(400).json({ error: 'gameId required' });

    const game = await Game.findOne({ gameId });
    if (!game) return res.status(404).json({ error: 'Game not found' });

    const session = await GameSession.create({
      gameId,
      players: [req.user.id],
      status: 'active'
    });

    res.status(201).json({ session });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// POST /api/sessions/:id/end — end a game session
export const endSession = async (req, res) => {
  try {
    const { result, score = 0, finalState } = req.body;
    // result must be 'win' | 'loss' | 'draw' | 'abandoned'
    if (!['win', 'loss', 'draw', 'abandoned'].includes(result)) {
      return res.status(400).json({ error: 'Invalid result' });
    }

    const session = await GameSession.findById(req.params.id);
    if (!session) return res.status(404).json({ error: 'Session not found' });
    if (session.status === 'completed') {
      return res.status(409).json({ error: 'Session already completed' });
    }

    // Update session
    session.status = result === 'abandoned' ? 'abandoned' : 'completed';
    session.result = result;
    session.score = score;
    session.winner = result === 'win' ? req.user.id : null;
    session.finalState = finalState;
    session.endedAt = new Date();
    session.durationSeconds = Math.round((session.endedAt - session.startedAt) / 1000);
    await session.save();

    // Update aggregated Score for this user+game
    const updates = { lastPlayed: new Date() };
    const inc = { totalGames: 1, totalScore: score };
    if (result === 'win') inc.wins = 1;
    else if (result === 'loss') inc.losses = 1;
    else if (result === 'draw') inc.draws = 1;

    const scoreDoc = await Score.findOneAndUpdate(
      { user: req.user.id, gameId: session.gameId },
      { $inc: inc, $set: updates, $max: { highScore: score } },
      { upsert: true, new: true }
    );

    // Reward coins on win
    const game = await Game.findOne({ gameId: session.gameId });
    let coinChange = 0;
    if (result === 'win' && game) coinChange = game.rewardOnWin;

    if (coinChange) {
      await User.findByIdAndUpdate(req.user.id, { $inc: { coins: coinChange } });
    }

    res.json({ session, score: scoreDoc, coinChange });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/scores/me — current user's stats across all games
export const myScores = async (req, res) => {
  try {
    const scores = await Score.find({ user: req.user.id });
    res.json({ scores });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/leaderboard?gameId=xxx — top players for a game (or overall)
export const leaderboard = async (req, res) => {
  try {
    const { gameId, limit = 20 } = req.query;
    const filter = gameId ? { gameId } : {};
    const scores = await Score.find(filter)
      .sort({ totalScore: -1, wins: -1 })
      .limit(parseInt(limit))
      .populate('user', 'username');
    res.json({ leaderboard: scores });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};