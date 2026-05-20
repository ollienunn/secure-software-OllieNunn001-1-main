from database.data import load_users, load_game_sessions, load_games
from classes.Error import InputError

def retrieve_active_session(session_id):
    """Helper func - retrieves active session via id"""
    game_sessions = load_game_sessions()
    if session_id in game_sessions:
        session = game_sessions[session_id]
        return session, game_sessions
    else:
        raise InputError(f"Session ID '{session_id}' is not for an active session")


def retrieve_game_session_from_playerid(player_id):
    """Retrieves game session from playerid"""
    sessions = load_game_sessions()
    for session in sessions.values():
        if player_id in session.get("players", {}):
            return session
    raise InputError("Player not associated with game session")


def new_player_payload(name, num_questions):
    """Creates a new player key info payload"""
    player_data = {"name": name, "answers": []}

    for _ in range(num_questions):
        player_data["answers"].append(
            {
                "questionStartedAt": None,
                "answeredAt": None,
                "answers": [],
                "correct": False,
            }
        )

    return player_data
