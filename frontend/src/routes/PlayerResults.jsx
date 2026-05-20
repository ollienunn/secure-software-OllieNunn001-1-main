/* eslint-disable indent */
import { useEffect, useState, useRef } from 'react'
import { getSessionResults } from '../services/play'
import { useLocation, useNavigate } from "react-router-dom";
import { pointsAwarded } from '../services/session';
import { calcDuration } from '@/utils/helpers';
import { Button } from '../components/buttons/Button';
import { ScoringInfo } from '../components/ScoringInfo';


export const PlayerResults = () => {
    const navigate = useNavigate()
    const [results, setResults] = useState([])
    const location = useLocation();
    const pointsAvailable = useRef(location.state?.questionPoints);
    const durations = useRef(location.state?.questionDurations);


    useEffect(() => {
        getSessionResults().then((res) => {
            const questionResults = res.results;
        
            const processed = questionResults.map((questionResult, i) => {
                questionResult.timeTaken = calcDuration(
                    questionResult.questionStartedAt,
                    questionResult.answeredAt
                );
        
                const pointsAwardedNum = pointsAwarded(
                    questionResult.timeTaken,
                    questionResult.correct,
                    pointsAvailable.current?.[i],
                    durations.current?.[i]
                );
        
                questionResult.pointsAwarded = pointsAwardedNum;
                return questionResult;
            });
        
            setResults(processed);
        })
        
    }, [])

    const goToJoinGame = () => {
        // localStorage.removeItem('playerId')
        localStorage.removeItem('playerName')
        navigate('/play/join')
    }

    return (
        <div className="container mt-5">
            <h3 className="mb-4 text-center">Answer Summary</h3>
            <div className="table-responsive">
                <table className="table align-middle text-center">
                    <thead className="table-light">
                        <tr>
                            <th>#</th>
                            <th>Answers</th>
                            <th>Points</th>
                            <th>Time Taken</th>
                        </tr>
                    </thead>
                    <tbody>
                        {results.map((questionResult, i) => {
                            const answered = questionResult.answers.length > 0;
                            return (
                                <tr key={i} className={questionResult.correct ? "table-success" : "table-danger"}>
                                    <th>{i + 1}</th>
                                    <td>{answered ? questionResult.answers.join(", ") : <em>—</em>}</td>
                                    <td>{questionResult.pointsAwarded}</td>
                                    <td>{isNaN(questionResult.timeTaken) ? 
                                               questionResult.timeTaken : questionResult.timeTaken + 's'}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
                <h4 className='text-end text-success'> 
                    Total Points:{" "}
                    {results.reduce((sum, qr) => sum + qr.pointsAwarded, 0)}
                </h4>
            </div>
            <ScoringInfo />
            <div className='mt-2 text-end'>
                <Button variant="primary" text="Play Again" onClick={goToJoinGame} />
            </div>
        </div>
    );
};