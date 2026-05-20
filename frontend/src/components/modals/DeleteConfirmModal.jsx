import { useState } from "react";
import { putGames } from "../../services/game";

export const DeleteConfirmModal = ({ children, array, setArray, id, name = "" }) => {
    const [showModal, setShowModal] = useState(false);

    // Function to handle the deletion of a game
    const handleDelete = async () => {
        let arr = array.filter(val => val.id !== id)
        try {
            await putGames({ "games": arr })
            setArray(arr)
        } catch (error) {
            console.log(error)
        }
        setShowModal(false);
    };

    return (
        <>
            {/* Button to trigger the modal */}
            <button className="btn p-0" onClick={() => setShowModal(true)}>
                {children}
            </button>

            {/* Modal for confirmation */}
            {showModal && (
                <>
                    <div className="modal-backdrop fade show"></div>
                    <div className="modal fade show d-block" tabIndex="-1">
                        <div className="modal-dialog modal-dialog-centered">
                            <div className="modal-content">
                                <div className="modal-header">
                                    <h5 className="modal-title">Confirm Delete: {name}</h5>
                                    <button
                                        type="button"
                                        className="btn-close"
                                        onClick={() => setShowModal(false)}
                                        aria-label="Close"
                                    ></button>
                                </div>
                                <div className="modal-body">
                                    Are you sure you want to delete this?
                                </div>

                                {/* Footer with action buttons */}
                                <div className="modal-footer">
                                    <button
                                        className="btn btn-secondary"
                                        onClick={() => setShowModal(false)}
                                    >
                                        Cancel
                                    </button>
                                    <button className="btn btn-danger" onClick={handleDelete}>
                                        Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </>
    );
};
