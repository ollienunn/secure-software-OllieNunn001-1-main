import { useState } from "react";
import { putGames, postMutateGame } from "../../services/game";
import { useNavigate } from "react-router-dom";

export const StopSessionModal = ({ games, setGames, game }) => {
    const [showModal, setShowModal] = useState(false);
    const [sessionId, setSessionId] = useState(game.active)
    const navigate = useNavigate();

    // Function to handle the stopping of a session
    const handleSessionStop = async () => {
        try {
            let sessionId = game.active
            let newGames = games.map(g => {
                if (g.id !== game.id) {
                    return g;
                }
                g.active = null;
                g.session = {}
                return g;
            })

            await putGames({ games: newGames })
            await postMutateGame(game.id, { "mutationType": "END" })
            setGames(newGames)
            setSessionId(sessionId)

        } catch (error) {
            console.log(error)
        }
    };

    return (
        <>
            {/* Button to trigger the modal */}
            {game.active !== null && game.active !== 0 &&
                <button className="btn text-danger p-0 text-end" onClick={() => {
                    handleSessionStop()
                    setShowModal(true)
                }}>
                    Stop
                </button>
            }

            {/* Modal for confirmation to stop*/}
            {showModal && (
                <>
                    <div className="modal-backdrop fade show"></div>
                    <div className="modal fade show d-block" tabIndex="-1">
                        <div className="modal-dialog modal-dialog-centered">
                            <div className="modal-content">
                                <div className="modal-header">
                                    <h5 className="modal-title">Session Stopped</h5>
                                    <button
                                        type="button"
                                        className="btn-close"
                                        onClick={() => setShowModal(false)}
                                        aria-label="Close"
                                    ></button>
                                </div>
                                <div className="modal-body">
                                    Would you like to view the results?
                                </div>
                                <div className="modal-footer">
                                    <button
                                        className="btn btn-secondary"
                                        onClick={() => setShowModal(false)}
                                    >
                                        Cancel
                                    </button>

                                    {/* Button to navigate to the results page */ }
                                    <button className="btn btn-success" onClick={() => navigate(`/session/${sessionId}`)}>
                                        Results
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </>
    );
};
