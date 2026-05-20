import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Login } from './routes/Login';
import { AlertProvider } from './contexts/AlertContext';
import './styles/globals.css';

import { Dashboard } from './routes/Dashboard';
import { Register } from './routes/Register';
import { GameEdit } from './routes/GameEdit';
import { QuestionEdit } from './routes/QuestionEdit';
import { PlayerJoin } from './routes/PlayerJoin';
import { PlayGame } from './routes/PlayGame';
import { SessionAdmin } from './routes/SessionAdmin';
import { SecuredRoutes } from './routes/SecuredRoutes';
import { PlayLobby } from './routes/PlayLobby';
import { PlayerResults } from './routes/PlayerResults';
import { PastGameSessions } from './routes/PastGameSessions';
import { SessionResults } from './routes/SessionResults';
import { QuizBuilder } from './routes/QuizBuilder';

function App() {
    return (
        <BrowserRouter>
            <AlertProvider>
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/play/join" element={<PlayerJoin />} />
                    <Route path="/play/join/:sessionId" element={<PlayerJoin />} />
                    <Route path="/play/game/:sessionId/lobby" element={<PlayLobby />} />
                    <Route path="/play/game/:sessionId" element={<PlayGame />} />
                    <Route path="/play/game/:sessionId/results" element={<PlayerResults />} />

                    <Route element={<SecuredRoutes />}>
                        <Route path="/" element={<Dashboard />} />
                        <Route path="/game/:gameId" element={<GameEdit />} />
                        <Route path="/pastSessions/:gameId" element={<PastGameSessions />} />
                        <Route path="/pastSessions/:gameId/session/:sessionId" element={<SessionResults />} />
                        <Route path="/game/:gameId/question/:questionId" element={<QuestionEdit />} />
                        <Route path="/session/:sessionId" element={<SessionAdmin />} />
                        <Route path="/quiz-builder" element={<QuizBuilder />} />
                    </Route>
                </Routes>
            </AlertProvider>
        </BrowserRouter>
    );
}
export default App
