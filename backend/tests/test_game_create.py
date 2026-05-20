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
    """Helper to register an admin and return session + csrf tokens"""
    res = client.post(
        "/admin/auth/register",
        json={
            "email": "admin@example.com",
            "password": "StrongPassword1!",
            "name": "Admin",
        },
    )
    assert res.status_code == 200
    data = res.get_json()
    return data["session_token"], data["csrf_token"]


def test_admin_get_games_empty(client):
    """Test GET /admin/games returns empty list initially"""
    session_token, csrf_token = register_admin(client)

    res = client.get(
        "/admin/games",
        headers={"Authorization": session_token, "X-CSRF-Token": csrf_token},
    )

    assert res.status_code == 200
    data = res.get_json()
    assert "games" in data
    assert isinstance(data["games"], list)
    assert data["games"] == []


def test_admin_put_and_get_games(client):
    """Test PUT /admin/games then verify with GET"""
    session_token, csrf_token = register_admin(client)

    # define sample games
    sample_games = [
        {"id": "1", "name": "First Game", "questions": []},
        {"id": "2", "name": "Second Game", "questions": []},
    ]

    # Update games
    put_res = client.put(
        "/admin/games",
        headers={"Authorization": session_token, "X-CSRF-Token": csrf_token},
        json={"games": sample_games},
    )

    assert put_res.status_code == 200
    assert put_res.get_json() == {}

    # GET to verify update
    get_res = client.get(
        "/admin/games",
        headers={"Authorization": session_token, "X-CSRF-Token": csrf_token},
    )

    assert get_res.status_code == 200
    data = get_res.get_json()
    assert "games" in data
    assert data["games"] == sample_games
