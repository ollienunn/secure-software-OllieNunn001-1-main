import 'bootstrap/dist/css/bootstrap.min.css';

/// JudgementAnswerInput component for entering a single answer
const JudgementAnswerInput = ({ correctAnswers, setCorrectAnswers }) => {
    return (
        <div className="mb-3">
            <div className="mb-3 col-12 col-md-6 col-lg-7">

                <label htmlFor="judgement-solution" className="form-label">
                    <b>Judement Answer</b>
                </label>
                <input
                    placeholder="Enter answer"
                    type="text"
                    className="form-control"
                    value={(correctAnswers && correctAnswers[0]) || ""}
                    onChange={(e) => {setCorrectAnswers([e.target.value])}}
                />
            </div>
        </div>
    )
}
export default JudgementAnswerInput