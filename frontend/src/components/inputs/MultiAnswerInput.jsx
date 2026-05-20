import { useState, useEffect } from 'react';

const MultiAnswerInput = ({ choiceType, options = [], onAnswer }) => {
    const [selectedAnswers, setSelectedAnswers] = useState([]);

    // Reset selected answers when options change
    useEffect(() => {
        if (options.length > 0) {
            setSelectedAnswers([]);
        }
    }, [options]);

    // Handle answer selection
    const toggleAnswer = (text) => {
        let updated;
        if (choiceType === "Single-Choice") {
            updated = [text];
        } else {
            updated = selectedAnswers.includes(text)
                ? selectedAnswers.filter(a => a !== text)
                : [...selectedAnswers, text];
        }
        setSelectedAnswers(updated);
        onAnswer(updated);
    };

    // Render the answer options
    return (
        <div className="card w-100 p-3 mb-3">
            <h5 className="card-title mb-3">Choose your answer:</h5>
            <div className="d-flex flex-wrap gap-3 mb-3">
                
                {/* Render each option as a card */}
                {options.map((text, index) => (
                    <div
                        key={index}
                        className={`card ${selectedAnswers.includes(text) ? 'border-primary' : ''}`}
                        role="button"
                        onClick={() => toggleAnswer(text)}
                    >
                        <div className="card-body">
                            <p className="mb-0">{text}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default MultiAnswerInput