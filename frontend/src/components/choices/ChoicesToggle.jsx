import 'bootstrap/dist/js/bootstrap.bundle.min.js'; 
import 'bootstrap/dist/css/bootstrap.min.css';

// Toggle component to select question type
const ChoicesToggle = ( {setQuestionType, questionType} ) => {
    return (
        <div className="mb-3">
            <label htmlFor="question-type-select" className="form-label">
                <b> Question Type </b>
            </label>
            <div className="col-lg-7">
                <select 
                    className="form-select" 
                    id="question-type-select" value={questionType}
                    onChange={(event) => setQuestionType(event.target.value)}
                    // set type on change to set the view below
                >
                    <option value="Judgement">Judgement Question</option>
                    <option value="Multi-Choice">Multi-Answer Choice Question</option>
                    <option value="Single-Choice">Single-Answer Choice Question</option>
                </select>
            </div>
        </div>
    )
}

export default ChoicesToggle