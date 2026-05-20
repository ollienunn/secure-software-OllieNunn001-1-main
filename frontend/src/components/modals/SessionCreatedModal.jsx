import { useState } from "react";
import { putGames, postMutateGame } from '../../services/game';
import { useNavigate } from "react-router-dom";

export const SessionCreatedModal = ({ gameId, games, setGames }) => {
    const [showModal, setShowModal] = useState(false);
    const navigate = useNavigate()

    let game = games.find(g => g.id === gameId) || { active: null }

    // Function to handle the starting of a session
    const handleSessionStart = async () => {
        if (game.active !== null && game.active !== 0) {
            setShowModal(true);
            return;
        }

        try {
            const response = await postMutateGame(gameId, { "mutationType": "START" });
            const newSessionId = response.data.sessionId;
            const newGames = games.map(g => g.id !== gameId ? g : (
                {
                    ...g,
                    "active": newSessionId,
                    //the server doesn't keep the sessionIds in the order in which they were made so this is stored for PastGameSessions.jsx
                    pastSessionCreatedTimes: g.pastSessionCreatedTimes ? [...g.pastSessionCreatedTimes, { id: newSessionId, time: Date.now() }] : [{ id: newSessionId, time: Date.now() }]
                })
            )
            setGames(newGames);
            await putGames({ games: newGames })
            setShowModal(true);
        } catch (error) {
            console.log(error);
        }
    };

    return (
        <>
            {/* Button to trigger the modal */}
            {game.active === null || game.active === 0 ?
                <button className="btn text-success p-0" data-cy="start-game" onClick={() => { handleSessionStart() }}>
                    Start Game
                </button>
                :
                <button className="btn text-primary p-0 text-start" onClick={() => { handleSessionStart() }}>
                    Ongoing Session
                </button>
            }

            {/* Modal for confirmation to start */}
            {showModal && (
                <>
                    <div className="modal-backdrop fade show"></div>
                    <div className="modal fade show d-block" tabIndex="-1">
                        <div className="modal-dialog modal-dialog-centered">
                            <div className="modal-content">
                                <div className="modal-header">
                                    <h5>Game Session Started</h5>
                                    <button
                                        type="button"
                                        className="btn-close"
                                        onClick={() => setShowModal(false)}
                                        aria-label="Close"
                                    ></button>
                                </div>
                                
                                {/* Display the session ID and URL */}
                                <div className="modal-body">
                                    <p><span className="fw-bold text-primary">Session ID:</span> {game.active}</p>
                                    <p className="mb-0">
                                        <span className="fw-bold text-primary">URL: </span>
                                        <span className="d-inline-flex align-items-center gap-2">
                                            <span>{window.location.origin}/play/join/{game.active}</span>
                                            <button
                                                className="btn btn-sm p-0"
                                                onClick={() => {
                                                    const url = `${window.location.origin}/play/join/${game.active}`;
                                                    navigator.clipboard.writeText(url);
                                                }}
                                            >
                                                <i className="bi bi-copy"></i>
                                            </button>
                                        </span>
                                    </p>
                                </div>
                                
                                {/* Footer with action buttons */}
                                <div className="modal-footer">
                                    <button
                                        className="btn btn-secondary"
                                        onClick={() => setShowModal(false)}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        className="btn btn-success"
                                        onClick={() => navigate(`/session/${game.active}`, { state: { gameId: gameId } })}
                                    >
                                        Manage
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )
            }
        </>
    );
};
