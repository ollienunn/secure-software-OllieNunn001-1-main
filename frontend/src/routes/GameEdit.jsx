// import { useState, useEffect } from 'react';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import 'bootstrap/dist/css/bootstrap.min.css';

import { useNavigate, useParams } from 'react-router-dom';
import { useEffect, useState, useRef } from 'react';
import { Button } from '../components/buttons/Button';
import ObjectInput from '../components/inputs/ObjectInput';
import ChoicesToggle from '../components/choices/ChoicesToggle';
import JudgementAnswerInput from '../components/choices/JudgementAnswerInput';
import ChoiceAnswerInput from '../components/choices/ChoiceAnswerInput';
import useAlert from '../hooks/useAlert';
import { getAllGames, handleQuestionUpdate } from '../services/game';
import CallOut from '../components/CallOut';
import { v4 as uuidv4 } from 'uuid';
import { MediaTypeToggle } from '../components/media/MediaTypeToggle';
import MediaInput from '../components/inputs/MediaInput';
import QuestionOffCanvas from '../components/offcanvas/QuestionOffCanvas';

export const GameEdit = () => {
    const { gameId } = useParams();
    const [questionType, setQuestionType] = useState("Judgement");
    const [questionArr, setQuestionArr] = useState([]);

    const [selectedIndex, setSelectedIndex] = useState(null);
    const [currGameName, setCurrGameName] = useState("");
    const [deleteQuestion, setDeleteQuestion] = useState([]);
    const [questionId, setQuestionId] = useState("");
    const [mediaInputMode, setMediaInputMode] = useState('upload');

    const { setAlertMessage, setAlertType } = useAlert()
    const fileInputRef = useRef(null);

    const navigate = useNavigate();

    // Create a new question object with default values
    const [newQuestion, setNewQuestion] = useState({
        text: "",
        type: questionType,
        summary: "",
        visual: "",
        options: [],
        correctAnswers: [],
        duration: 0,
        points: 0,
        id: uuidv4(),
    });

    // Function to set the correct answers and options
    const setCorrectAnswersAndOptions = (newCorrectAnswers, options) => {
        setNewQuestion({
            ...newQuestion,
            correctAnswers: newCorrectAnswers,
            options: options.map(opt => opt.text.trim()),
        });
    };

    // Function to set the correct answers for Judgement questions
    const setCorrectAnswers = (newCorrectAnswers) => {
        setNewQuestion({ ...newQuestion, correctAnswers: newCorrectAnswers });
    };

    // Function to handle question updates (create, update, delete)
    const handleQuestionUpdateWrapper = async (requestType) => {
        const questionReqObj = {
            gameId,
            questionArr,
            questionObj: requestType === "delete" ? deleteQuestion : { ...newQuestion, type: questionType },
            setQuestionArr,
        };
        
        // Validate the question object before sending it to the backend
        try {
            await handleQuestionUpdate(requestType, questionReqObj, setAlertMessage, setAlertType);
            setNewQuestion({
                text: "",
                type: questionType,
                summary: "",
                visual: "",
                options: [],
                correctAnswers: [],
                duration: 0,
                points: 0,
                id: uuidv4(),
            })
            
            // manually reset the file input if it exists
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }

        } catch (error) {
            setAlertMessage(error.message)
            setAlertType("ERROR")
        }
    };

    // Load all questions for this game once on mount
    useEffect(() => {
        const retrieveGames = async () => {
            const response = await getAllGames();
            const questions = response.games.find(game => game.id.toString() === gameId)?.questions || [];
            setQuestionArr(questions);
        };
        retrieveGames();
    }, [gameId]);

    return (
        <div className="container py-5">
            <h3>Click to Modify Game Questions</h3>
            <p>Each row represents a clickable question for you to edit or delete!</p>

            {/* Render the list of questions */}
            <div className="list-group">
                {questionArr.map((q, index) => (
                    <button
                        key={index}
                        className={`list-group-item list-group-item-action ${selectedIndex === index ? "active" : ""}`}
                        aria-current={selectedIndex === index ? "true" : undefined}
                        onClick={(e) => {
                            e.preventDefault();
                            setCurrGameName(q.text);
                            setSelectedIndex(index);
                            setDeleteQuestion(q);
                            setQuestionId(q.id);
                        }}
                        data-bs-toggle="offcanvas"
                        data-bs-target="#game-canvas"
                    >
                        <div className="d-flex w-100">
                            <h5 className="mb-1">
                                {`Question ${index + 1}: ${q.text}`}
                            </h5>
                        </div>
                        <p className="mb-1">Summary: {q.summary || "No description"}</p>
                        <p>Question Type: {q.type}</p>
                        <small>Click to edit</small>
                    </button>
                ))}
            </div>

            <QuestionOffCanvas
                gameId={gameId}
                questionId={questionId}
                currGameName={currGameName}
                navigate={navigate}
                handleDelete={() => handleQuestionUpdateWrapper("delete")}
            />
            <hr />
            
            {/* Dropdown for creating new question */}
            <div className="mb-3">
                <button
                    className="btn btn-success"
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target="#add-question-dropdown"
                >
                    <b> Create New Question</b>
                </button>
            </div>

            <div className="collapse" id="add-question-dropdown">
                <div className="card card-body">
                    <div className="card-body">
                        <div className="w-100 w-md-75 w-lg-50 mx-auto">
                            <h4 className="card-title mb-3">New Question</h4>

                            {/* Callout for creating a question */}
                            <CallOut type="alert-info">
                                <h5 className="alert-heading">How to Create a Question</h5>
                                <p className="mb-2">You have the option to select the following types:</p>
                                <ul className="mb-0">
                                    <li><strong>Multi-Choice</strong>: More than <em>one</em> correct answer</li>
                                    <li><strong>Single-Choice</strong>: Only <em>one</em> correct answer</li>
                                    <li><strong>Judgement</strong>: Case-insensitive answer based on text input</li>
                                </ul>
                                <p className="mt-1 mb-1">
                                    You may also choose to optionally include a image / video to accompany this video.
                                </p>
                            </CallOut>

                            <form>
                                <ObjectInput
                                    label="Question Text"
                                    type="text"
                                    objKey="text"
                                    currState={newQuestion}
                                    setState={setNewQuestion}
                                    placeholder="Enter the question"
                                />

                                <MediaTypeToggle
                                    modeState={mediaInputMode}
                                    setModeState={setMediaInputMode}
                                />

                                {/* Render file upload OR video url DEPENDING on MediaTypeToggle selection */}
                                <MediaInput
                                    mediaInputMode={mediaInputMode}
                                    currState={newQuestion}
                                    setState={setNewQuestion}
                                    inputRef={fileInputRef}
                                />

                                <div className="form-text fst-italic mb-3 mt-0">
                                    You may optionally upload an image or video, or provide a media URL to associate with this question.
                                </div>

                                <ChoicesToggle setQuestionType={setQuestionType} questionType={questionType} />

                                {questionType === 'Judgement' && (
                                    <JudgementAnswerInput
                                        correctAnswers={newQuestion.correctAnswers}
                                        setCorrectAnswers={setCorrectAnswers}
                                    />
                                )}

                                {(questionType === 'Multi-Choice' || questionType === 'Single-Choice') && (
                                    <ChoiceAnswerInput
                                        choiceType={questionType}
                                        setCorrectAnswers={setCorrectAnswersAndOptions}
                                    />
                                )}

                                <ObjectInput
                                    label="Question Description"
                                    type="text"
                                    objKey="summary"
                                    currState={newQuestion}
                                    setState={setNewQuestion}
                                    placeholder="Enter a summary about the question"
                                />

                                <ObjectInput
                                    label="Points Awarded"
                                    type="number"
                                    objKey="points"
                                    currState={newQuestion}
                                    setState={setNewQuestion}
                                />

                                <ObjectInput
                                    label="Time Limit"
                                    type="number"
                                    objKey="duration"
                                    currState={newQuestion}
                                    setState={setNewQuestion}
                                />

                                {/* Creates a question - backend PUT request */}
                                <Button
                                    variant="primary"
                                    text="Create Question"
                                    onClick={() => handleQuestionUpdateWrapper("create")}
                                />
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};