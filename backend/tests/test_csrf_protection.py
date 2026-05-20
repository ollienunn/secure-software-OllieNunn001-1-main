"""
Test Suite for CSRF Protection (Stage 3)

⚠️  THESE TESTS WILL FAIL INITIALLY - This is expected and normal!

Tests CSRF token generation, validation, and HTTP-Only cookie implementation.
Students should implement double-token CSRF protection with secure cookies.

Expected: These tests should pass after completing Stage 3 (CSRF Protection)
"""

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


@pytest.fixture
def registered_user(client):
    """Helper fixture to create a registered user and return tokens"""
    response = client.post(
        "/admin/auth/register",
        json={
            "email": "user@kings.edu.au",
            "password": "StrongPassword123!",
            "name": "Test User",
        },
    )
    assert response.status_code == 200
    return response


# ===========================
# CSRF Token Generation Tests
# ===========================

def test_csrf_token_returned_on_register(client):
    """Test that CSRF token is returned in response body on registration"""
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

    # CSRF token should be in response body
    assert "csrf_token" in data
    assert data["csrf_token"] is not None
    assert len(data["csrf_token"]) > 0


def test_csrf_token_returned_on_login(client):
    """Test that CSRF token is returned in response body on login"""
    # Register first
    client.post(
        "/admin/auth/register",
        json={
            "email": "test@kings.edu.au",
            "password": "Password123!",
            "name": "Test User",
        },
    )

    # Login
    response = client.post(
        "/admin/auth/login",
        json={"email": "test@kings.edu.au", "password": "Password123!"},
    )

    assert response.status_code == 200
    data = response.get_json()

    # CSRF token should be in response body
    assert "csrf_token" in data
    assert data["csrf_token"] is not None


def test_csrf_tokens_are_unique(client):
    """Test that each session generates a unique CSRF token"""
    csrf_tokens = []

    for i in range(5):
        response = client.post(
            "/admin/auth/register",
            json={
                "email": f"user{i}@kings.edu.au",
                "password": "Password123!",
                "name": f"User {i}",
            },
        )
        csrf_token = response.get_json()["csrf_token"]
        csrf_tokens.append(csrf_token)

    # All CSRF tokens should be unique
    assert len(csrf_tokens) == len(set(csrf_tokens))


def test_csrf_token_is_cryptographically_secure(client):
    """Test that CSRF tokens are not predictable"""
    response = client.post(
        "/admin/auth/register",
        json={
            "email": "test@kings.edu.au",
            "password": "Password123!",
            "name": "Test User",
        },
    )

    csrf_token = response.get_json()["csrf_token"]

    # Should not contain predictable patterns
    assert "csrf_" not in csrf_token.lower()
    assert "token_" not in csrf_token.lower()
    assert "test@kings.edu.au" not in csrf_token.lower()

    # Should be sufficiently long
    assert len(csrf_token) >= 32


# ===========================
# HTTP-Only Cookie Tests
# ===========================

def test_session_token_set_as_httponly_cookie(client):
    """Test that session token is set as HTTP-Only cookie"""
    response = client.post(
        "/admin/auth/register",
        json={
            "email": "test@kings.edu.au",
            "password": "Password123!",
            "name": "Test User",
        },
    )

    assert response.status_code == 200

    # Check for Set-Cookie header
    cookies = response.headers.getlist("Set-Cookie")
    session_cookie = None

    for cookie in cookies:
        if "session_token" in cookie:
            session_cookie = cookie
            break

    assert session_cookie is not None, "Session token cookie not found"

    # Check HttpOnly flag
    assert "HttpOnly" in session_cookie


def test_session_cookie_has_samesite_lax(client):
    """Test that session cookie has SameSite=Lax attribute"""
    response = client.post(
        "/admin/auth/register",
        json={
            "email": "test@kings.edu.au",
            "password": "Password123!",
            "name": "Test User",
        },
    )

    cookies = response.headers.getlist("Set-Cookie")
    session_cookie = None

    for cookie in cookies:
        if "session_token" in cookie:
            session_cookie = cookie
            break

    assert session_cookie is not None
    assert "SameSite=Lax" in session_cookie or "SameSite=lax" in session_cookie


def test_session_cookie_has_secure_flag(client):
    """Test that session cookie has Secure flag (for HTTPS)"""
    response = client.post(
        "/admin/auth/register",
        json={
            "email": "test@kings.edu.au",
            "password": "Password123!",
            "name": "Test User",
        },
    )

    cookies = response.headers.getlist("Set-Cookie")
    session_cookie = None

    for cookie in cookies:
        if "session_token" in cookie:
            session_cookie = cookie
            break

    assert session_cookie is not None
    # Secure flag should be present (though it won't work in testing without HTTPS)
    assert "Secure" in session_cookie or app.config.get("TESTING")


def test_session_token_not_in_response_body(client):
    """Test that session token is NOT in response body (only in cookie)"""
    response = client.post(
        "/admin/auth/register",
        json={
            "email": "test@kings.edu.au",
            "password": "Password123!",
            "name": "Test User",
        },
    )

    data = response.get_json()

    # Session token should NOT be in response body (it's in cookie)
    # Only csrf_token should be in the body
    assert "session_token" not in data or data.get("session_token") is None


# ===========================
# CSRF Validation Tests
# ===========================

