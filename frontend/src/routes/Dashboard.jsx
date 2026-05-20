import { useState, useEffect } from "react";
import { getAllGames, formatCountdown } from "../services/game";
import { CreateGameModal } from "../components/modals/CreateGameModal"
import { useNavigate } from "react-router-dom";
import "bootstrap-icons/font/bootstrap-icons.css";
import { DeleteConfirmModal } from "../components/modals/DeleteConfirmModal";
import { SessionCreatedModal } from "../components/modals/SessionCreatedModal";
import { StopSessionModal } from "../components/modals/StopSessionModal";
import "../styles/Dashboard.css";

export const Dashboard = () => {
    const [games, setGames] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate()

    // Fetch all games on component mount
    useEffect(() => {
        handleGetAllGames()
    }, [])

    // Fetch all games from the API
    const handleGetAllGames = async () => {
        try {
            setLoading(true);
            const allGames = await getAllGames();
            setGames(allGames.games || []);
            console.log(allGames.games)
        } catch (error) {
            console.error("Error fetching games:", error);
        } finally {
            setLoading(false);
        }
    }

    // Format the duration of the game
    const getDuration = (game) => {
        const questions = game.questions || [];
        const totalSeconds = questions.reduce((total, curr) => total + parseInt(curr.duration || 0), 0);
        return formatCountdown(totalSeconds * 1000);
    }

    return (
        <div className="dashboard-container">
            <div className="container">
                <div className="dashboard-header">
                    <div className="d-flex justify-content-between align-items-center flex-wrap">
                        <h1 className="dashboard-title">
                            🎮 Your Quiz Games
                        </h1>
                        <div className="header-actions">
                            <button 
                                className="modern-btn modern-btn-outline" 
                                onClick={() => navigate('/quiz-builder')}
                            >
                                <i className="bi bi-pencil-square"></i>
                                Quiz Builder
                            </button>
                            <CreateGameModal allGames={games} setAllGames={setGames} />
                        </div>
                    </div>
                </div>

                {loading ? (
                    <div className="games-grid">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="game-card loading-skeleton" style={{height: '400px'}}></div>
                        ))}
                    </div>
                ) : games.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-state-icon">📚</div>
                        <h2 className="empty-state-title">No Games Yet!</h2>
                        <p className="empty-state-text">
                            Create your first quiz game to get started
                        </p>
                        <CreateGameModal allGames={games} setAllGames={setGames} />
                    </div>
                ) : (
                    <div className="games-grid">
                        {games.map((game, i) => (
                            <div key={i} className="game-card">
                                <img
                                    src={game.thumbnail || "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='200'%3E%3Crect width='400' height='200' fill='%23667eea'/%3E%3C/svg%3E"}
                                    alt="Game Thumbnail"
                                    className="game-card-thumbnail"
                                />
                                
                                <div className="game-card-body">
                                    <div className="game-card-header">
                                        <h3 className="game-card-title">{game.name}</h3>
                                        <div className="game-card-actions">
                                            <button 
                                                className="icon-btn edit-btn" 
                                                onClick={() => navigate(`/game/${game.id}`)}
                                                title="Edit Game"
                                            >
                                                <i className="bi bi-pencil-fill"></i>
                                            </button>
                                            <DeleteConfirmModal 
                                                array={games} 
                                                setArray={setGames} 
                                                id={game.id} 
                                                name={game.name}
                                            >
                                                <button className="icon-btn delete-btn" title="Delete Game">
                                                    <i className="bi bi-trash-fill"></i>
                                                </button>
                                            </DeleteConfirmModal>
                                        </div>
                                    </div>

                                    <div className="game-stats">
                                        <div className="stat-badge">
                                            <i className="bi bi-question-circle-fill"></i>
                                            <span>{game.questions ? game.questions.length : 0} Questions</span>
                                        </div>
                                        <div className="stat-badge">
                                            <i className="bi bi-clock-fill"></i>
                                            <span>{getDuration(game)}</span>
                                        </div>
                                    </div>

                                    <div className="game-actions">
                                        <div className="game-action-row">
                                            <SessionCreatedModal 
                                                gameId={game.id} 
                                                games={games} 
                                                setGames={setGames}
                                            >
                                                <button className="action-btn">
                                                    🚀 Start Game
                                                </button>
                                            </SessionCreatedModal>
                                            <button 
                                                className="link-btn" 
                                                onClick={() => navigate(`/pastSessions/${game.id}`)}
                                            >
                                                Past Sessions →
                                            </button>
                                        </div>

                                        {game.active !== null && game.active !== 0 && (
                                            <div className="active-session">
                                                <div className="active-session-actions">
                                                    <button 
                                                        className="session-btn" 
                                                        onClick={() => navigate(`/session/${game.active}`, { state: { gameId: game.id } })}
                                                    >
                                                        <i className="bi bi-gear-fill me-2"></i>
                                                        Manage Session
                                                    </button>
                                                    <StopSessionModal game={game} games={games} setGames={setGames}>
                                                        <button className="session-btn">
                                                            <i className="bi bi-stop-circle-fill me-2"></i>
                                                            Stop Session
                                                        </button>
                                                    </StopSessionModal>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};