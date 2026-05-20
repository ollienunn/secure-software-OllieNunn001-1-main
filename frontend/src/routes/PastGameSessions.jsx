import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom'
import { getAllGames } from '../services/game';

export const PastGameSessions = () => {
    const { gameId } = useParams()
    const navigate = useNavigate();
    const [oldSessionsData, setOldSessionsData] = useState(null)
    const [game, setGame] = useState(null)

    // Fetch all games and find the game with the given gameId
    useEffect(() => {
        getAllGames().then((res) => {
            setGame(res.games.find(g => {
                return g.id === parseInt(gameId)
            }))
        })
    }, [])
    // Sort the past sessions by time
    useEffect(() => {
        if (game !== null) {
            setOldSessionsData(game.pastSessionCreatedTimes?.sort((a, b) => {
                const aTime = new Date(a.time).getTime();
                const bTime = new Date(b.time).getTime();

                if (isNaN(aTime)) return 1;
                if (isNaN(bTime)) return -1;

                return aTime - bTime;
            }))
        }
    }, [game])

    return (
        // only retuurn past sessions if they exist
        oldSessionsData !== null && (
            <div className="container mt-4">
                <h4 className="mb-3 text-center">Past Sessions</h4>
                <table className="table table-striped text-center">
                    <thead className="table-light">
                        <tr>
                            <th>#</th>
                            <th>Session ID</th>
                            <th>Created</th>
                            <th>Open</th>
                        </tr>
                    </thead>
                    <tbody>
                        {oldSessionsData.map((session, i) => {
                            let time = new Date(session.time).toLocaleString().split(", ");
                            if (time[1] == undefined) {
                                time = time[0]
                            } else {
                                time = time[1] + ", " + time[0]
                            }
                            return (
                                <tr key={session.id}>
                                    <td>{i + 1}</td>
                                    <td>{session.id}</td>
                                    <td>{time}</td>
                                    <td>
                                        <button
                                            className="btn btn-primary btn-sm"
                                            onClick={() =>
                                                navigate(`/pastSessions/${gameId}/session/${session.id}`)
                                            }
                                        >
                                            Open
                                        </button>
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>
        )
    );
};
