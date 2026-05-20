# Testing Guide for Secure Software Assessment

This document explains the testing suite and which tests students should expect to pass at each stage of the assessment.

## Running Tests

> [!IMPORTANT]
> **Don't be discouraged by failing tests!** The test suite includes encouraging messages that show your progress, provide tips, and guide you through each stage. Every time you run tests, you'll see helpful feedback!

### Run All Tests
```bash
cd backend
pytest
```

You'll see:
- 📊 A welcome message explaining that failing tests are normal
- ✅ Your current progress percentage
- 🎯 Which stage you're currently working on
- 💡 Specific tips for what to implement next
- ➡️  Clear guidance on your next steps

### Run Tests with Verbose Output
```bash
pytest -v
```

### Run Specific Test File
```bash
pytest tests/test_password_security.py
pytest tests/test_input_validation.py
```

### Run Tests by Stage
```bash
# Run only Stage 1 tests
pytest -m stage1

# Run only Stage 2 tests
pytest -m stage2

# Run only Stage 3 tests
pytest -m stage3
```

### Run Tests with Coverage Report
```bash
pytest --cov=. --cov-report=html
```

This generates an HTML report in `htmlcov/index.html` showing which lines of code are tested.

## Test Organisation

Tests are organised by security stage:

### Stage 1 - Basic Security
- `test_password_security.py` - Password hashing and verification
- `test_input_validation.py` - Email, password, and name validation
- `test_xss_prevention.py` - HTML sanitisation and XSS prevention
- `test_auth_register.py` - Basic registration tests
- `test_auth_login.py` - Basic login tests

### Stage 2 - Intermediate Security
- `test_session_security.py` - Session token generation and validation
- `test_auth_logout.py` - Logout functionality (partially Stage 2)

### Stage 3 - Advanced Security
- `test_csrf_protection.py` - CSRF token and HTTP-Only cookie tests

### Other Tests
- `test_game_create.py` - Game creation functionality
- `test_game_mutate.py` - Game state management
- `test_game_session.py` - Game session handling
- `test_player.py` - Player functionality

## Expected Test Results by Stage

### Before Starting (Insecure Baseline)

Initially, you should see approximately **19-25 failing tests**. This is expected as the application is intentionally insecure.

Key failures will include:
- Password stored as plain text
- No input validation
- Insecure token generation
- No session validation
- No CSRF protection

### After Completing Stage 1

You should see these test files **PASSING**:
- ✅ `test_password_security.py` (all tests)
- ✅ `test_input_validation.py` (all tests)
- ✅ `test_xss_prevention.py` (all tests)
- ✅ `test_auth_register.py` (all tests)
- ✅ `test_auth_login.py` (basic login tests)

Expected passing rate: **~50-60% of all tests**

Tests that may still fail:
- ❌ Session validation tests (not yet implemented)
- ❌ CSRF protection tests (not yet implemented)
- ❌ Some game/player tests requiring session validation

### After Completing Stage 2

You should additionally see these test files **PASSING**:
- ✅ `test_session_security.py` (all tests)
- ✅ `test_auth_logout.py` (all tests)
- ✅ `test_game_create.py` (if using proper session tokens)
- ✅ Additional game and player tests

Expected passing rate: **~75-85% of all tests**

Tests that may still fail:
- ❌ CSRF protection tests (not yet implemented)
- ❌ HTTP-Only cookie tests

### After Completing Stage 3

You should see **ALL tests PASSING**:
- ✅ `test_csrf_protection.py` (all tests)
- ✅ All remaining game and player tests

Expected passing rate: **~95-100% of all tests**

## Understanding Test Failures

### Reading Test Output

When a test fails, pytest provides detailed information:

```
FAILED tests/test_password_security.py::test_password_not_stored_as_plaintext
```

This tells you:
- **File**: `test_password_security.py`
- **Test**: `test_password_not_stored_as_plaintext`

### Common Failure Patterns

#### Stage 1 Failures

**AssertionError: Password stored as plain text**
```python
assert user_dict["password_hash"] != password
```
**Fix**: Implement password hashing in `User.__init__()` using `werkzeug.security.generate_password_hash()`

**AssertionError: Invalid email accepted**
```python
assert response.status_code == 400
```
**Fix**: Add email validation in `auth_register_user()` using regex patterns

