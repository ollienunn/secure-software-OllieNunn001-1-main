// play.js

import { requestBackend } from './api';

/**
 * Wrapper func - server request to add player to the game session.
 * @param {String} sessionId 
 * @param {String} playerUserName 
 * @returns {Promise<Object>}  
 */
export const addPlayer = async (sessionId, playerUserName) => {
    const body = { name: playerUserName };

    const response = await requestBackend("POST", `play/join/${sessionId}`, null, body, null);
    if (response.error) {
        throw new Error(response.error);
    }
    localStorage.setItem("playerId", response.playerId);
    localStorage.setItem("playerName", playerUserName);

    return response
}

/**
 * Wrapper func - server request to check if session has started.
 * @returns {Promise<Object>} - obj with started key 
 */
export const getPlayerSessionStatus = async () => {
    const playerId = localStorage.getItem("playerId");

    const response = await requestBackend("GET", `play/${playerId}/status`, null, null, null);
    if (response.error) {
        throw new Error(response.error);
    }

    return response;
}

/**
 * Wrapper func - server request to get the current question for the session without the answers.
 * @returns {Promise<Object>} - obj with question without correct answers
 */
export const getSessionCurrentQuestion = async () => {
    const playerId = localStorage.getItem("playerId");
    const response = await requestBackend("GET", `play/${playerId}/question`, null, null, null);
    if (response.error) {
        throw new Error(response.error);
    }

    return response;
}

/**
 * Wrapper func - server request to submit an answer for the current question.
 * @returns {Promise<Object>} - empty object
 */
export const postSessionCurrentQuestionAnswer = async (body) => {
    const playerId = localStorage.getItem("playerId");
    const response = await requestBackend("PUT", `play/${playerId}/answer`, null, body, null);
    if (response.error) {
        throw new Error(response.error);
    }
}

/**
 * Wrapper func - server request to get the current questions' correct answers.
 * @returns {Promise<Object>} - array with correct answers
 */
export const getSessionCurrentQuestionCorrectAnswers = async () => {
    const playerId = localStorage.getItem("playerId");
    const response = await requestBackend("GET", `play/${playerId}/answer`, null, null, null);
    if (response.error) {
        throw new Error(response.error);
    }

    return response;
}

/**
 * Wrapper func - server request to get the players' session results.
 * @returns {Promise<Object>} - array with results for that player
 */
export const getSessionResults = async () => {
    const playerId = localStorage.getItem("playerId");
    const response = await requestBackend("GET", `play/${playerId}/results`, null, null, null);
    if (response.error) {
        throw new Error(response.error);
    }

    return response;
}