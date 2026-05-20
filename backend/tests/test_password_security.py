"""
Test Suite for Password Security (Stage 1)

⚠️  THESE TESTS WILL FAIL INITIALLY - This is expected and normal!

Tests password hashing, verification, and storage security.
Students should implement secure password hashing using werkzeug.security.

Expected: These tests should pass after completing Stage 1.1 (Password Hashing)
"""

import pytest
import json
from app import app
from database.data import clear_database, load_users


@pytest.fixture
def client():
    app.config["TESTING"] = True
    with app.test_client() as client:
        yield client


@pytest.fixture(autouse=True)
def clear():
    clear_database()


def test_password_not_stored_as_plaintext(client):
    """Test that passwords are hashed, not stored as plain text"""
    password = "MySecurePassword123!"

    response = client.post(
        "/admin/auth/register",
        json={
            "email": "test@kings.edu.au",
            "password": password,
            "name": "Test User",
        },
    )

    assert response.status_code == 200

    # Load users from database and check password is hashed
    users = load_users()
    user = users.get("test@kings.edu.au")

    assert user is not None
    # Password should NOT be stored as plain text
    user_dict = user.to_dict()
    assert user_dict["password_hash"] != password
    assert password not in str(user_dict["password_hash"])


def test_password_hash_uses_salt(client):
    """Test that password hashing uses salt (different hashes for same password)"""
    password = "SamePassword123!"

    # Register first user
    client.post(
        "/admin/auth/register",
        json={
            "email": "user1@kings.edu.au",
            "password": password,
            "name": "User One",
        },
    )

    # Register second user with same password
    client.post(
        "/admin/auth/register",
        json={
            "email": "user2@kings.edu.au",
            "password": password,
            "name": "User Two",
        },
    )

    # Load users and compare hashes
    users = load_users()
    user1_hash = users["user1@kings.edu.au"].to_dict()["password_hash"]
    user2_hash = users["user2@kings.edu.au"].to_dict()["password_hash"]

    # Hashes should be different due to unique salts
    assert user1_hash != user2_hash


def test_password_verification_correct(client):
    """Test that correct password verification works"""
    email = "verify@kings.edu.au"
    password = "CorrectPassword123!"

    # Register user
    client.post(
        "/admin/auth/register",
        json={
            "email": email,
            "password": password,
            "name": "Verify User",
        },
    )

    # Login with correct password should succeed
    response = client.post(
        "/admin/auth/login",
        json={"email": email, "password": password},
    )

    assert response.status_code == 200
    assert "session_token" in response.get_json()


def test_password_verification_incorrect(client):
    """Test that incorrect password is rejected"""
    email = "verify@kings.edu.au"
    correct_password = "CorrectPassword123!"
    wrong_password = "WrongPassword123!"

    # Register user
    client.post(
        "/admin/auth/register",
        json={
            "email": email,
            "password": correct_password,
            "name": "Verify User",
        },
    )

    # Login with wrong password should fail
    response = client.post(
        "/admin/auth/login",
        json={"email": email, "password": wrong_password},
    )

    assert response.status_code == 403


def test_password_hash_format(client):
    """Test that password hash uses proper format (werkzeug format)"""
    response = client.post(
        "/admin/auth/register",
        json={
            "email": "format@kings.edu.au",
            "password": "TestPassword123!",
            "name": "Format Test",
        },
    )

    assert response.status_code == 200

    users = load_users()
    user = users["format@kings.edu.au"]
    password_hash = user.to_dict()["password_hash"]

    # Werkzeug password hashes should start with method identifier
    # e.g., 'pbkdf2:sha256:' or 'scrypt:'
    assert isinstance(password_hash, str)
    assert len(password_hash) > 20  # Hash should be reasonably long
    # Should not be the simple concatenation pattern
    assert not password_hash.startswith("insecure_")


def test_password_case_sensitive(client):
    """Test that password verification is case-sensitive"""
    email = "case@kings.edu.au"
    password = "CaseSensitive123!"

    client.post(
        "/admin/auth/register",
        json={
            "email": email,
            "password": password,
            "name": "Case User",
        },
    )

    # Login with different case should fail
    response = client.post(
        "/admin/auth/login",
        json={"email": email, "password": password.lower()},
    )

    assert response.status_code == 403


def test_empty_password_rejected(client):
    """Test that empty passwords are rejected"""
    response = client.post(
        "/admin/auth/register",
        json={
            "email": "empty@kings.edu.au",
            "password": "",
            "name": "Empty User",
        },
    )

    # Should return error for empty password
    assert response.status_code == 400


def test_password_with_special_characters(client):
    """Test that passwords with special characters work correctly"""
    special_password = "P@$$w0rd!#%&*"

    response = client.post(
        "/admin/auth/register",
        json={
            "email": "special@kings.edu.au",
            "password": special_password,
            "name": "Special User",
        },
    )

    assert response.status_code == 200

    # Login with same password should work
    response = client.post(
        "/admin/auth/login",
        json={"email": "special@kings.edu.au", "password": special_password},
    )

    assert response.status_code == 200
