import pytest
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
    """Helper to register and return session + csrf tokens"""
    res = client.post(
        "/admin/auth/register",
        json={
            "email": "host@kings.edu.au",
            "password": "SecurePass1!",
            "name": "Admin Host",
        },
    )
    data = res.get_json()
    return data["session_token"], data["csrf_token"]


def create_game_and_start_session(client):
    """Registers admin, creates game, starts session. Returns tokens, session_id, and game_id."""
    session_token, csrf_token = register_admin(client)

    game = {
        "name": "Test Game",
        "questions": [
            {
                "question": "What is 1+1?",
                "answers": ["1", "2"],
                "correctAnswers": [1],
                "duration": 10,
            }
        ],
    }

    # Save the game
    client.put(
        "/admin/games",
        json={"games": [game]},
        headers={"Authorization": session_token, "X-CSRF-Token": csrf_token},
    )

    # Retrieve backend-generated game ID
    res = client.get(
        "/admin/games",
        headers={"Authorization": session_token, "X-CSRF-Token": csrf_token},
    )
    saved_games = res.get_json()["games"]
    assert len(saved_games) > 0
    game_id = saved_games[0]["id"]

    # Start session
    start_res = client.post(
        f"/admin/game/{game_id}/mutate",
        json={"mutationType": "START"},
        headers={"Authorization": session_token, "X-CSRF-Token": csrf_token},
    )

    session_id = start_res.get_json()["data"]["sessionId"]

    return session_token, csrf_token, session_id, game_id


def test_session_status_success(client):
    """GET /admin/session/<id>/status should return active session info"""
    session_token, csrf_token, session_id, game_id = create_game_and_start_session(
        client
    )

    res = client.get(
        f"/admin/session/{session_id}/status",
        headers={"Authorization": session_token, "X-CSRF-Token": csrf_token},
    )

    assert res.status_code == 200
    data = res.get_json()["results"]

    assert data["active"] is True
    assert data["position"] == -1
    assert data["answerAvailable"] is False
    assert isinstance(data["players"], list)
    assert isinstance(data["questions"], list)
    assert data["isoTimeLastQuestionStarted"] is None or isinstance(
        data["isoTimeLastQuestionStarted"], str
    )


def test_session_status_invalid_id(client):
    """GET /admin/session/<bad_id>/status should return 400"""
    session_token, csrf_token = register_admin(client)

    res = client.get(
        "/admin/session/999999/status",
        headers={"Authorization": session_token, "X-CSRF-Token": csrf_token},
    )

    assert res.status_code == 400
    assert "error" in res.get_json()


def test_session_results_fail_if_active(client):
    """GET /admin/session/<id>/results should fail if session is active"""
    session_token, csrf_token, session_id, game_id = create_game_and_start_session(
        client
    )

    res = client.get(
        f"/admin/session/{session_id}/results",
        headers={"Authorization": session_token, "X-CSRF-Token": csrf_token},
    )

    assert res.status_code == 400
    assert "error" in res.get_json()


def test_session_results_success_after_end(client):
    session_token, csrf_token, session_id, game_id = create_game_and_start_session(
        client
    )

    # END the same game used to create session
    res = client.post(
        f"/admin/game/{game_id}/mutate",
        json={"mutationType": "END"},
        headers={"Authorization": session_token, "X-CSRF-Token": csrf_token},
    )

    res = client.get(
        f"/admin/session/{session_id}/results",
        headers={"Authorization": session_token, "X-CSRF-Token": csrf_token},
    )

    assert res.status_code == 200
    data = res.get_json()
    assert "results" in data
