from database.data import load_game_sessions, load_games
from classes.Error import InputError
from core.auth_core import map_session_token_to_email


def retrieve_session_id_from_game_id(game_id):
    """Game helper - retrieves a session id from game_id"""
    sessions = load_game_sessions()
    for session_id, session in sessions.items():
        if session["gameId"] == game_id and session["active"]:
            return session_id
    raise InputError("Game ID not associated with any active session")


def retrieve_game(game_id, session_token):
    """Game helper - retrieves a game based on session token"""
    games = load_games()
    admin_email = map_session_token_to_email(session_token)

    admin_games_list = games[admin_email]

    for game_dictionary in admin_games_list:
        if str(game_dictionary["id"]) == game_id:
            return game_dictionary
    else:
        raise InputError("Invalid gameId - not in database")
