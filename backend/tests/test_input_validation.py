"""
Test Suite for Input Validation (Stage 1)

⚠️  THESE TESTS WILL FAIL INITIALLY - This is expected and normal!

Tests email validation, password strength, name validation, and general input validation.
Students should implement proper input validation to prevent malicious data.

Expected: These tests should pass after completing Stage 1.2 (Input Validation)
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


# ===========================
# Email Validation Tests
# ===========================

def test_valid_email_formats(client):
    """Test that valid email formats are accepted"""
    valid_emails = [
        "user@kings.edu.au",
        "test.user@example.com",
        "admin123@test.org",
        "name+tag@domain.co.uk",
    ]

    for email in valid_emails:
        response = client.post(
            "/admin/auth/register",
            json={
                "email": email,
                "password": "ValidPassword123!",
                "name": "Test User",
            },
        )
        assert response.status_code == 200, f"Valid email {email} was rejected"
        clear_database()  # Clear for next test


def test_invalid_email_formats(client):
    """Test that invalid email formats are rejected"""
    invalid_emails = [
        "notanemail",
        "@example.com",
        "user@",
        "user @example.com",
        "user@.com",
        "user..name@example.com",
        "",
        "user@domain",  # No TLD
    ]

    for email in invalid_emails:
        response = client.post(
            "/admin/auth/register",
            json={
                "email": email,
                "password": "ValidPassword123!",
                "name": "Test User",
            },
        )
        assert response.status_code == 400, f"Invalid email {email} was accepted"


def test_email_case_insensitive(client):
    """Test that email addresses are treated case-insensitively"""
    # Register with lowercase
    response1 = client.post(
        "/admin/auth/register",
        json={
            "email": "user@kings.edu.au",
            "password": "Password123!",
            "name": "User One",
        },
    )
    assert response1.status_code == 200

    # Try to register with uppercase version - should fail (duplicate)
    response2 = client.post(
        "/admin/auth/register",
        json={
            "email": "USER@KINGS.EDU.AU",
            "password": "Password123!",
            "name": "User Two",
        },
    )
    assert response2.status_code == 400


def test_email_whitespace_trimmed(client):
    """Test that whitespace around email is trimmed"""
    response = client.post(
        "/admin/auth/register",
        json={
            "email": "  user@kings.edu.au  ",
            "password": "Password123!",
            "name": "Test User",
        },
    )

    # Should succeed after trimming
    assert response.status_code == 200

    # Login without whitespace should work
    response = client.post(
        "/admin/auth/login",
        json={"email": "user@kings.edu.au", "password": "Password123!"},
    )
    assert response.status_code == 200


# ===========================
# Password Strength Tests
# ===========================

def test_password_minimum_length(client):
    """Test that password has minimum length requirement"""
    short_password = "Ab1!"  # Too short

    response = client.post(
        "/admin/auth/register",
        json={
            "email": "user@kings.edu.au",
            "password": short_password,
            "name": "Test User",
        },
    )

    # Should reject passwords that are too short (minimum should be 8 characters)
    assert response.status_code == 400


def test_password_requires_uppercase(client):
    """Test that password requires at least one uppercase letter"""
    no_uppercase = "password123!"

    response = client.post(
        "/admin/auth/register",
        json={
            "email": "user@kings.edu.au",
            "password": no_uppercase,
            "name": "Test User",
        },
    )

    assert response.status_code == 400


def test_password_requires_lowercase(client):
    """Test that password requires at least one lowercase letter"""
    no_lowercase = "PASSWORD123!"

    response = client.post(
        "/admin/auth/register",
        json={
            "email": "user@kings.edu.au",
            "password": no_lowercase,
            "name": "Test User",
        },
    )

    assert response.status_code == 400


def test_password_requires_digit(client):
    """Test that password requires at least one digit"""
    no_digit = "PasswordOnly!"

    response = client.post(
        "/admin/auth/register",
        json={
            "email": "user@kings.edu.au",
            "password": no_digit,
            "name": "Test User",
        },
    )

    assert response.status_code == 400


def test_password_requires_special_character(client):
    """Test that password requires at least one special character"""
    no_special = "Password123"

    response = client.post(
        "/admin/auth/register",
        json={
            "email": "user@kings.edu.au",
            "password": no_special,
            "name": "Test User",
        },
    )

    assert response.status_code == 400


def test_strong_password_accepted(client):
    """Test that strong passwords meeting all requirements are accepted"""
    strong_passwords = [
        "StrongPass1!",
        "MySecure@Pass123",
        "C0mpl3x#Password",
        "V@lidP@ssw0rd!",
    ]

    for idx, password in enumerate(strong_passwords):
        response = client.post(
            "/admin/auth/register",
            json={
                "email": f"user{idx}@kings.edu.au",
                "password": password,
                "name": "Test User",
            },
        )
        assert response.status_code == 200, f"Strong password {password} was rejected"


# ===========================
# Name Validation Tests
# ===========================

def test_empty_name_rejected(client):
    """Test that empty names are rejected"""
    response = client.post(
        "/admin/auth/register",
        json={
            "email": "user@kings.edu.au",
            "password": "Password123!",
            "name": "",
        },
    )

    assert response.status_code == 400


def test_name_whitespace_only_rejected(client):
    """Test that names with only whitespace are rejected"""
    response = client.post(
        "/admin/auth/register",
        json={
            "email": "user@kings.edu.au",
            "password": "Password123!",
            "name": "   ",
        },
    )

    assert response.status_code == 400


def test_name_too_long_rejected(client):
    """Test that excessively long names are rejected"""
    very_long_name = "A" * 300  # 300 characters

    response = client.post(
        "/admin/auth/register",
        json={
            "email": "user@kings.edu.au",
            "password": "Password123!",
            "name": very_long_name,
        },
    )

    assert response.status_code == 400


def test_valid_names_accepted(client):
    """Test that valid names with various characters are accepted"""
    valid_names = [
        "John Doe",
        "Mary-Jane Smith",
        "O'Brien",
        "José García",
        "Anne-Marie",
    ]

    for name in valid_names:
        response = client.post(
            "/admin/auth/register",
            json={
                "email": f"user{ord(name[0])}@kings.edu.au",
                "password": "Password123!",
                "name": name,
            },
        )
        assert response.status_code == 200, f"Valid name '{name}' was rejected"
        clear_database()


# ===========================
# Missing Field Tests
# ===========================

def test_missing_email_field(client):
    """Test that missing email field is rejected"""
    response = client.post(
        "/admin/auth/register",
        json={
            "password": "Password123!",
            "name": "Test User",
        },
    )

    assert response.status_code == 400


def test_missing_password_field(client):
    """Test that missing password field is rejected"""
    response = client.post(
        "/admin/auth/register",
        json={
            "email": "user@kings.edu.au",
            "name": "Test User",
        },
    )

    assert response.status_code == 400


def test_missing_name_field(client):
    """Test that missing name field is rejected"""
    response = client.post(
        "/admin/auth/register",
        json={
            "email": "user@kings.edu.au",
            "password": "Password123!",
        },
    )

    assert response.status_code == 400


# ===========================
# Type Validation Tests
# ===========================

def test_email_wrong_type(client):
    """Test that non-string email is rejected"""
    response = client.post(
        "/admin/auth/register",
        json={
            "email": 12345,  # Integer instead of string
            "password": "Password123!",
            "name": "Test User",
        },
    )

    assert response.status_code == 400


def test_password_wrong_type(client):
    """Test that non-string password is rejected"""
    response = client.post(
        "/admin/auth/register",
        json={
            "email": "user@kings.edu.au",
            "password": 12345,  # Integer instead of string
            "name": "Test User",
        },
    )

    assert response.status_code == 400


def test_name_wrong_type(client):
    """Test that non-string name is rejected"""
    response = client.post(
        "/admin/auth/register",
        json={
            "email": "user@kings.edu.au",
            "password": "Password123!",
            "name": 12345,  # Integer instead of string
        },
    )

    assert response.status_code == 400
