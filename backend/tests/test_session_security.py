"""
Test Suite for Session Security (Stage 2)

⚠️  THESE TESTS WILL FAIL INITIALLY - This is expected and normal!

Tests session token generation, validation, and security.
Students should implement cryptographically secure tokens and proper session validation.

Expected: These tests should pass after completing Stage 2 (Session Management)
"""

import pytest
import re
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


@pytest.fixture
def registered_user(client):
    """Helper fixture to create a registered user"""
    response = client.post(
        "/admin/auth/register",
        json={
            "email": "user@kings.edu.au",
            "password": "StrongPassword123!",
            "name": "Test User",
        },
    )
    assert response.status_code == 200
    return response.get_json()


# ===========================
# Token Generation Tests
# ===========================

def test_session_token_generated_on_register(client):
    """Test that a session token is generated upon registration"""
    response = client.post(
        "/admin/auth/register",
        json={
            "email": "test@kings.edu.au",
            "password": "Password123!",
            "name": "Test User",
        },
    )

    assert response.status_code == 200
    data = response.get_json()
    assert "session_token" in data
    assert data["session_token"] is not None
    assert len(data["session_token"]) > 0


def test_session_token_generated_on_login(client, registered_user):
    """Test that a session token is generated upon login"""
    response = client.post(
        "/admin/auth/login",
        json={"email": "user@kings.edu.au", "password": "StrongPassword123!"},
    )

    assert response.status_code == 200
    data = response.get_json()
    assert "session_token" in data
    assert data["session_token"] is not None


def test_session_tokens_are_unique(client):
    """Test that each session generates a unique token"""
    tokens = []

    # Register multiple users
    for i in range(5):
        response = client.post(
            "/admin/auth/register",
            json={
                "email": f"user{i}@kings.edu.au",
                "password": "Password123!",
                "name": f"User {i}",
            },
        )
        assert response.status_code == 200
        token = response.get_json()["session_token"]
        tokens.append(token)

    # All tokens should be unique
    assert len(tokens) == len(set(tokens))


def test_session_token_is_not_predictable(client):
    """Test that session tokens are not based on predictable patterns"""
    response = client.post(
        "/admin/auth/register",
        json={
            "email": "test@kings.edu.au",
            "password": "Password123!",
            "name": "Test User",
        },
    )

    token = response.get_json()["session_token"]

    # Token should not be the old insecure pattern
    assert not token.startswith("insecure_token_")

    # Token should not contain the email address
    assert "test@kings.edu.au" not in token.lower()
    assert "test" not in token.lower()


def test_session_token_sufficient_length(client):
    """Test that session tokens have sufficient length for security"""
    response = client.post(
        "/admin/auth/register",
        json={
            "email": "test@kings.edu.au",
            "password": "Password123!",
            "name": "Test User",
        },
    )

    token = response.get_json()["session_token"]

    # Token should be at least 32 characters (providing 128+ bits of entropy)
    assert len(token) >= 32


def test_session_token_uses_secure_characters(client):
    """Test that session tokens use URL-safe characters"""
    response = client.post(
        "/admin/auth/register",
        json={
            "email": "test@kings.edu.au",
            "password": "Password123!",
            "name": "Test User",
        },
    )

    token = response.get_json()["session_token"]

    # Token should only contain URL-safe characters (base64 URL-safe alphabet)
    # a-z, A-Z, 0-9, -, _
    assert re.match(r'^[a-zA-Z0-9_-]+$', token)


def test_new_session_token_on_each_login(client, registered_user):
    """Test that a new token is generated for each login"""
    # First login
    response1 = client.post(
        "/admin/auth/login",
        json={"email": "user@kings.edu.au", "password": "StrongPassword123!"},
    )
    token1 = response1.get_json()["session_token"]

    # Logout
    client.post(
        "/admin/auth/logout",
        headers={"Authorization": token1},
    )

    # Second login
    response2 = client.post(
        "/admin/auth/login",
        json={"email": "user@kings.edu.au", "password": "StrongPassword123!"},
    )
    token2 = response2.get_json()["session_token"]

    # Tokens should be different
    assert token1 != token2


# ===========================
# Session Validation Tests
# ===========================

