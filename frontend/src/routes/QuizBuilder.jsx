import { useState } from "react";
import { Button } from "../components/buttons/Button.jsx";
import Input from "../components/inputs/Input.jsx";
import useAlert from "../hooks/useAlert.jsx";
import { generateId } from "../utils/helpers.js";
import { gameInputValidation } from "../services/game.js";
import "../styles/QuizBuilder.css";

export const QuizBuilder = () => {
    const [quizName, setQuizName] = useState("");
    const [questions, setQuestions] = useState([]);
    const [currentQuestion, setCurrentQuestion] = useState({
        id: "",
        text: "",
        type: "Single-Choice",
        summary: "",
        visual: "",
        options: [],
        correctAnswers: [],
        duration: 60,
        points: 10
    });
    const [currentOption, setCurrentOption] = useState("");
    const { setAlertMessage, setAlertType } = useAlert();

    const questionTypes = [
        { type: "Single-Choice", icon: "1️⃣", color: "single" },
        { type: "Multi-Choice", icon: "✅", color: "multi" },
        { type: "Judgement", icon: "💭", color: "judgement" }
    ];

    const handleAddOption = () => {
        if (currentOption.trim() === "") {
            setAlertMessage("Option cannot be empty!");
            setAlertType("ERROR");
            return;
        }
        setCurrentQuestion({
            ...currentQuestion,
            options: [...currentQuestion.options, currentOption]
        });
        setCurrentOption("");
    };

    const handleRemoveOption = (index) => {
        const newOptions = currentQuestion.options.filter((_, i) => i !== index);
        const newCorrectAnswers = currentQuestion.correctAnswers.filter(
            answer => newOptions.includes(answer)
        );
        setCurrentQuestion({
            ...currentQuestion,
            options: newOptions,
            correctAnswers: newCorrectAnswers
        });
    };

    const handleToggleCorrectAnswer = (option) => {
        if (currentQuestion.type === "Single-Choice") {
            setCurrentQuestion({
                ...currentQuestion,
                correctAnswers: [option]
            });
        } else if (currentQuestion.type === "Multi-Choice") {
            const isSelected = currentQuestion.correctAnswers.includes(option);
            if (isSelected) {
                setCurrentQuestion({
                    ...currentQuestion,
                    correctAnswers: currentQuestion.correctAnswers.filter(a => a !== option)
                });
            } else {
                setCurrentQuestion({
                    ...currentQuestion,
                    correctAnswers: [...currentQuestion.correctAnswers, option]
                });
            }
        }
    };

    const handleAddQuestion = () => {
        try {
            const questionToAdd = {
                ...currentQuestion,
                id: currentQuestion.id || generateId(questions.map(q => q.id))
            };
            
            gameInputValidation(questionToAdd);
            
            setQuestions([...questions, questionToAdd]);
            setCurrentQuestion({
                id: "",
                text: "",
                type: "Single-Choice",
                summary: "",
                visual: "",
                options: [],
                correctAnswers: [],
                duration: 60,
                points: 10
            });
            setAlertMessage("Question added successfully! 🎉");
            setAlertType("SUCCESS");
        } catch (error) {
            setAlertMessage(error.message);
            setAlertType("ERROR");
        }
    };

    const handleRemoveQuestion = (index) => {
        setQuestions(questions.filter((_, i) => i !== index));
        setAlertMessage("Question removed!");
        setAlertType("SUCCESS");
    };

    const handleEditQuestion = (index) => {
        setCurrentQuestion(questions[index]);
        handleRemoveQuestion(index);
    };

    const handleExportQuiz = () => {
        if (quizName.trim() === "") {
            setAlertMessage("Quiz name cannot be empty!");
            setAlertType("ERROR");
            return;
        }
        
        if (questions.length === 0) {
            setAlertMessage("Quiz must have at least one question!");
            setAlertType("ERROR");
            return;
        }

        const quizData = {
            name: quizName,
            questions: questions
        };

        const dataStr = JSON.stringify(quizData, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
        
        const exportFileDefaultName = `${quizName.replace(/\s+/g, '_')}_quiz.json`;
        
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
        
        setAlertMessage("Quiz exported successfully! 🚀");
        setAlertType("SUCCESS");
    };

    const handleClearAll = () => {
        setQuizName("");
        setQuestions([]);
        setCurrentQuestion({
            id: "",
            text: "",
            type: "Single-Choice",
            summary: "",
            visual: "",
            options: [],
            correctAnswers: [],
            duration: 60,
            points: 10
        });
        setCurrentOption("");
        setAlertMessage("All data cleared!");
        setAlertType("INFO");
    };

    const handleDownloadTemplate = async () => {
        try {
            const response = await fetch('http://localhost:8000/quiz/template');
            const template = await response.json();
            
            const dataStr = JSON.stringify(template, null, 2);
            const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
            
            const linkElement = document.createElement('a');
            linkElement.setAttribute('href', dataUri);
            linkElement.setAttribute('download', 'quiz_template.json');
            linkElement.click();
            
            setAlertMessage("Template downloaded successfully! 📥");
            setAlertType("SUCCESS");
        } catch (error) {
            setAlertMessage("Failed to download template: " + error.message);
            setAlertType("ERROR");
        }
    };

    const handleImportQuiz = (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const quiz = JSON.parse(e.target.result);
                    if (quiz.name) setQuizName(quiz.name);
                    if (quiz.questions && Array.isArray(quiz.questions)) {
                        setQuestions(quiz.questions);
                        setAlertMessage("Quiz imported successfully! 📤");
                        setAlertType("SUCCESS");
                    } else {
                        throw new Error("Invalid quiz format");
                    }
                } catch (error) {
                    setAlertMessage("Failed to import quiz: " + error.message);
                    setAlertType("ERROR");
                }
            };
            reader.readAsText(file);
        }
    };

    const getTotalDuration = () => {
        return questions.reduce((total, q) => total + (q.duration || 0), 0);
    };

    const getTotalPoints = () => {
        return questions.reduce((total, q) => total + (q.points || 0), 0);
    };

    return (
        <div className="quiz-builder-container">
            <div className="container">
                <div className="quiz-header">
                    <h1>🎮 Quiz Builder</h1>
                    <p className="lead">Create engaging quizzes for your students!</p>
                </div>
                
                <div className="instructions-card">
                    <h5>📚 Quick Guide</h5>
                    <div className="row">
                        <div className="col-md-6">
                            <ol>
                                <li>Give your quiz an awesome name</li>
                                <li>Choose a question type</li>
                                <li>Write your question and add options</li>
                            </ol>
                        </div>
                        <div className="col-md-6">
                            <ol start="4">
                                <li>Mark the correct answer(s)</li>
                                <li>Set time limit and points</li>
                                <li>Export and share your quiz!</li>
                            </ol>
                        </div>
                    </div>
                </div>
                
                <div className="quiz-input-card">
                    <h3 className="mb-4" style={{color: '#46178f', fontWeight: '900'}}>
                        📝 Quiz Details
                    </h3>
                    <label className="quiz-label">Quiz Name</label>
                    <input
                        className="quiz-input"
                        type="text"
                        value={quizName}
                        onChange={(e) => setQuizName(e.target.value)}
                        placeholder="Enter an exciting quiz name..."
                    />
                </div>

                <div className="quiz-input-card">
                    <h3 className="mb-4" style={{color: '#46178f', fontWeight: '900'}}>
                        ➕ Add Question
                    </h3>
                    
                    <div className="mb-4">
                        <label className="quiz-label">Select Question Type</label>
                        <div className="question-type-selector">
                            {questionTypes.map(({ type, icon, color }) => (
                                <div
                                    key={type}
                                    className={`question-type-card ${color} ${currentQuestion.type === type ? 'selected' : ''}`}
                                    onClick={() => setCurrentQuestion({
                                        ...currentQuestion,
                                        type: type,
                                        options: type === "Judgement" ? [] : currentQuestion.options,
                                        correctAnswers: []
                                    })}
                                >
                                    <div className="question-type-icon">{icon}</div>
                                    <h5>{type}</h5>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="mb-3">
                        <label className="quiz-label">Question Text</label>
                        <input
                            className="quiz-input"
                            type="text"
                            value={currentQuestion.text}
                            onChange={(e) => setCurrentQuestion({...currentQuestion, text: e.target.value})}
                            placeholder="What do you want to ask?"
                        />
                    </div>

                    <div className="mb-3">
                        <label className="quiz-label">Question Description</label>
                        <input
                            className="quiz-input"
                            type="text"
                            value={currentQuestion.summary}
                            onChange={(e) => setCurrentQuestion({...currentQuestion, summary: e.target.value})}
                            placeholder="Add a helpful description..."
                        />
                    </div>

                    <div className="row mb-4">
                        <div className="col-md-6">
                            <label className="quiz-label">⏱️ Time Limit (seconds)</label>
                            <input
                                className="quiz-input"
                                type="number"
                                value={currentQuestion.duration}
                                onChange={(e) => setCurrentQuestion({
                                    ...currentQuestion, 
                                    duration: parseInt(e.target.value) || 0
                                })}
                                min="1"
                            />
                        </div>
                        <div className="col-md-6">
                            <label className="quiz-label">🏆 Points</label>
                            <input
                                className="quiz-input"
                                type="number"
                                value={currentQuestion.points}
                                onChange={(e) => setCurrentQuestion({
                                    ...currentQuestion, 
                                    points: parseInt(e.target.value) || 0
                                })}
                                min="1"
                            />
                        </div>
                    </div>

                    {currentQuestion.type === "Judgement" ? (
                        <div className="mb-4">
                            <label className="quiz-label">✅ Correct Answer</label>
                            <input
                                className="quiz-input"
                                type="text"
                                value={currentQuestion.correctAnswers[0] || ""}
                                onChange={(e) => setCurrentQuestion({
                                    ...currentQuestion,
                                    correctAnswers: [e.target.value]
                                })}
                                placeholder="Enter the correct answer"
                            />
                        </div>
                    ) : (
                        <>
                            <div className="mb-4">
                                <label className="quiz-label">Answer Options</label>
                                <div className="option-input-group">
                                    <input
                                        className="quiz-input"
                                        type="text"
                                        value={currentOption}
                                        onChange={(e) => setCurrentOption(e.target.value)}
                                        placeholder="Type an answer option..."
                                        onKeyPress={(e) => {
                                            if (e.key === 'Enter') {
                                                e.preventDefault();
                                                handleAddOption();
                                            }
                                        }}
                                    />
                                    <button
                                        className="add-option-btn"
                                        onClick={handleAddOption}
                                    >
                                        Add Option
                                    </button>
                                </div>
                            </div>

                            {currentQuestion.options.length > 0 && (
                                <div className="mb-4">
                                    <label className="quiz-label">
                                        {currentQuestion.type === "Single-Choice" 
                                            ? "🎯 Select the Correct Answer" 
                                            : "🎯 Select All Correct Answers"}
                                    </label>
                                    <div className="option-list">
                                        {currentQuestion.options.map((option, index) => (
                                            <div 
                                                key={index} 
                                                className={`option-item ${currentQuestion.correctAnswers.includes(option) ? 'correct' : ''}`}
                                            >
                                                <div className="d-flex align-items-center gap-2">
                                                    <input
                                                        className="option-checkbox"
                                                        type={currentQuestion.type === "Single-Choice" ? "radio" : "checkbox"}
                                                        name="correctAnswers"
                                                        checked={currentQuestion.correctAnswers.includes(option)}
                                                        onChange={() => handleToggleCorrectAnswer(option)}
                                                    />
                                                    <span style={{fontWeight: '600'}}>{option}</span>
                                                </div>
                                                <button
                                                    className="remove-option-btn"
                                                    onClick={() => handleRemoveOption(index)}
                                                >
                                                    Remove
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </>
                    )}

                    <button
                        className="quiz-btn quiz-btn-primary"
                        onClick={handleAddQuestion}
                    >
                        Add Question to Quiz
                    </button>
                </div>

                {questions.length > 0 && (
                    <div className="quiz-input-card">
                        <div className="d-flex justify-content-between align-items-center mb-4">
                            <h3 style={{color: '#46178f', fontWeight: '900'}}>
                                📋 Your Questions ({questions.length})
                            </h3>
                            <div className="stats-row">
                                <div className="stat-item">
                                    <span className="stat-icon">⏱️</span>
                                    <span className="stat-value">{getTotalDuration()}s total</span>
                                </div>
                                <div className="stat-item">
                                    <span className="stat-icon">🏆</span>
                                    <span className="stat-value">{getTotalPoints()} points</span>
                                </div>
                            </div>
                        </div>
                        
                        {questions.map((question, index) => (
                            <div key={index} className="question-preview-card">
                                <div className="d-flex justify-content-between align-items-start">
                                    <div className="d-flex align-items-start flex-grow-1">
                                        <div className="question-number">{index + 1}</div>
                                        <div className="flex-grow-1">
                                            <h5 style={{fontWeight: '700', color: '#46178f'}}>
                                                {question.text}
                                            </h5>
                                            <div className="mb-2">
                                                <span className="badge bg-info me-2">{question.type}</span>
                                                <span className="badge bg-warning me-2">⏱️ {question.duration}s</span>
                                                <span className="badge bg-success">🏆 {question.points} pts</span>
                                            </div>
                                            {question.type !== "Judgement" && (
                                                <p className="mb-1">
                                                    <strong>Options:</strong> {question.options.join(" | ")}
                                                </p>
                                            )}
                                            <p className="mb-0">
                                                <strong>✅ Correct:</strong> {question.correctAnswers.join(" | ")}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="d-flex gap-2">
                                        <button
                                            className="btn btn-warning"
                                            onClick={() => handleEditQuestion(index)}
                                        >
                                            Edit
                                        </button>
                                        <button
                                            className="btn btn-danger"
                                            onClick={() => handleRemoveQuestion(index)}
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                <div className="action-buttons">
                    <button
                        className="quiz-btn quiz-btn-success"
                        onClick={handleExportQuiz}
                        disabled={questions.length === 0}
                    >
                        🚀 Export Quiz
                    </button>
                    <button
                        className="quiz-btn quiz-btn-info"
                        onClick={handleDownloadTemplate}
                    >
                        📥 Download Template
                    </button>
                    <label className="quiz-btn quiz-btn-warning" style={{margin: 0}}>
                        📤 Import Quiz
                        <input
                            type="file"
                            accept=".json"
                            onChange={handleImportQuiz}
                            style={{ display: 'none' }}
                        />
                    </label>
                    <button
                        className="quiz-btn quiz-btn-danger"
                        onClick={handleClearAll}
                    >
                        🗑️ Clear All
                    </button>
                </div>
            </div>
        </div>
    );
};