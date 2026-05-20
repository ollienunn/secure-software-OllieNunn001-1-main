import { useNavigate, useParams } from 'react-router-dom'
import { useEffect, useState, useRef } from 'react'
import { getPlayerSessionStatus, getSessionCurrentQuestion, postSessionCurrentQuestionAnswer, 
    getSessionCurrentQuestionCorrectAnswers } from '../services/play'
import MultiAnswerInput from '../components/inputs/MultiAnswerInput';
import useAlert from '../hooks/useAlert';
import AnswerReviewCard from '../components/AnswerReviewCard'
import { Button } from '../components/buttons/Button';
import { formatCountdown } from '../services/game';

export const PlayGame = () => {
    const SERVER_SYNC_RATE = 200; 
    const { sessionId } = useParams()
    const navigate = useNavigate()

    const { setAlertMessage, setAlertType } = useAlert()
    const timeOut = useRef(null)
    const timeLeftTimeOut = useRef(null)

    const [currQuestion, setCurrQuestion] = useState(null)
    const [timeLeft, setTimeLeft] = useState(null)
    const [answer, setAnswer] = useState(null)
    const [correctAnswers, setCorrectAnswers] = useState([])

    const [questionPoints, setQuestionPoints] = useState([])
    const [questionDurations, setQuestionDurations] = useState([])
    const [gameEnded, setGameEnded] = useState(false)

    // Function to handle the answer submission
    const handleSubmit = () => {
        let submission = answer
        if (!Array.isArray(answer)) {
            submission = [answer]
        }
        postSessionCurrentQuestionAnswer({ answers: submission }).then(() => {
            if (submission.length == 1) {
                setAlertMessage("Answer Submitted")
            } else {
                setAlertMessage("Answers Submitted")
            }
            setAlertType("SUCCESS")
        }).catch(error => {
            setAlertMessage(error.message)
            setAlertType("ERROR")
        })
    }

    // check if the question has changed
    const checkForNewQuestion = async () => {
        if (location.pathname === "/login" || gameEnded) {
            return;
        }

        getSessionCurrentQuestion().then((res) => {
            clearTimeout(timeOut.current)
            if (currQuestion?.id !== res.question.id) {
                setCurrQuestion(res.question)
                setQuestionPoints(prev => [...prev, res.question.points])
                setQuestionDurations(prev => [...prev, res.question.duration])
                setAnswer([])
                setCorrectAnswers([])
            } else {
                timeOut.current = setTimeout(checkForNewQuestion, SERVER_SYNC_RATE)
            }
        }).catch((error) => {
            if (error.message === "Session ID is not an active session") {
                goToResultsPage()
            }
        })
    }
    // get the correct answers for the current question
    const getCorrectAnswers = async () => {
        if (gameEnded) return;

        getSessionCurrentQuestionCorrectAnswers().then((answers) => {
            setCorrectAnswers(answers)
        }).catch((error) => {
            if (error.message === "Session ID is not an active session") {
                goToResultsPage()
            }
        })
    }

    // navigate to the results page
    const goToResultsPage = () => {
        if (gameEnded) {
            return 
        } 
        setGameEnded(true);
        navigate(`/play/game/${sessionId}/results`, {
            state: { questionPoints, questionDurations }
        });
    }

    // check if the game has started
    useEffect(() => {
        const checkGameStarted = () => {
            if (location.pathname === "/login") {
                return
            }
            getPlayerSessionStatus().then((res) => {
                console.log("checkGameStarted", res)
                if (res.started) {
                    checkForNewQuestion()
                } else {
                    clearTimeout(timeOut.current)
                    timeOut.current = setTimeout(checkGameStarted, SERVER_SYNC_RATE)
                }
            })
        }

        if (currQuestion === null) {
            checkGameStarted()
        }
    }, [])

    useEffect(() => {
        clearTimeout(timeOut.current)
        console.log("useEffect for currQuestion", currQuestion)
        checkForNewQuestion()

        const getRemainingTime = () => {

            if (gameEnded) return;

            if (location.pathname === "/login") {
                return
            }
            clearTimeout(timeLeftTimeOut.current)

            if (!currQuestion?.duration || !currQuestion?.isoTimeLastQuestionStarted) {
                setTimeLeft(0)
            } else {
            
                const start = new Date(currQuestion.isoTimeLastQuestionStarted);
                const now = new Date();
                const elapsed = now - start;
                const remaining = currQuestion.duration * 1000 - elapsed;

                if (remaining <= 0) {
                    setTimeLeft(0)
                    if (currQuestion?.final === true) {
                        setTimeout(goToResultsPage, SERVER_SYNC_RATE * 2)
                    } else {
                        setTimeout(getCorrectAnswers, SERVER_SYNC_RATE)
                    }
                } else {
                    setTimeLeft(remaining)
                    timeLeftTimeOut.current = setTimeout(() => getRemainingTime(), remaining % 1000)
                }
            }
        }
        getRemainingTime()
    }, [currQuestion])

    useEffect(() => {
        if (answer !== null && answer.length !== 0) {
            handleSubmit()
        }
    }, [answer])

    useEffect(() => {
        return () => {
            clearTimeout(timeOut.current)
            clearTimeout(timeLeftTimeOut.current)
        }
    }, [])

    return (
        <div>
            {currQuestion !== null && (
                <div className="d-flex justify-content-center align-items-center min-vh-100">
                    <div className="card shadow p-4 w-75 w-md-75 w-lg-50">
                        <div className="card-body">
                            <div className='d-flex justify-content-between'>
                                <h3 className="card-title">Question</h3>
                                <h5>{formatCountdown(timeLeft)}</h5>
                            </div>
                            <h5 className="card-text">{currQuestion.text}</h5>

                            {currQuestion.visual && currQuestion.visual.startsWith("data:image") ? (
                                <img src={currQuestion.visual} alt="Visual" className="img-fluid rounded mb-3" />
                            ) : currQuestion.visual ? (
                                <div className="ratio ratio-16x9 mb-3">
                                    <iframe
                                        src={currQuestion.visual.replace("watch?v=", "embed/")}
                                        title="Visual"
                                        allowFullScreen
                                    ></iframe>
                                </div>
                            ) : null}
                            {correctAnswers.length === 0 ? (
                                <div>
                                    {
                                        currQuestion.type === "Judgement" ?
                                            <input
                                                type="text"
                                                className="form-control mb-2"
                                                placeholder="Your answer..."
                                                value={answer}
                                                onChange={(e) => setAnswer(e.target.value)}
                                            />
                                            :
                                            <MultiAnswerInput
                                                choiceType={currQuestion.type}
                                                options={currQuestion.options}
                                                onAnswer={(ans) => setAnswer(ans)}
                                            />
                                    }
                                </div>)
                                :
                                <div>
                                    {/* Show which answers were correct vs. what player gave */}
                                    <AnswerReviewCard 
                                        correctAnswers={correctAnswers.answers} 
                                        givenAnswers={Array.isArray(answer) ? answer : [answer]} />
                                    {currQuestion.final && timeLeft === 0 &&
                                        <div className='text-end mt-3'>
                                            <Button variant="success" text="Final Results" onClick={goToResultsPage} />
                                        </div>
                                    }
                                </div>
                            }
                        </div>
                    </div>
                </div>)
            }
        </div >
    )
}
