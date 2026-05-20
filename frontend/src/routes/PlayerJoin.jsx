import brain from '../assets/brain.png'

import { Button } from "../components/buttons/Button";
import { addPlayer } from '../services/play';
import { useState, useEffect } from 'react';

import useAlert from '../hooks/useAlert';
import { useNavigate, useParams } from "react-router-dom";
import Input from '../components/inputs/Input';

export const PlayerJoin = () => {
    const [sessionId, setSessionId] = useState("");
    const [playerName, setPlayerName] = useState("");
    const { setAlertMessage, setAlertType } = useAlert();

    const { sessionId: urlSessionId } = useParams();
    const navigate = useNavigate();

    // Check if sessionId is provided in the URL
    useEffect(() => {
        if (urlSessionId) {
            setSessionId(urlSessionId);
        }
    }, [urlSessionId])

    // Check if playerName is already set in localStorage
    const handlePlayerJoin = async () => {
        try {
            await addPlayer(sessionId, playerName)
            navigate(`/play/game/${sessionId}/lobby`)
        } catch (error) {
            setAlertMessage(error.message)
            setAlertType('ERROR')

            setSessionId("")
        }
    }

    return (
        // return general purpose card body
        <div className="container-fluid d-flex justify-content-center align-items-center min-vh-100">
            <div className="row w-100 justify-content-center">
                <div className="col-12 col-sm-10 col-md-6">
                    <div className="card shadow">
                        <div className="card-body text-center">
                            <h4>Join a SMALLGAME Game</h4>

                            <img
                                src={brain}
                                className="img-fluid mb-3 mx-auto d-block"
                                alt="small-brain-img"
                            />

                            {/* Form Info for Name and Id */}
                            <div className="text-start">
                                <Input
                                    label="UserName"
                                    type="text"
                                    value={playerName}
                                    onChange={(event) => setPlayerName(event.target.value)}
                                    placeholder="Enter a player username"
                                />

                                <Input
                                    label="SessionId"
                                    type="text"
                                    value={sessionId}
                                    onChange={(event) => setSessionId(event.target.value)}
                                    placeholder="Enter provided session ID"
                                />
                            </div>

                            <Button
                                variant="success"
                                text="Join Game"
                                type="submit"
                                onClick={handlePlayerJoin}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};