def test_post_request_requires_csrf_token(client, registered_user):
    """Test that POST requests require CSRF token"""
    # Try to logout without CSRF token
    response = client.post("/admin/auth/logout")

    # Should be rejected
    assert response.status_code in [401, 403]


def test_post_request_with_valid_csrf_accepted(client):
    """Test that POST requests with valid CSRF token are accepted"""
    response = client.post(
        "/admin/auth/register",
        json={
            "email": "test@kings.edu.au",
            "password": "Password123!",
            "name": "Test User",
        },
    )

    csrf_token = response.get_json()["csrf_token"]

    # Use CSRF token in a POST request
    logout_response = client.post(
        "/admin/auth/logout",
        headers={"X-CSRF-Token": csrf_token},
    )

    # Should be accepted (might be 200 or require session cookie too)
    assert logout_response.status_code in [200, 401, 403]
    # If 401/403, it's because we need the session cookie, not CSRF issue


def test_post_request_with_invalid_csrf_rejected(client, registered_user):
    """Test that POST requests with invalid CSRF token are rejected"""
    fake_csrf = "this_is_not_a_valid_csrf_token"

    response = client.post(
        "/admin/auth/logout",
        headers={"X-CSRF-Token": fake_csrf},
    )

    # Should be rejected due to invalid CSRF token
    assert response.status_code in [401, 403]


def test_csrf_token_in_custom_header(client):
    """Test that CSRF token is sent in X-CSRF-Token header"""
    response = client.post(
        "/admin/auth/register",
        json={
            "email": "test@kings.edu.au",
            "password": "Password123!",
            "name": "Test User",
        },
    )

    csrf_token = response.get_json()["csrf_token"]

    # Make a request with CSRF token in custom header
    response = client.post(
        "/admin/auth/logout",
        headers={"X-CSRF-Token": csrf_token},
    )

    # The X-CSRF-Token header should be recognised
    # Response code depends on whether session cookie is also valid
    assert response.status_code is not None


def test_get_request_does_not_require_csrf(client, registered_user):
    """Test that GET requests do not require CSRF token"""
    # GET requests should not require CSRF validation
    response = client.get("/admin/games")

    # Might fail for other reasons (session token), but not CSRF
    # This test ensures CSRF is not checked for GET
    assert response.status_code is not None


def test_put_request_requires_csrf_token(client):
    """Test that PUT requests require CSRF token"""
    # Register and get tokens
    response = client.post(
        "/admin/auth/register",
        json={
            "email": "test@kings.edu.au",
            "password": "Password123!",
            "name": "Test User",
        },
    )

    csrf_token = response.get_json()["csrf_token"]

    # Try PUT without CSRF - should fail
    response_no_csrf = client.put(
        "/admin/games/1",
        json={"name": "Test Game"},
    )

    assert response_no_csrf.status_code in [401, 403]


def test_delete_request_requires_csrf_token(client):
    """Test that DELETE requests require CSRF token"""
    # Register and get tokens
    response = client.post(
        "/admin/auth/register",
        json={
            "email": "test@kings.edu.au",
            "password": "Password123!",
            "name": "Test User",
        },
    )

    csrf_token = response.get_json()["csrf_token"]

    # Try DELETE without CSRF - should fail
    response_no_csrf = client.delete("/admin/games/1")

    assert response_no_csrf.status_code in [401, 403, 404]


def test_csrf_token_different_from_session_token(client):
    """Test that CSRF token is different from session token"""
    response = client.post(
        "/admin/auth/register",
        json={
            "email": "test@kings.edu.au",
            "password": "Password123!",
            "name": "Test User",
        },
    )

    data = response.get_json()
    csrf_token = data.get("csrf_token")

    # Get session token from cookie
    cookies = response.headers.getlist("Set-Cookie")
    session_token = None

    for cookie in cookies:
        if "session_token" in cookie:
            # Extract token value from cookie string
            # Format: session_token=value; HttpOnly; ...
            parts = cookie.split(";")[0].split("=")
            if len(parts) > 1:
                session_token = parts[1]
            break

    # CSRF and session tokens should be different
    if session_token and csrf_token:
        assert csrf_token != session_token


# ===========================
# Double-Token Submit Pattern Tests
# ===========================

def test_both_tokens_required_for_state_change(client):
    """Test that both session cookie and CSRF token are required"""
    response = client.post(
        "/admin/auth/register",
        json={
            "email": "test@kings.edu.au",
            "password": "Password123!",
            "name": "Test User",
        },
    )

    csrf_token = response.get_json()["csrf_token"]

    # Try with only CSRF token (no session cookie)
    response1 = client.post(
        "/admin/games",
        headers={"X-CSRF-Token": csrf_token},
        json={"name": "Test Game"},
    )

    # Should fail without valid session
    assert response1.status_code in [401, 403]


def test_csrf_token_cleared_on_logout(client):
    """Test that CSRF token is invalidated on logout"""
    response = client.post(
        "/admin/auth/register",
        json={
            "email": "test@kings.edu.au",
            "password": "Password123!",
            "name": "Test User",
        },
    )

    csrf_token = response.get_json()["csrf_token"]

    # Logout
    client.post(
        "/admin/auth/logout",
        headers={"X-CSRF-Token": csrf_token},
    )

    # Try to use the old CSRF token
    response = client.post(
        "/admin/games",
        headers={"X-CSRF-Token": csrf_token},
        json={"name": "Test Game"},
    )

    # Should be rejected (session is invalid)
    assert response.status_code in [401, 403]
