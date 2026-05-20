// PlayLobby.js

import { useEffect, useState } from "react";
import brain from "../assets/brain.png";
import { getPlayerSessionStatus } from "../services/play";
import useAlert from "../hooks/useAlert";
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from "../components/buttons/Button";
import 'animate.css';

export const PlayLobby = () => {
    const [secondsElapsed, setSecondsElapsed] = useState(0);
    const playerName = localStorage.getItem("playerName");
    const { setAlertMessage, setAlertType } = useAlert();
    const navigate = useNavigate();
    const { sessionId } = useParams();

    //check server to see if the host has started the game
    useEffect(() => {
        const interval = setInterval(async () => {
            try {
                const result = await getPlayerSessionStatus();
                if (result.started) {
                    navigate(`/play/game/${sessionId}`);
                    clearInterval(interval);
                }
            } catch (error) {
                setAlertMessage(error.message);
                setAlertType("ERROR")
            }
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    // simple timer to update the waiting time display
    useEffect(() => {
        const timer = setInterval(() => setSecondsElapsed(prev => prev + 1), 1000);
        return () => clearInterval(timer);
    }, []);

    return (
        <div className="d-flex flex-column justify-content-center align-items-center text-center min-vh-100 bg-light">
            <div className="card shadow p-4 rounded-4 w-50" >
                <h2 className="mb-2">Welcome {playerName}!</h2>
                <p className="text-muted mb-3">SessionId <strong>{sessionId}</strong></p>

                {/* Animated brain icon while waiting */}
                <div className="d-flex justify-content-center align-items-center mb-4">
                    <img
                        src={brain}
                        alt="Animated brain"
                        className="animate__animated animate__pulse animate__infinite"
                        width="100"
                    />
                </div>

                {/* Instructions and elapsed time */}
                <p className="text-muted mb-1">Waiting for the host to start the game...</p>
                <p className="text-muted small">
                    You have been waiting {secondsElapsed} {secondsElapsed === 1 ? 'second' : 'seconds'}.
                </p>

                {/* Action buttons: copy session ID or refresh */}
                <div className="d-flex justify-content-center gap-2 mt-3">
                    <Button
                        text="Copy Id"
                        variant="outline-primary"
                        onClick={() => navigator.clipboard.writeText(sessionId)}
                    />
                    <Button
                        text="Refresh"
                        variant="outline-danger"
                        onClick={() => window.location.reload()}
                    />
                </div>
            </div>
        </div>
    );
};
