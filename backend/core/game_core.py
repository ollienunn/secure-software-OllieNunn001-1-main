from database.data import load_game_sessions, load_games, save_game_sessions
from classes.Error import InputError, AccessError
from datetime import datetime, timezone
from utils.helpers import generate_id
import threading

from core.game_helpers import retrieve_session_id_from_game_id, retrieve_game
from threading import Lock

session_lock = Lock()
session_timeouts = {}


def start_game(game_id, session_token):
    """Starts a game based on session token and gameid"""
    game_session_id = generate_id(load_game_sessions().keys())

    game_session = load_game_sessions()
    game_dict = retrieve_game(game_id, session_token)

    # create new game session instance from a predesigned game
    game_session[game_session_id] = {
        "gameId": game_id,
        "position": -1,
        "answerAvailable": False,
        "isoTimeLastQuestionStarted": None,
        "players": {},
        "questions": game_dict["questions"],
        "active": True,
        "sessionOwnerToken": session_token
    }

    save_game_sessions(game_session)
    return game_session_id


def advance_game(game_id, session_token):
    """Advances active game"""
    sessions = load_game_sessions()
    session_id = retrieve_session_id_from_game_id(game_id)
    game_session = sessions[session_id]

    if not game_session["active"]:
        raise InputError("Cannot advance game that is not active")
    
    if session_token != game_session["sessionOwnerToken"]:
        raise AccessError("Invalid admin_session token for game session")

    # update game question position, reveal answer etc,
    game_session["position"] += 1
    game_session["answerAvailable"] = False
    game_session["isoTimeLastQuestionStarted"] = (
        datetime.now().astimezone(timezone.utc).isoformat()
    )

    # end game if at end or create thread for a timeout for set_answer_available
    total_questions_len = len(game_session["questions"])
    if game_session["position"] >= total_questions_len:
        end_game(game_id, session_token)
    else:
        current_question = game_session["questions"][game_session["position"]]
        question_duration = float(current_question["duration"])

        # cancel existing timer
        if session_id in session_timeouts:
            session_timeouts[session_id].cancel()

        # start a new timer - schedule with set_answer_available to show answer after question duration
        session_timeouts[session_id] = threading.Timer(
            question_duration, lambda: set_answer_available(game_id)
        )
        session_timeouts[session_id].start()

    sessions[session_id] = game_session
    save_game_sessions(sessions)
    return game_session["position"]


def end_game(game_id, session_token):
    """End game game state based on game instance"""
    game_sessions = load_game_sessions()
    found_session_id = None

    for session_id, session in game_sessions.items():
        if session["gameId"] == game_id and session["active"]:

            if session_token != session["sessionOwnerToken"]:
                raise AccessError("Invalid admin_session token for game session")
            
            session["active"] = False
            game_sessions[session_id] = session
            found_session_id = session_id
            break

    if not found_session_id:
        raise InputError("No active session found for this game")

    save_game_sessions(game_sessions)
    return {"status": "ended"}


def mark_answer_available(session_id):
    """Game helper func - Marks a session as as available"""
    with session_lock:
        sessions = load_game_sessions()
        if session_id in sessions:
            sessions[session_id]["answerAvailable"] = True
            save_game_sessions(sessions)


def set_answer_available(game_id):
    """Game helper func - reveals the question answer for frontend to handle"""
    try:
        session_id = retrieve_session_id_from_game_id(game_id)
    except InputError:
        return
    # Game session may end before thread timer finished

    sessions = load_game_sessions()

    # session is inactive or doesn't exist anymore
    if session_id not in sessions or not sessions[session_id].get("active", False):
        return

    sessions[session_id]["answerAvailable"] = True
    save_game_sessions(sessions)
