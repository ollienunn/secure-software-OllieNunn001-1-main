import OffCanvas from './OffCanvas';
import { Button } from '../buttons/Button';

// extended version of OffCanvas for Question specific purposes
const QuestionOffCanvas = ({ gameId, questionId, currGameName, navigate, handleDelete }) => {
    return (
        <OffCanvas
            id="game-canvas"
            title="Update Question:"
            subtitle={currGameName}
        >
            <p>Click buttons to either update the question or delete it.</p>
            
            <Button
                variant="outline-success w-100"
                text="Update Question"
                onClick={() => navigate(`/game/${gameId}/question/${questionId}`)}
                data-bs-dismiss="offcanvas"
                aria-label="Close"
            />
            <Button
                variant="outline-danger w-100 mt-2"
                text="Delete Question"
                onClick={handleDelete}
                data-bs-dismiss="offcanvas"
                aria-label="Close"
            />
        </OffCanvas>
    );
};

export default QuestionOffCanvas;