def test_valid_session_token_accepted(client, registered_user):
    """Test that valid session tokens are accepted for protected routes"""
    session_token = registered_user["session_token"]

    # Try to access a protected route (e.g., getting games)
    response = client.get(
        "/admin/games",
        headers={"Authorization": session_token},
    )

    # Should not be 403 (forbidden) or 401 (unauthorized)
    # Might be 200 or other valid response
    assert response.status_code != 403
    assert response.status_code != 401


def test_invalid_session_token_rejected(client):
    """Test that invalid session tokens are rejected"""
    fake_token = "this_is_not_a_valid_token_12345"

    response = client.get(
        "/admin/games",
        headers={"Authorization": fake_token},
    )

    # Should be rejected with 403 or 401
    assert response.status_code in [401, 403]


def test_missing_session_token_rejected(client):
    """Test that requests without session tokens are rejected"""
    response = client.get("/admin/games")

    # Should be rejected with 403 or 401
    assert response.status_code in [401, 403]


def test_empty_session_token_rejected(client):
    """Test that empty session tokens are rejected"""
    response = client.get(
        "/admin/games",
        headers={"Authorization": ""},
    )

    assert response.status_code in [401, 403]


def test_expired_session_token_rejected(client, registered_user):
    """Test that logged out session tokens are rejected"""
    session_token = registered_user["session_token"]

    # Logout the user
    client.post(
        "/admin/auth/logout",
        headers={"Authorization": session_token},
    )

    # Try to use the token after logout
    response = client.get(
        "/admin/games",
        headers={"Authorization": session_token},
    )

    # Should be rejected
    assert response.status_code in [401, 403]


def test_session_token_not_shared_between_users(client):
    """Test that one user's session token cannot access another user's resources"""
    # Register user 1
    response1 = client.post(
        "/admin/auth/register",
        json={
            "email": "user1@kings.edu.au",
            "password": "Password123!",
            "name": "User One",
        },
    )
    token1 = response1.get_json()["session_token"]

    # Register user 2
    response2 = client.post(
        "/admin/auth/register",
        json={
            "email": "user2@kings.edu.au",
            "password": "Password123!",
            "name": "User Two",
        },
    )
    token2 = response2.get_json()["session_token"]

    # Tokens should be different
    assert token1 != token2

    # Each token should only work for its own user
    # Both should be able to access their own resources
    response1 = client.get(
        "/admin/games",
        headers={"Authorization": token1},
    )
    response2 = client.get(
        "/admin/games",
        headers={"Authorization": token2},
    )

    # Both should succeed
    assert response1.status_code == 200
    assert response2.status_code == 200


def test_session_token_in_database_matches(client, registered_user):
    """Test that the session token in the database matches the returned token"""
    returned_token = registered_user["session_token"]

    # Check database
    users = load_users()
    user = users["user@kings.edu.au"]

    assert user.session_token == returned_token


def test_session_token_cleared_on_logout(client, registered_user):
    """Test that session token is cleared from database on logout"""
    session_token = registered_user["session_token"]

    # Logout
    response = client.post(
        "/admin/auth/logout",
        headers={"Authorization": session_token},
    )

    assert response.status_code == 200

    # Check that token is cleared in database
    users = load_users()
    user = users["user@kings.edu.au"]

    assert user.session_token is None


# ===========================
# Session Token Entropy Tests
# ===========================

def test_session_tokens_have_high_entropy(client):
    """Test that session tokens have sufficient randomness (entropy)"""
    tokens = []

    # Generate multiple tokens
    for i in range(20):
        response = client.post(
            "/admin/auth/register",
            json={
                "email": f"user{i}@kings.edu.au",
                "password": "Password123!",
                "name": f"User {i}",
            },
        )
        token = response.get_json()["session_token"]
        tokens.append(token)

    # Check for patterns that would indicate low entropy
    # No token should be a substring of another
    for i, token1 in enumerate(tokens):
        for j, token2 in enumerate(tokens):
            if i != j:
                assert token1 not in token2
                assert token2 not in token1

    # Check that there's variation in each position
    if len(tokens[0]) > 0:
        for position in range(min(len(t) for t in tokens)):
            chars_at_position = set(token[position] for token in tokens)
            # Should have more than 1 character at each position across all tokens
            assert len(chars_at_position) > 1
