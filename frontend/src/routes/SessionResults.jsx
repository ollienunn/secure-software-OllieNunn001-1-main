import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getSessionResults, getPlayerScore } from '../services/session'
import { getAllGames } from '../services/game'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid, Legend } from 'recharts';
import { Button } from '../components/buttons/Button'
import { ScoringInfo } from '../components/ScoringInfo';

export const SessionResults = () => {
    const navigate = useNavigate()

    const { gameId, sessionId } = useParams()
    const [results, setResults] = useState(null)
    const [game, setGame] = useState(null)

    useEffect(() => {
        getAllGames().then((res) => {
            console.log(res)
            setGame(res.games.find(g => {
                return g.id === parseInt(gameId)
            }))
        })
        getSessionResults(sessionId).then((res) => setResults(res.results))

    }, [])

    if (game === null || results === null) {
        return
    } else if (results.length === 0) {
        return (
            <h3>There are no results for this session.</h3>
        )
    }

    const allPlayerScores = results.map(r => ({ name: r.name, points: getPlayerScore(game.questions, r.answers) }))
    let top5PlayerStats = allPlayerScores.sort((a, b) => b.points - a.points).slice(0, 5);
    top5PlayerStats = top5PlayerStats.map((player) => {
        let playerSessionData = results.find(r => r.name === player.name)
        playerSessionData = playerSessionData.answers.filter(a => a.answeredAt !== null)
        const totalTime = playerSessionData.reduce((sum, t) => sum + (new Date(t.answeredAt) - new Date(t.questionStartedAt)) / 1000, 0)
        return { ...player, avgResponseTime: (playerSessionData.length === 0 ? 0 : (totalTime / playerSessionData.length)).toFixed(4) + 's' }
    })

    const totalPlayers = results.length;

    const percentageCorrect = game.questions.map((_, i) => {
        const correctAnswers = results.filter(player =>
            player.answers?.[i]?.correct
        ).length;

        const percentage = totalPlayers > 0 ? Math.round((correctAnswers / totalPlayers) * 100) : 0;

        return {
            question: `Q${i + 1}`,
            percentage
        };
    });

    const averageResponseTime = game.questions.map((_, i) => {
        const times = results.map(player => {
            const answer = player.answers?.[i];
            if (!answer?.answeredAt || !answer?.questionStartedAt) {
                return null;
            }

            const start = new Date(answer.questionStartedAt);
            const end = new Date(answer.answeredAt);
            return (end - start) / 1000;
        }).filter(time => time !== null);

        const totalTime = times.reduce((sum, t) => sum + t, 0);
        const avgResponseTime = times.length > 0 ? (totalTime / times.length).toFixed(2) : 0;

        return {
            question: `Q${i + 1}`,
            avgResponseTime
        };
    });


    return (
        <div className="container my-4 vw-100">
            <ul className="nav nav-tabs" role="tablist">
                <li className="nav-item">
                    <button className="nav-link active" data-bs-toggle="tab" data-bs-target="#players">
                        Top Players
                    </button>
                </li>
                <li className="nav-item">
                    <button className="nav-link" data-bs-toggle="tab" data-bs-target="#accuracy">
                        Question Accuracy
                    </button>
                </li>
                <li className="nav-item">
                    <button className="nav-link" data-bs-toggle="tab" data-bs-target="#response">
                        Avg Response Time
                    </button>
                </li>
            </ul>

            <div className="tab-content mt-4 w-100">
                <div className="tab-pane fade show active" id="players">
                    <h3 className="mb-3">Top 5 Players</h3>
                    <table className="table table-striped">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Score</th>
                                <th>Avg. Response Time</th>
                            </tr>
                        </thead>
                        <tbody>
                            {top5PlayerStats.map((player, i) => (
                                <tr key={i}>
                                    <td>{player.name}</td>
                                    <td>{player.points}</td>
                                    <td>{player.avgResponseTime}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="tab-pane fade" id="accuracy">
                    <h4>Question Accuracy</h4>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={percentageCorrect}>
                            <XAxis dataKey="question" />
                            <YAxis unit="%" />
                            <Tooltip />
                            <Bar dataKey="percentage" fill="#4285f4" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                <div className="tab-pane fade" id="response">
                    <h4>Average Response Time</h4>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={averageResponseTime}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="question" />
                            <YAxis unit="s" />
                            <Tooltip />
                            <Legend />
                            <Line type="monotone" dataKey="avgResponseTime" stroke="#db4437" />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>
            <ScoringInfo />
            <div className="d-flex justify-content-end mt-2">
                <Button variant="primary" text="Back to Dashboard" onClick={() => navigate('/')} />
            </div>
        </div>
    );
}