import { useState, useRef } from "react";
import { Button } from "../buttons/Button.jsx";
import { putGames } from "../../services/game.js";
import { fileToDataUrl, generateId } from "../../utils/helpers.js";
import FileInput from "../inputs/FileInput.jsx";
import { gameInputValidation } from "../../services/game.js";
import useAlert from "../../hooks/useAlert.jsx";
import { returnJsonObj } from "../../utils/helpers.js";

export const CreateGameModal = ({ allGames, setAllGames }) => {
    const [show, setShow] = useState(false);
    const [name, setName] = useState("");
    const [thumbnail, setThumbnail] = useState("");
    const [jsonQuestions, setJsonQuestions] = useState([]);
    const { setAlertMessage, setAlertType } = useAlert();
    const fileInputRef = useRef(null);

    // Function to handle the modal show and hide
    const handleShow = () => setShow(true);
    const handleClose = () => {
        setName("");
        setThumbnail("");
        setJsonQuestions([]);
        setShow(false);
    };

    // Function to convert file to data URL
    const buildGameObject = async (name, questions = []) => {
        const thumbnailDataString = await fileToDataUrl(thumbnail);

        questions = questions.map((q) => {
            delete q.final
            return q
        })

        // Add a final question to the end of the array
        if (questions.length > 0) {
            questions[questions.length - 1].final = true
        }

        return {
            id: generateId(allGames),
            name,
            thumbnail: thumbnailDataString,
            owner: localStorage.getItem("owner"),
            questions,
            active: 0,
            pastSessionCreatedTimes: []
        };
    };

    // Function to handle JSON file upload
    const handleJsonObj = async (jsonFile) => {
        try {
            const gameJsonObj = await returnJsonObj(jsonFile);
            for (const q of gameJsonObj.questions) {
                try {
                    gameInputValidation(q);
                } catch (validationErr) {
                    setJsonQuestions([]);
                    if (fileInputRef.current) {
                        fileInputRef.current.value = "";
                    }
                    setAlertMessage(validationErr.message);
                    setAlertType("ERROR");
                    return;
                }
            }

            setJsonQuestions(gameJsonObj.questions);
            setAlertMessage("Questions loaded successfully from JSON.");
            setAlertType("SUCCESS");
        } catch (error) {
            setAlertMessage("JSON Upload Error: " + error.message);
            setAlertType("ERROR");
        }
    };

    //  Function to create a new game 
    const createNewGame = async (event) => {
        event.preventDefault();
        try {
            const newGame = await buildGameObject(name, jsonQuestions);
            const games = [newGame, ...allGames];
            await putGames({ games });
            setAllGames(games);
            handleClose();

            setAlertMessage("Game successfully created!");
            setAlertType("SUCCESS");
        } catch (error) {
            setAlertMessage("Create Game Error: " + error.message);
            setAlertType("ERROR");
        }
    };

    return (
        <>
            <button className="modern-btn modern-btn-primary" onClick={handleShow}>
                <i className="bi bi-plus-circle-fill"></i>
                Create Game
            </button>
            {show && (
                <div className="modal fade show d-block" tabIndex="-1" role="dialog">
                    <div className="modal-dialog" role="document">
                        <div className="modal-content">

                            <div className="modal-header">
                                <h5 className="modal-title">New Game</h5>
                                <button type="button" className="btn-close" onClick={handleClose}></button>
                            </div>

                            {/* Form to create a new game */}
                            <form onSubmit={createNewGame}>
                                <div className="modal-body">
                                    <div className="mb-3">
                                        <label htmlFor="gameName" className="form-label">Name</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            id="gameName"
                                            onChange={(e) => setName(e.target.value)}
                                            value={name}
                                            required
                                        />
                                    </div>

                                    <div className="mb-3">
                                        <label htmlFor="formFile" className="form-label">Thumbnail:</label>
                                        <input
                                            className="form-control"
                                            type="file"
                                            id="formFile"
                                            onChange={(e) => setThumbnail(e.target.files[0])}
                                            required
                                        />
                                    </div>

                                    <div className="mb-3">
                                        <FileInput
                                            type="file"
                                            label="Upload Game File"
                                            onChange={(e) => handleJsonObj(e.target.files[0])}
                                            ref={fileInputRef}
                                        />
                                    </div>
                                </div>

                                {/* Form submission buttons */}
                                <div className="modal-footer">
                                    <Button variant="secondary" onClick={handleClose} text="Cancel" />
                                    <Button variant="primary" type="submit" text="Save" />
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {show && <div className="modal-backdrop fade show"></div>}
        </>
    );
};
