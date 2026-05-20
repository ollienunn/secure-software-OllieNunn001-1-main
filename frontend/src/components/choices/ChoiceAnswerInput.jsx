import { useState, useEffect } from 'react';
import { Button } from '../buttons/Button';
import useAlert from '../../hooks/useAlert';

import 'bootstrap/dist/css/bootstrap.min.css';

const ChoiceAnswerInput = ({ choiceType, setCorrectAnswers, options: initialOptions = [], correctAnswers = [] }) => {
    const [options, setOptions] = useState([{ text: "", correct: false }]);
    const { setAlertMessage, setAlertType } = useAlert();

    // Initialise options based on the choice type
    useEffect(() => {
        if (
            (choiceType === "Single-Choice" || choiceType === "Multi-Choice") &&
            initialOptions.length > 0
        ) {
            const restored = initialOptions.map(text => ({
                text,
                correct: correctAnswers.includes(text),
            }));
            setOptions(restored);
        }
    }, [choiceType, initialOptions, correctAnswers]);

    // Sync correct answers with options
    const syncAnswersAndOptions = (updatedOptions) => {
        const newCorrectAnswers = updatedOptions
            .filter(option => option.correct)
            .map(option => option.text);
        setCorrectAnswers(newCorrectAnswers, updatedOptions);
    };

    // create empty card
    const addAnswer = () => {
        const updated = [...options, { text: "", correct: false }];
        setOptions(updated);
        syncAnswersAndOptions(updated);
    };

    // update the text of an answer
    const updateOption = (index, value) => {
        const updated = [...options];
        updated[index].text = value;
        setOptions(updated);
        syncAnswersAndOptions(updated);
    };

    // toggle if option is an answer
    const toggleAnswer = (index) => {
        const updated = [...options];

        const currentlyCorrect = updated.filter(opt => opt.correct).length;
        if (choiceType === "Single-Choice") {

            // if turned on as correct and curr correct answers >= 1
            if (!updated[index].correct && currentlyCorrect >= 1) {
                setAlertMessage("Only one option can be marked correct in this mode!");
                setAlertType("ERROR")
                return;
            }
        }

        updated[index].correct = !updated[index].correct;
        setOptions(updated);
        syncAnswersAndOptions(updated);
    };

    // delete an answer
    const deleteOption = (index) => {
        const updated = options.filter((option, i) => i !== index);
        setOptions(updated);
        syncAnswersAndOptions(updated);
    };

    return (
        <div className="card p-3 mb-3">
            <h5 className="card-title mb-3">Multiple Choice Options</h5>

            <div className="d-flex flex-wrap gap-3 mb-3">
                {options.map((answer, index) => (
                    <div key={index} className="card w-25">

                        <button
                            type="button"
                            className="btn-close position-absolute top-0 end-0 m-2"
                            aria-label="Close"
                            onClick={() => deleteOption(index)}
                        ></button>

                        {/* Render each option as a card */ }
                        <div className="card-body mt-4 mb">
                            <div className="form-check">
                                <input
                                    type="checkbox"
                                    className="form-check-input"
                                    id={`correct-check-${index}`}
                                    checked={answer.correct}
                                    onChange={() => toggleAnswer(index)}
                                />
                                <label className="form-check-label mb-2" htmlFor={`correct-check-${index}`}>
                                    Mark as Correct Answer
                                </label>
                            </div>

                            <input
                                type="text"
                                className="form-control mb-2"
                                placeholder="Enter Option"
                                value={answer.text}
                                onChange={(e) => updateOption(index, e.target.value)}
                            />
                        </div>
                    </div>
                ))}
            </div>
            
            {/* Add a note to inform the user about the button below */}
            <div className="alert alert-secondary col-lg-7" role="alert">
                <b>Note: </b>Us e the button below to add additional choice options to question.
            </div>
            
            {/* Button to add a new answer */}
            <div className="text-start">
                <Button variant="outline-primary" text="+ Add Option" onClick={addAnswer} />
            </div>
        </div>
    );
};

export default ChoiceAnswerInput;
