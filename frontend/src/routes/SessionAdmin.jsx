import { useEffect, useState, useRef } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { Button } from "../components/buttons/Button";
import { getSessionStatus } from "../services/session";
import { postMutateGame, formatCountdown, getAllGames, putGames } from "../services/game";
import { PlayerBoxes } from "../components/PlayerBoxes";
import Spinner from "../components/Spinner";

export const SessionAdmin = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const gameId = location.state?.gameId;
    const { sessionId } = useParams();

    const [sessionStatus, setSessionStatus] = useState({});
    const [currQuestion, setCurrQuestion] = useState({});
    const [timeLeft, setTimeLeft] = useState(0);

    const timeOut = useRef(null);
    const hasEndedRef = useRef(false);
    const playerPollRef = useRef(null); 

    const endGame = async () => {
        if (hasEndedRef.current) return;
        hasEndedRef.current = true;

        try {
            let games = await getAllGames();
            games = games.games || [];

            const newGames = games.map(g => {
                if (g.id !== gameId) return g;
                return { ...g, active: null };
            });

            await putGames({ games: newGames });
            await postMutateGame(gameId, { mutationType: "END" });

            console.log("Game ended successfully");
            navigate(`/pastSessions/${gameId}/session/${sessionId}`);
        } catch (err) {
            console.error("Failed to end game:", err);
        }
    };

    const advanceGame = async () => {
        await postMutateGame(gameId, { mutationType: "ADVANCE" });

        if (timeOut.current) clearTimeout(timeOut.current);

        const res = await getSessionStatus(sessionId).catch(console.error);
        if (!res) return;

        if (res.results.active === false) {
            endGame();
            return;
        }

        if (res.results.position !== undefined && res.results.position !== -1) {
            setCurrQuestion(res.results.questions[res.results.position]);
        }

        setSessionStatus(res.results);
    };

    // timer / remaining-time effec
    useEffect(() => {
        const getRemainingTime = () => {
            if (location.pathname === "/login") return;

            if (!currQuestion?.duration || !sessionStatus?.isoTimeLastQuestionStarted) {
                setTimeLeft(0);
                return;
            }

            const start = new Date(sessionStatus.isoTimeLastQuestionStarted);
            const now = new Date();
            const elapsed = now - start;
            const remaining = currQuestion.duration * 1000 - elapsed;

            if (remaining <= 0) {
                setTimeLeft(0);

                const isLastQuestion = sessionStatus.position === sessionStatus.questions?.length - 1;
                const sessionIsActive = sessionStatus.active;

                if (isLastQuestion && sessionIsActive) {
                    endGame();
                }

                return;
            }

            setTimeLeft(remaining);
            timeOut.current = setTimeout(getRemainingTime, remaining % 1000 || 1000);
        };

        getRemainingTime();

        return () => clearTimeout(timeOut.current);
    }, [sessionStatus]);

    // initial fetch + existing position-polling 
    useEffect(() => {
        getSessionStatus(sessionId).then((res) => {
            if (res.results.active === false) {
                endGame();
                return;
            }

            if (res.results.position !== undefined && res.results.position !== -1) {
                setCurrQuestion(res.results.questions[res.results.position]);
            }

            setSessionStatus(res.results);
        }).catch(console.error);

        const pollPlayersOrStart = async () => {
            if (location.pathname === "/login") return;

            const res = await getSessionStatus(sessionId);
            setSessionStatus(res.results);

            if (res.results.position === -1) {
                // keep polling until the game starts
                timeOut.current = setTimeout(pollPlayersOrStart, 1000);
            } else {
                clearTimeout(timeOut.current);
            }
        };

        timeOut.current = setTimeout(pollPlayersOrStart, 1000);

        return () => clearTimeout(timeOut.current);
    }, []);

    useEffect(() => {
        const zeroPlayers = Array.isArray(sessionStatus.players) && sessionStatus.players.length === 0;
        const notStarted = sessionStatus.position === -1 || sessionStatus.position === undefined;

        if (playerPollRef.current) {
            clearInterval(playerPollRef.current);
            playerPollRef.current = null;
        }

        if (location.pathname !== "/login" && zeroPlayers && notStarted) {
            const pollUntilPlayerJoins = async () => {
                try {
                    const res = await getSessionStatus(sessionId);
                    setSessionStatus(res.results);

                    // stop when at least one player is present OR the game moves on
                    const hasPlayers = Array.isArray(res.results.players) && res.results.players.length > 0;
                    const started = res.results.position !== -1 && res.results.position !== undefined;
                    if (hasPlayers || started) {
                        if (playerPollRef.current) {
                            clearInterval(playerPollRef.current);
                            playerPollRef.current = null;
                        }
                    }
                } catch (err) {
                    console.error("Error polling for players:", err);
                }
            };

            // Run immediately, then every second
            pollUntilPlayerJoins();
            playerPollRef.current = setInterval(pollUntilPlayerJoins, 1000);
        }

        return () => {
            if (playerPollRef.current) {
                clearInterval(playerPollRef.current);
                playerPollRef.current = null;
            }
        };
    }, [sessionStatus.players, sessionStatus.position, sessionId, location.pathname]);

    if (sessionStatus.players && sessionStatus.players.length === 0) {
        return <Spinner text="Awaiting players to Join" />;
    }

    if (
        sessionStatus.active === undefined ||
        (sessionStatus.active &&
            sessionStatus.position < sessionStatus.questions?.length)
    ) {
        return (
            <div className="container-fluid vh-100 mt-4">
                <div className="d-flex flex-column h-75">
                    {/* Top Row */}
                    <div className="d-flex flex-fill h-50">
                        <div className="w-50 border overflow-auto">
                            <div className="d-inline-block bg-primary text-white px-2 py-1 rounded-2 rounded-top-0 rounded-start-0">
                                <h4 className="mb-0">Questions</h4>
                            </div>
                            {sessionStatus.position === -1 ? (
                                <h5 className="text-center">Game Not Yet Started.</h5>
                            ) : (
                                <div className="p-3">
                                    <h5>Question: {currQuestion?.text}</h5>
                                    <h5>Points: {currQuestion?.points}</h5>
                                    <h5>Correct Answer(s):</h5>
                                    {currQuestion?.correctAnswers?.map((opt, i) => (
                                        <h5 key={i}>{opt}</h5>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="w-50 border overflow-auto d-flex flex-column">
                            <div className="bg-primary text-white px-2 py-1 rounded-2 rounded-top-0 rounded-start-0 w-auto align-self-start">
                                <h4 className="mb-0">Time Remaining</h4>
                            </div>
                            {sessionStatus.position === -1 ? (
                                <h5 className="text-center">Game Not Yet Started.</h5>
                            ) : (
                                <div className="d-flex flex-column justify-content-center h-100 p-3">
                                    <div className="card bg-success border rounded-3 mx-auto px-3 py-2">
                                        <h4 className="mb-0 text-white text-center">
                                            {formatCountdown(timeLeft)}
                                        </h4>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Bottom Row */}
                    <div className="d-flex flex-fill h-50">
                        <div className="w-100 border overflow-auto">
                            <div className="d-inline-block bg-primary text-white px-2 py-1 rounded-2 rounded-top-0 rounded-start-0">
                                <h4 className="mb-0">Players</h4>
                            </div>
                            <PlayerBoxes players={sessionStatus.players} />
                        </div>
                    </div>

                    {/* Controls */}
                    <div className="mt-1 text-end">
                        {sessionStatus.position !== sessionStatus.questions?.length - 1 ? (
                            <div className="d-flex gap-2 justify-content-end mb-1">
                                <Button variant="danger" text="End Game" onClick={endGame} />
                                <Button variant="primary" text="Advance Game" onClick={advanceGame} />
                            </div>
                        ) : (
                            <div className="mb-1">
                                <Button variant="success" text="Results" onClick={endGame} />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    return null;
};
