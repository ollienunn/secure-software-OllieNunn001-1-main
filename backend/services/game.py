from database.data import save_games, load_games, load_game_sessions, save_game_sessions
from classes.Error import InputError
from core.auth_core import map_session_token_to_email
from core.game_core import start_game, end_game, advance_game
from utils.helpers import generate_id

def game_update(new_games_list, session_token):
    """Service func - Updates games based on games_list sent via frontend"""
    email = map_session_token_to_email(session_token)

    all_games_dictionary = load_games()
    for game in new_games_list:
        if "id" not in game:
            game["id"] = generate_id(
                [g.get("id") for g in all_games_dictionary.get(email, [])]
            )

    all_games_dictionary[email] = new_games_list

    save_games(all_games_dictionary)

def game_getall(session_token):
    """Service func - Returns the admin's game list - or empty list"""
    email = map_session_token_to_email(session_token)

    all_games_dictionary = load_games()
    admin_games_list = all_games_dictionary.get(email, [])

    return admin_games_list

def game_mutate(target_game_id, mutate_type, session_token):
    """Service func - updates game state -> mutates game based on type"""
    if mutate_type == "START":
        game_session_id = start_game(target_game_id, session_token)
        return {"status": "started", "sessionId": game_session_id}
    elif mutate_type == "ADVANCE":
        position = advance_game(target_game_id, session_token)
        return {"status": "advanced", "position": position}
    elif mutate_type == "END":
        end_game(target_game_id, session_token)
        return {"status": "ended"}
    else:
        raise InputError("Invalid mutation type")

def game_session_status(game_session_id):
    """Service func - checks the session status for specific game instance id"""
    sessions = load_game_sessions()

    if game_session_id not in sessions:
        raise InputError(f"No session found for session ID: {game_session_id}")

    session = sessions[game_session_id]

    if not session.get("active", False):
        raise InputError(f"Session {game_session_id} is not active")

    save_game_sessions(sessions)
    return {
        "active": True,
        "answerAvailable": session.get("answerAvailable", False),
        "isoTimeLastQuestionStarted": session.get("isoTimeLastQuestionStarted"),
        "position": session.get("position"),
        "questions": session.get("questions", []),
        "players": list(session.get("players", {}).keys()),
    }

def game_session_results(game_session_id):
    """Service func - obtains overall game_session results for specific game instance"""
    sessions = load_game_sessions()
    session = sessions.get(game_session_id)

    if not session:
        raise InputError(f"No session found for session ID: {game_session_id}")
    if session.get("active", True):
        raise InputError("Cannot get results for active session")
    return list(session.get("players", {}).values())