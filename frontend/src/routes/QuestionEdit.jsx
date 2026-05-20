// QuestionEdit.jsx

import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import ObjectInput from '../components/inputs/ObjectInput';
import { getQuestion, getAllGames, handleQuestionUpdate } from '../services/game';
import { Button } from '../components/buttons/Button';
import JudgementAnswerInput from '../components/choices/JudgementAnswerInput';
import ChoiceAnswerInput from '../components/choices/ChoiceAnswerInput';
import useAlert from '../hooks/useAlert';
import { MediaPreview } from '../components/media/MediaPreview';
import { MediaTypeToggle } from '../components/media/MediaTypeToggle';
import MediaInput from '../components/inputs/MediaInput';

export const QuestionEdit = () => {
    const { gameId, questionId } = useParams();
    const [currQuestion, setCurrQuestion] = useState({});
    const [questionArr, setQuestionArr] = useState([]);
    const { setAlertMessage, setAlertType } = useAlert();
    const [mediaInputMode, setMediaInputMode] = useState('upload');
    const navigate = useNavigate();

    // All possible question-type options
    const allQuestionTypes = [
        { label: "Judgement Question", value: "Judgement" },
        { label: "Multi-Answer Choice Question", value: "Multi-Choice" },
        { label: "Single-Answer Choice Question", value: "Single-Choice" }
    ];

    // Only show the types that differ from the current one
    const availableOptions = allQuestionTypes.filter(
        (type) => currQuestion.type && type.value !== currQuestion.type
    );

    // wrapper for update question button
    const handleUpdateQuestion = async () => {
        const questionReqObj = {
            gameId,
            questionArr,
            questionObj: currQuestion,
            setQuestionArr
        };
        try {
            await handleQuestionUpdate(
                "update",
                questionReqObj,
                setAlertMessage,
                setAlertType
            );
            navigate(`/game/${gameId}`);
        } catch (error) {
            setAlertMessage(error.message);
            setAlertType("ERROR");
        }
    };

    // handler to switch question type and reset fields if needed
    const handleTypeChange = (newType) => {
        const updated = {
            ...currQuestion,
            type: newType,
            ...(newType === 'Judgement' && {
                correctAnswers: [],
                options: []
            })
        };

        setCurrQuestion(updated);
        setQuestionArr(prev =>
            prev.map(q => q.id === updated.id ? updated : q)
        );
    };

    // set questions and update options wrapper func
    const setCorrectAnswersAndOptions = (newCorrectAnswers, updatedOptions = []) => {
        const updated = {
            ...currQuestion,
            correctAnswers: newCorrectAnswers,
            options: updatedOptions.map(opt => opt.text?.trim() ?? "")
        };
        setCurrQuestion(updated);
        setQuestionArr((prev) =>
            prev.map(q => q.id === updated.id ? updated : q)
        );
    };

    // Load all questions for this game once on mount
    useEffect(() => {
        const retrieveGames = async () => {
            const response = await getAllGames();
            const questionArr = response.games.find(game => game.id.toString() === gameId).questions;
            setQuestionArr(questionArr);
        };
        retrieveGames();
    }, [gameId]);

    // Load the one question we’re editing whenever questionId changes
    useEffect(() => {
        const retrieveQuestion = async () => {
            const question = await getQuestion(gameId, questionId);
            setCurrQuestion({
                text: question.text,
                type: question.type,
                summary: question.summary,
                options: question.options,
                visual: question.visual,
                correctAnswers: question.correctAnswers,
                duration: question.duration,
                points: question.points,
                id: question.id
            });
        };
        retrieveQuestion();
    }, [questionId]);

    return (
        <div className="container py-5">
            <h3>Click to Modify Game Questions</h3>

            <div className="card-body">

                {/* Dropdown for changing type */}
                <div className="dropdown mb-3">
                    <button
                        className="btn btn-secondary dropdown-toggle"
                        type="button"
                        data-bs-toggle="dropdown"
                        aria-expanded="false"
                    >
                        Modify Question Type
                    </button>
                    
                    {/* Handle switch for quest type */}
                    <ul className="dropdown-menu">
                        {availableOptions.map((option) => (
                            <li key={option.value}>
                                <button
                                    className="dropdown-item"
                                    onClick={() => handleTypeChange(option.value)}
                                >
                                    {option.label}
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>

                <form>
                    <ObjectInput
                        label="Update Question Text"
                        type="text"
                        objKey="text"
                        currState={currQuestion}
                        setState={setCurrQuestion}
                        placeholder="Enter a new question text"
                    />

                    <ObjectInput
                        label="Update Description Text"
                        type="text"
                        objKey="summary"
                        currState={currQuestion}
                        setState={setCurrQuestion}
                        placeholder="Enter a new description"
                    />

                    <h5>Update Media</h5>

                    <div className="mb-3">
                        <i>You may choose to update your visual to a new image or new video!</i>
                    </div>


                    <MediaTypeToggle
                        modeState={mediaInputMode}
                        setModeState={setMediaInputMode}
                    />

                    {/* Render file upload OR video url DEPENDING on MediaTypeToggle selection */}
                    <MediaInput
                        mediaInputMode={mediaInputMode}
                        currState={currQuestion}
                        setState={setCurrQuestion}
                    />

                    <MediaPreview
                        currState={currQuestion}
                    />

                    {/* Conditional input based on type */}
                    {currQuestion.type === 'Judgement' && (
                        <JudgementAnswerInput
                            correctAnswers={currQuestion.correctAnswers}
                            setCorrectAnswers={(value) =>
                                setCurrQuestion(prev => ({
                                    ...prev,
                                    correctAnswers: value
                                }))
                            }
                        />
                    )}

                    {/* Load choice answer input components */}
                    {(currQuestion.type === 'Multi-Choice' || currQuestion.type === 'Single-Choice') && (
                        <ChoiceAnswerInput
                            choiceType={currQuestion.type}
                            options={currQuestion.options}
                            correctAnswers={currQuestion.correctAnswers}
                            setCorrectAnswers={setCorrectAnswersAndOptions}
                        />
                    )}

                    <ObjectInput
                        label="Update Time Limit"
                        type="number"
                        objKey="duration"
                        currState={currQuestion}
                        setState={setCurrQuestion}
                        placeholder="Enter a new time limit"
                    />

                    <ObjectInput
                        label="Update Points"
                        type="number"
                        objKey="points"
                        currState={currQuestion}
                        setState={setCurrQuestion}
                        placeholder="Enter a point number"
                    />

                    <Button
                        variant="primary"
                        text="Update Question"
                        onClick={handleUpdateQuestion}
                    />
                </form>
            </div>
        </div>
    );
};
