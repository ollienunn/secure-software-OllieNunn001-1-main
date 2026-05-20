
// custom component to review answers
const AnswerReviewCard = ({ correctAnswers = [], givenAnswers = [] }) => {
    // Check if correctAnswers and givenAnswers are arrays
    const isCorrect = (answer) =>
        correctAnswers.includes(answer) && givenAnswers.includes(answer);
    const isOnlyCorrect = (answer) =>
        correctAnswers.includes(answer) && !givenAnswers.includes(answer);
    const isOnlyGiven = (answer) =>
        givenAnswers.includes(answer) && !correctAnswers.includes(answer);

    // Remove duplicates and null values from both arrays
    const allAnswers = Array.from(new Set([...correctAnswers, ...givenAnswers])).filter(ans => ans !== null);
    return (
        <div>
            <h5 className="card-title">Answer Review</h5>
            <div className="d-flex flex-wrap gap-3">
                {allAnswers.map((answer, i) => {
                    let variant = "border-secondary";
                    let icon = "bi-question-circle";

                    // Determine the icon and variant based on the answer status
                    if (isCorrect(answer)) {
                        variant = "border-success text-success";
                        icon = "bi-check-circle-fill";
                    } else if (isOnlyCorrect(answer)) {
                        variant = "border-primary text-primary";
                        icon = "bi-check-circle";
                    } else if (isOnlyGiven(answer)) {
                        variant = "border-danger text-danger";
                        icon = "bi-x-circle";
                    }
                    // Add a class to the card based on the variant
                    return (
                        <div key={i} className={`card ${variant} border-2`}>
                            <div className="card-body d-flex align-items-center">
                                <i className={`bi ${icon} me-2 fs-4`}></i>
                                <span>{answer}</span>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default AnswerReviewCard;