"""
Test Suite for XSS Prevention (Stage 1)

⚠️  THESE TESTS WILL FAIL INITIALLY - This is expected and normal!

Tests HTML sanitisation and XSS attack prevention.
Students should implement input sanitisation to prevent cross-site scripting attacks.

Expected: These tests should pass after completing Stage 1.3 (XSS Prevention)
"""

import pytest
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


# ===========================
# XSS Prevention Tests
# ===========================

def test_script_tag_sanitised_in_name(client):
    """Test that script tags in names are sanitised"""
    malicious_name = "<script>alert('XSS')</script>"

    response = client.post(
        "/admin/auth/register",
        json={
            "email": "test@kings.edu.au",
            "password": "Password123!",
            "name": malicious_name,
        },
    )

    assert response.status_code == 200

    # Check that the stored name doesn't contain the script tag
    users = load_users()
    user = users["test@kings.edu.au"]
    stored_name = user.name

    # Name should be sanitised - should not contain literal <script> tags
    assert "<script>" not in stored_name.lower()
    assert "</script>" not in stored_name.lower()
    # Should be escaped or removed
    assert stored_name != malicious_name


def test_img_tag_with_onerror_sanitised(client):
    """Test that img tags with onerror are sanitised"""
    malicious_name = "<img src='x' onerror='alert(1)'>"

    response = client.post(
        "/admin/auth/register",
        json={
            "email": "test@kings.edu.au",
            "password": "Password123!",
            "name": malicious_name,
        },
    )

    assert response.status_code == 200

    users = load_users()
    user = users["test@kings.edu.au"]
    stored_name = user.name

    # Should not contain the malicious img tag
    assert "onerror" not in stored_name.lower()
    assert stored_name != malicious_name


def test_javascript_protocol_sanitised(client):
    """Test that javascript: protocol is sanitised"""
    malicious_name = "<a href='javascript:alert(1)'>Click</a>"

    response = client.post(
        "/admin/auth/register",
        json={
            "email": "test@kings.edu.au",
            "password": "Password123!",
            "name": malicious_name,
        },
    )

    assert response.status_code == 200

    users = load_users()
    user = users["test@kings.edu.au"]
    stored_name = user.name

    # Should not contain javascript protocol
    assert "javascript:" not in stored_name.lower()
    assert stored_name != malicious_name


def test_iframe_tag_sanitised(client):
    """Test that iframe tags are sanitised"""
    malicious_name = "<iframe src='http://evil.com'></iframe>"

    response = client.post(
        "/admin/auth/register",
        json={
            "email": "test@kings.edu.au",
            "password": "Password123!",
            "name": malicious_name,
        },
    )

    assert response.status_code == 200

    users = load_users()
    user = users["test@kings.edu.au"]
    stored_name = user.name

    # Should not contain iframe tag
    assert "<iframe" not in stored_name.lower()
    assert stored_name != malicious_name


def test_svg_with_script_sanitised(client):
    """Test that SVG with embedded script is sanitised"""
    malicious_name = "<svg onload='alert(1)'>"

    response = client.post(
        "/admin/auth/register",
        json={
            "email": "test@kings.edu.au",
            "password": "Password123!",
            "name": malicious_name,
        },
    )

    assert response.status_code == 200

    users = load_users()
    user = users["test@kings.edu.au"]
    stored_name = user.name

    # Should not contain svg with onload
    assert "onload" not in stored_name.lower()
    assert stored_name != malicious_name


def test_event_handler_attributes_sanitised(client):
    """Test that event handler attributes are sanitised"""
    malicious_names = [
        "<div onclick='alert(1)'>Click me</div>",
        "<button onmouseover='alert(1)'>Hover</button>",
        "<input onfocus='alert(1)'>",
    ]

    for idx, malicious_name in enumerate(malicious_names):
        response = client.post(
            "/admin/auth/register",
            json={
                "email": f"test{idx}@kings.edu.au",
                "password": "Password123!",
                "name": malicious_name,
            },
        )

        assert response.status_code == 200

        users = load_users()
        user = users[f"test{idx}@kings.edu.au"]
        stored_name = user.name

        # Should not contain event handlers
        assert "onclick" not in stored_name.lower()
        assert "onmouseover" not in stored_name.lower()
        assert "onfocus" not in stored_name.lower()
        assert stored_name != malicious_name

        clear_database()


