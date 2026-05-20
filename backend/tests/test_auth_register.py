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

def test_successful_registration(client):
    """Test successful registration"""
    response = client.post(
        "/admin/auth/register",
        json={
            "email": "mmadrid@kings.edu.au",
            "password": "StrongPass1!",
            "name": "Martin Madrid",
        },
    )

    # Check response status
    assert response.status_code == 200

    # Check response body
    data = response.get_json()
    assert "session_token" in data


def test_register_duplicate_email(client):
    """Test duplicate email registration"""
    # Register first time
    client.post(
        "/admin/auth/register",
        json={
            "email": "mmadrid@kings.edu.au",
            "password": "StrongPass1!",
            "name": "Martin Madrid",
        },
    )

    # Attempt to register again
    response = client.post(
        "/admin/auth/register",
        json={
            "email": "mmadrid@kings.edu.au",
            "password": "AnotherPass1!",
            "name": "Martin Madrid",
        },
    )
    assert response.status_code == 400
    assert "error" in response.json
