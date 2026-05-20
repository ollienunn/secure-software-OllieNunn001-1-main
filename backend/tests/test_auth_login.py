import pytest
import re
from app import app
from database.data import clear_database

@pytest.fixture
def client():
    app.config["TESTING"] = True
    with app.test_client() as client:
        yield client

@pytest.fixture
def valid_client(client):
    res = client.post(
        "/admin/auth/register",
        json={
            "email": "mmadrid@kings.edu.au",
            "password": "ILoveComputing1!",
            "name": "Martin Madrid",
        },
    )

    assert res.status_code == 200
    return client


@pytest.fixture(autouse=True)
def clear():
    clear_database()


"""Test successful login"""


def test_successful_login(valid_client):
    response = valid_client.post(
        "/admin/auth/login",
        json={"email": "mmadrid@kings.edu.au", "password": "ILoveComputing1!"},
    )

    assert response.status_code == 200
    data = response.get_json()
    assert "session_token" in data

"""Test unsuccessful login for unregistered client"""

def test_unsuccessful_login_unregistered(client):
    response = client.post(
        "/admin/auth/login",
        json={"email": "unknownuser@kings.edu.au", "password": "NotARealPassword123!"},
    )

    assert response.status_code == 403
