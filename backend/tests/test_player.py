import pytest
import time
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

def register_admin_and_start_game(client):
    # Register
    res = client.post(
        "/admin/auth/register",
        json={
            "email": "host@example.com",
            "password": "StrongPass123!",
            "name": "Host",
        },
    )
    session_token = res.get_json()["session_token"]
    csrf_token = res.get_json()["csrf_token"]

    # Create game
    game = {
        "name": "Sample Game",
        "questions": [
            {
                "question": "What's 2 + 2?",
                "answers": ["3", "4", "5"],
                "correctAnswers": [1],
                "duration": 1,  # short for test
            }
        ],
    }

    client.put(
        "/admin/games",
        json={"games": [game]},
        headers={"Authorization": session_token, "X-CSRF-Token": csrf_token},
    )

    # Get game ID
    res = client.get(
        "/admin/games",
        headers={"Authorization": session_token, "X-CSRF-Token": csrf_token},
    )
    game_id = res.get_json()["games"][0]["id"]

    # Start game session
    res = client.post(
        f"/admin/game/{game_id}/mutate",
        json={"mutationType": "START"},
        headers={"Authorization": session_token, "X-CSRF-Token": csrf_token},
    )
    session_id = res.get_json()["data"]["sessionId"]

    return session_token, csrf_token, session_id, game_id


def test_player_question_flow(client):
    session_token, csrf_token, session_id, game_id = register_admin_and_start_game(
        client
    )

    # Player joins
    res = client.post(f"/play/join/{session_id}", json={"name": "Player2"})
    player_id = res.get_json()["playerId"]

    # Advance the game
    res = client.post(
        f"/admin/game/{game_id}/mutate",
        json={"mutationType": "ADVANCE"},
        headers={"Authorization": session_token, "X-CSRF-Token": csrf_token},
    )
    assert res.status_code == 200

    # Wait to allow question to become visible (optional)
    time.sleep(0.5)

    # Get question
    res = client.get(f"/play/{player_id}/question")
    assert res.status_code == 200
    assert "question" in res.get_json()

    # Submit answer
    res = client.put(f"/play/{player_id}/answer", json={"answers": [1]})
    assert res.status_code == 200

    # Wait for auto-answer-reveal
    time.sleep(1.1)

    # Check revealed answers
    res = client.get(f"/play/{player_id}/answer")
    assert res.status_code == 200
    assert "answers" in res.get_json()


def test_player_results(client):
    session_token, csrf_token, session_id, game_id = register_admin_and_start_game(
        client
    )

    # Player joins
    res = client.post(f"/play/join/{session_id}", json={"name": "Player3"})
    player_id = res.get_json()["playerId"]

    # Advance to question
    client.post(
        f"/admin/game/{game_id}/mutate",
        json={"mutationType": "ADVANCE"},
        headers={"Authorization": session_token, "X-CSRF-Token": csrf_token},
    )

    # End the game
    client.post(
        f"/admin/game/{game_id}/mutate",
        json={"mutationType": "END"},
        headers={"Authorization": session_token, "X-CSRF-Token": csrf_token},
    )

    # Request results
    res = client.get(f"/play/{player_id}/results")
    assert res.status_code == 200
    assert "results" in res.get_json()
