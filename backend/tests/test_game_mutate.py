import pytest
import re
from app import app
from database.data import clear_database

@pytest.fixture
def client():
    app.config["TESTING"] = True
    with app.test_client() as client:
        yield client

@pytest.fixture(autouse=True)
def clear():
    clear_database()

def register_admin(client):
    res = client.post(
        "/admin/auth/register",
        json={
            "email": "admin@kings.edu.au",
            "password": "StrongPass123!",
            "name": "Admin",
        },
    )
    data = res.get_json()
    return data["session_token"], data["csrf_token"]


def setup_game_and_tokens(client):
    """Register admin, add one game, return tokens and real game ID from backend"""
    session_token, csrf_token = register_admin(client)

    # PUT 1 game
    # note: backend assigns id - frontend gets game_id from all_games
    game = {
        "name": "Mutatable Game",
        "questions": [
            {"question": "Q1", "answers": [], "correctAnswers": [], "duration": 10}
        ],
    }

    client.put(
        "/admin/games",
        headers={"Authorization": session_token, "X-CSRF-Token": csrf_token},
        json={"games": [game]},
    )

    # GET all games to find generated ID
    res = client.get(
        "/admin/games",
        headers={"Authorization": session_token, "X-CSRF-Token": csrf_token},
    )

    data = res.get_json()
    assert "games" in data
    assert len(data["games"]) == 1
    assert "id" in data["games"][0]

    game_id = data["games"][0]["id"]
    return session_token, csrf_token, game_id


def test_mutate_game_start(client):
    session_token, csrf_token, game_id = setup_game_and_tokens(client)

    res = client.post(
        f"/admin/game/{game_id}/mutate",
        headers={"Authorization": session_token, "X-CSRF-Token": csrf_token},
        json={"mutationType": "START"},
    )

    assert res.status_code == 200
    data = res.get_json()["data"]
    assert data["status"] == "started"
    assert "sessionId" in data
    assert re.fullmatch(r"\d+", data["sessionId"])


def test_mutate_game_advance(client):
    session_token, csrf_token, game_id = setup_game_and_tokens(client)

    client.post(
        f"/admin/game/{game_id}/mutate",
        headers={"Authorization": session_token, "X-CSRF-Token": csrf_token},
        json={"mutationType": "START"},
    )

    res = client.post(
        f"/admin/game/{game_id}/mutate",
        headers={"Authorization": session_token, "X-CSRF-Token": csrf_token},
        json={"mutationType": "ADVANCE"},
    )

    assert res.status_code == 200
    data = res.get_json()["data"]
    assert data["status"] == "advanced"
    assert isinstance(data["position"], int)


def test_mutate_game_end(client):
    session_token, csrf_token, game_id = setup_game_and_tokens(client)

    client.post(
        f"/admin/game/{game_id}/mutate",
        headers={"Authorization": session_token, "X-CSRF-Token": csrf_token},
        json={"mutationType": "START"},
    )

    res = client.post(
        f"/admin/game/{game_id}/mutate",
        headers={"Authorization": session_token, "X-CSRF-Token": csrf_token},
        json={"mutationType": "END"},
    )

    assert res.status_code == 200
    data = res.get_json()["data"]
    assert data["status"] == "ended"


def test_mutate_game_invalid_type(client):
    session_token, csrf_token, game_id = setup_game_and_tokens(client)

    res = client.post(
        f"/admin/game/{game_id}/mutate",
        headers={"Authorization": session_token, "X-CSRF-Token": csrf_token},
        json={"mutationType": "FLY"},
    )

    assert res.status_code == 400
    data = res.get_json()
    assert "error" in data
