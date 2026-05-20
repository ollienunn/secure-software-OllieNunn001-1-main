import json

from typing import Dict, Any
from classes.User import User

# file paths relative to /backend
USERS_FILE_PATH = "database/users.database.json"
GAMES_FILE_PATH = "database/games.database.json"
SESSIONS_FILE_PATH = "database/sessions.database.json"


###################################
# USER JSON DATABASE
# DO NOT MODIFY CODE BELOW
###################################
def load_users():
    try:

        with open(USERS_FILE_PATH, "r") as f:
            raw_users = json.load(f)

            return {email: User.from_dict(data) for email, data in raw_users.items()}
    except (FileNotFoundError, json.JSONDecodeError):
        return {}


def save_users(users):
    with open(USERS_FILE_PATH, "w") as f:
        json.dump({email: user.to_dict() for email, user in users.items()}, f, indent=4)


def clear_database():
    """Clears all users, games, and sessions from the database."""
    with open(USERS_FILE_PATH, "w") as user_f, open(
        GAMES_FILE_PATH, "w"
    ) as game_f, open(SESSIONS_FILE_PATH, "w") as session_f:
        user_f.write("{}")
        game_f.write("{}")
        session_f.write("{}")


###################################
# GAME JSON DATABASE
# DO NOT MODIFY CODE BELOW
###################################


def load_games():
    try:
        with open(GAMES_FILE_PATH, "r") as f:
            json_games = json.load(f)

            users_dictionary = load_users()
            for email in users_dictionary.keys():
                # Ensure every user has a game list, even if empty
                if email not in json_games:
                    json_games[email] = []

            return json_games

    except (FileNotFoundError, json.JSONDecodeError) as e:
        print(f"Error loading games: {e}")
        return {}


def save_games(all_games_dictionary):
    with open(GAMES_FILE_PATH, "w") as f:
        json.dump(all_games_dictionary, f, indent=4)


def load_game_sessions():
    try:
        with open(SESSIONS_FILE_PATH, "r") as f:
            return json.load(f)
    except (FileNotFoundError, json.JSONDecodeError) as e:
        print(f"Error loading sessions: {e}")
        return {}


def save_game_sessions(sessions):
    with open(SESSIONS_FILE_PATH, "w") as f:
        json.dump(sessions, f, indent=4)