**AssertionError: XSS script tag not sanitised**
```python
assert "<script>" not in stored_name.lower()
```
**Fix**: Sanitise user inputs using `html.escape()` or similar

#### Stage 2 Failures

**AssertionError: Insecure token pattern detected**
```python
assert not token.startswith("insecure_token_")
```
**Fix**: Use `secrets.token_urlsafe()` in `User.__generate_token()`

**AssertionError: Invalid token accepted**
```python
assert response.status_code in [401, 403]
```
**Fix**: Implement session validation in `authorise_user()` function

#### Stage 3 Failures

**AssertionError: CSRF token not found**
```python
assert "csrf_token" in data
```
**Fix**: Generate and return CSRF token in login/register responses

**AssertionError: HttpOnly cookie not set**
```python
assert "HttpOnly" in session_cookie
```
**Fix**: Use `response.set_cookie()` with `httponly=True` parameter

## Test Coverage Goals

Aim for these minimum coverage percentages:

| Component | Minimum Coverage |
|-----------|------------------|
| `classes/User.py` | 90% |
| `core/auth_core.py` | 85% |
| `services/auth.py` | 80% |
| `services/game.py` | 75% |
| `services/player.py` | 75% |

## Writing Your Own Tests

While not required, students are encouraged to write additional tests for:
- Edge cases specific to their implementation
- Additional input validation scenarios
- Integration tests across multiple components

### Example Custom Test

```python
def test_my_custom_scenario(client):
    """Test a specific edge case"""
    response = client.post(
        "/admin/auth/register",
        json={
            "email": "custom@test.com",
            "password": "CustomPass123!",
            "name": "Custom User",
        },
    )
    assert response.status_code == 200
    # Add your assertions here
```

## Debugging Failed Tests

### Step 1: Read the Error Message
```python
>       assert user_dict["password_hash"] != password
E       AssertionError: assert 'MyPassword123!' != 'MyPassword123!'
```

This shows the password is being stored as plain text.

### Step 2: Check the Test Code
Read the test to understand what it's checking:
```python
def test_password_not_stored_as_plaintext(client):
    """Test that passwords are hashed, not stored as plain text"""
```

### Step 3: Identify the Fix Location
The error relates to password storage, so check:
- `classes/User.py` - `__init__` method
- Where password is assigned

### Step 4: Implement the Fix
```python
# Before (insecure):
self.__password = password

# After (secure):
from werkzeug.security import generate_password_hash
self.__password = generate_password_hash(password)
```

### Step 5: Re-run the Test
```bash
pytest tests/test_password_security.py::test_password_not_stored_as_plaintext -v
```

## Continuous Testing

**Best Practice**: Run tests after each change

```bash
# Watch mode (re-runs tests on file changes)
pytest-watch

# Or use a simple loop
while true; do clear; pytest -x; sleep 2; done
```

The `-x` flag stops at the first failure, helping you focus on one issue at a time.

## Test-Driven Development (TDD)

For advanced students, consider using TDD:

1. **Red**: Run tests - they fail ❌
2. **Green**: Write code to make tests pass ✅
3. **Refactor**: Improve code while keeping tests passing

This ensures your security implementations are correct from the start.

## CI/CD Integration

For extension work, students can set up automated testing:

```yaml
# .github/workflows/test.yml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Install dependencies
        run: pip install -r requirements.txt
      - name: Run tests
        run: pytest
```

## Common Questions

### Q: Why are so many tests failing initially?
**A**: The application is intentionally insecure. Tests failing is expected and helps guide your implementation.

### Q: Should I modify the test files?
**A**: No. Tests represent the security requirements. Modify your implementation, not the tests.

### Q: What if a test seems wrong?
**A**: Tests are carefully designed. If you believe there's an error, consult with your instructor first.

### Q: Can I skip tests?
**A**: No. All tests must pass for full marks. Passing tests demonstrates secure implementation.

### Q: How do I test frontend changes?
**A**: Use the frontend test suite:
```bash
cd frontend
npm run test  # Unit tests
npm run cypress:open  # E2E tests
```

## Getting Help

If you're stuck on a failing test:
1. Read the test code to understand what it's checking
2. Review the security features guide (SECURITY_FEATURES.md)
3. Check the specifications (SPECIFICATIONS.md)
4. Consult Canvas materials
5. Ask your instructor or teaching assistants

---

**Remember**: Tests are your friends! They tell you exactly what needs to be fixed and confirm when your implementation is secure.