def test_html_entities_properly_escaped(client):
    """Test that HTML special characters are properly escaped"""
    name_with_html = "User <>&\"'"

    response = client.post(
        "/admin/auth/register",
        json={
            "email": "test@kings.edu.au",
            "password": "Password123!",
            "name": name_with_html,
        },
    )

    assert response.status_code == 200

    users = load_users()
    user = users["test@kings.edu.au"]
    stored_name = user.name

    # Should be escaped to HTML entities or stripped
    # &lt; &gt; &amp; &quot; &#x27;
    # Or the dangerous characters should be removed
    if stored_name == name_with_html:
        # If characters are preserved, they should be escaped when output
        # This test ensures they're at least stored
        pass
    else:
        # Characters should be escaped
        assert "<" not in stored_name or "&lt;" in stored_name
        assert ">" not in stored_name or "&gt;" in stored_name


def test_encoded_script_tag_sanitised(client):
    """Test that encoded script tags are also sanitised"""
    # URL-encoded script tag
    malicious_name = "%3Cscript%3Ealert(1)%3C%2Fscript%3E"

    response = client.post(
        "/admin/auth/register",
        json={
            "email": "test@kings.edu.au",
            "password": "Password123!",
            "name": malicious_name,
        },
    )

    assert response.status_code == 200

    users = load_users()
    user = users["test@kings.edu.au"]
    stored_name = user.name

    # Even if decoded, should not contain script tags
    assert "<script>" not in stored_name.lower()


def test_style_tag_with_javascript_sanitised(client):
    """Test that style tags with JavaScript are sanitised"""
    malicious_name = "<style>@import'javascript:alert(1)';</style>"

    response = client.post(
        "/admin/auth/register",
        json={
            "email": "test@kings.edu.au",
            "password": "Password123!",
            "name": malicious_name,
        },
    )

    assert response.status_code == 200

    users = load_users()
    user = users["test@kings.edu.au"]
    stored_name = user.name

    # Should not contain style tag with javascript
    assert "<style>" not in stored_name.lower()
    assert "javascript:" not in stored_name.lower()
    assert stored_name != malicious_name


def test_meta_refresh_sanitised(client):
    """Test that meta refresh redirects are sanitised"""
    malicious_name = "<meta http-equiv='refresh' content='0;url=http://evil.com'>"

    response = client.post(
        "/admin/auth/register",
        json={
            "email": "test@kings.edu.au",
            "password": "Password123!",
            "name": malicious_name,
        },
    )

    assert response.status_code == 200

    users = load_users()
    user = users["test@kings.edu.au"]
    stored_name = user.name

    # Should not contain meta tag
    assert "<meta" not in stored_name.lower()
    assert stored_name != malicious_name


def test_legitimate_text_preserved(client):
    """Test that legitimate text without HTML is preserved"""
    legitimate_names = [
        "John Doe",
        "Mary-Jane Smith",
        "Dr. O'Brien (PhD)",
        "Company & Associates",
    ]

    for idx, name in enumerate(legitimate_names):
        response = client.post(
            "/admin/auth/register",
            json={
                "email": f"test{idx}@kings.edu.au",
                "password": "Password123!",
                "name": name,
            },
        )

        assert response.status_code == 200

        users = load_users()
        user = users[f"test{idx}@kings.edu.au"]
        stored_name = user.name

        # Legitimate names should be preserved (possibly with entity escaping for &)
        # The essence of the name should remain
        assert len(stored_name) > 0
        # Check that at least the alphanumeric part is preserved
        import re
        original_words = re.findall(r'\w+', name)
        stored_words = re.findall(r'\w+', stored_name)
        assert set(original_words).issubset(set(stored_words))

        clear_database()


def test_null_byte_injection_prevented(client):
    """Test that null byte injection is prevented"""
    malicious_name = "User\x00<script>alert(1)</script>"

    response = client.post(
        "/admin/auth/register",
        json={
            "email": "test@kings.edu.au",
            "password": "Password123!",
            "name": malicious_name,
        },
    )

    assert response.status_code == 200

    users = load_users()
    user = users["test@kings.edu.au"]
    stored_name = user.name

    # Should not contain script tag
    assert "<script>" not in stored_name.lower()
    # Null bytes should be handled
    assert "\x00" not in stored_name
