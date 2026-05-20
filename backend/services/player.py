from datetime import datetime, timezone
from database.data import load_game_sessions, save_game_sessions
from core.player_core import (
    retrieve_active_session,
    new_player_payload,
    retrieve_game_session_from_playerid,
)
from core.game_helpers import retrieve_session_id_from_game_id
from utils.helpers import generate_id
from classes.Error import InputError

def player_add(session_id, name):
    """Service func - adds a player to a game session"""
    session, sessions = retrieve_active_session(session_id)

    if session["position"] >= 0:
        raise InputError("Session has already begun")

    players_list = list(session.get("players", {}).keys())
    player_id = generate_id(players_list)

    new_payload = new_player_payload(name, len(session["questions"]))
    session["players"][player_id] = new_payload

    save_game_sessions(sessions)

    return player_id

def player_retrieve_status(player_id):
    """Service hearbeat function - retrieves player status for specific game instance"""

    session = retrieve_game_session_from_playerid(player_id)
    if session["isoTimeLastQuestionStarted"]:
        return True
    else:
        return False

def player_get_question(player_id):
    """Service func - retireves question for specific player"""
    session = retrieve_game_session_from_playerid(player_id)
    position = session["position"]
    questions = session["questions"]

    if position == -1:
        raise InputError("The session has not started yet.")
    if position >= len(questions):
        raise InputError("The question index is out of range.")

    current_question = questions[position]

    # build a copy of the question without the "correctAnswers" key
    filtered_question = {
        key: value for key, value in current_question.items() if key != "correctAnswers"
    }

    # add metadata from game session instance
    filtered_question["isoTimeLastQuestionStarted"] = session[
        "isoTimeLastQuestionStarted"
    ]
    filtered_question["final"] = position == len(questions) - 1

    return filtered_question

def player_get_answers(player_id):
    """Service func - retrieves answer for a question based on session["position"]"""
    session = retrieve_game_session_from_playerid(player_id)

    if session["position"] == -1:
        raise InputError("Session hasn't started")
    elif not session["answerAvailable"]:
        raise InputError("Answers are not available yet")

    question = session["questions"][session["position"]]

    try:
        answers = question["correctAnswers"]
        return answers
    except KeyError as e:
        raise KeyError(
            "The key 'correctAnswers' is missing",
        ) from e

def player_submit_answers(player_id, answers):
    """Service func - Submits player answers"""
    if not answers:
        raise InputError("Answers is not provided for player to submit")
    elif len(answers) == 0:
        raise InputError("Answers array must not be empty")

    session = retrieve_game_session_from_playerid(player_id)
    sessions = load_game_sessions()

    try:
        # check session state
        if session["position"] == -1:
            raise InputError("Session hasn't started")
        if session["answerAvailable"]:
            raise InputError("Answers cannot be submitted after they become available")

        # retrieve the current question
        position = session["position"]
        current_question = session["questions"][position]

        # store the player's answer
        player = session["players"][player_id]
        player["answers"][position] = {
            "questionStartedAt": session["isoTimeLastQuestionStarted"],
            "answeredAt": datetime.now().astimezone(timezone.utc).isoformat(),
            "answers": answers,
            "correct": sorted(answers) == sorted(current_question["correctAnswers"]),
        }
        session_id = retrieve_session_id_from_game_id(session["gameId"])
        sessions[session_id] = session
        save_game_sessions(sessions)

    except KeyError as e:
        raise KeyError(f"Missing key: {e}") from e

def get_player_results(player_id):
    """Service func - returns player results for entire game instance"""
    session = retrieve_game_session_from_playerid(player_id)

    try:
        if session["active"]:
            raise InputError("Session is ongoing - cannot show results")
        elif session["position"] == -1:
            raise InputError("Session hasn't started")
        else:
            return session["players"][player_id]["answers"]

    except KeyError as e:
        raise KeyError(f"Missing key {e}") from e
