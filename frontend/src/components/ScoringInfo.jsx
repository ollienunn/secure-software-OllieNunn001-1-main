
// Cording info card to be called inside session results
export const ScoringInfo = () => {
    return (
        <div className="card mt-2">
            <div className="card-header bg-info text-black">
                <h5 className="mb-0">How Scoring Works</h5>
            </div>
            <div className="card-body">
                <p className="mb-2 text-success">
                    <span className="fw-bold">Correct Answers: </span> 
                    You only get points for correct answers.
                </p>

                <p className="mb-2 fw-bold">Faster = More Points:</p>
                <ul>
                    <li>If you answer within the 
                        <span className="fw-bold"> first 30% </span> 
                        of the allowed time, you earn 
                        <span className="fw-bold"> maximum points</span>.</li>
                    <li>After that, your score received decreases the longer you take.</li>
                </ul>
                <p className="mb-2 text-danger">
                    <span className="fw-bold">Incorrect Answers: </span> 
                    These always give
                    <span className="fw-bold"> zero points</span>.
                </p>
            </div>
        </div>
    )
}
