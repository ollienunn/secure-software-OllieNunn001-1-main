// PlayerBoxes.jsx

// Boxes to hold player names
export const PlayerBoxes = ({ players }) => {
    return (
        <div className="d-flex flex-row flex-wrap justify-content-center gap-3 p-3">
            {players?.map((player, index) => (
                <div className="card text-center shadow-sm p-2 p-md-3" key={index}>
                    <div className="card-body py-2 py-md-3">
                        <h6 className="card-title mb-0 fs-6 fs-md-5">{player}</h6>
                    </div>
                </div>
            ))}
        </div>
    )
}
