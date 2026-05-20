"""
Pytest configuration and helpful messages for students.

This file configures pytest and displays encouraging messages during test runs.
"""

import pytest
import sys


def pytest_sessionstart(session):
    """Display welcome message before tests run"""
    config = session.config

    message = """
╔══════════════════════════════════════════════════════════════════════════════╗
║                  SECURE SOFTWARE ASSESSMENT - TEST SUITE                     ║
╚══════════════════════════════════════════════════════════════════════════════╝

  👋 IMPORTANT: Failing tests are EXPECTED and NORMAL!

  This application is intentionally insecure. Failing tests guide you to
  implement the required security features.

  📊 Expected Progress:
     • Initially:      ~20% passing (baseline functionality)
     • After Stage 1:  ~50-60% passing (password, validation, XSS)
     • After Stage 2:  ~75-85% passing (+ session security)
     • After Stage 3:  ~95-100% passing (+ CSRF protection)

  💡 Tips:
     • Focus on one test file at a time
     • Read test names to understand what's being checked
     • Use TESTING.md for detailed guidance
     • Run 'pytest -v' for verbose output
     • Run 'pytest -x' to stop at first failure

  🎯 You've got this! Each passing test is a security win!

═══════════════════════════════════════════════════════════════════════════════
"""

    # Only show message if not in quiet mode and not collecting
    verbose = config.option.verbose if hasattr(config.option, 'verbose') else 0
    collectonly = config.option.collectonly if hasattr(config.option, 'collectonly') else False

    if verbose >= 0 and not collectonly:
        print(message)


def pytest_terminal_summary(terminalreporter, exitstatus, config):
    """Display encouraging message after test run"""

    # Get test statistics
    passed = len(terminalreporter.stats.get('passed', []))
    failed = len(terminalreporter.stats.get('failed', []))
    total = passed + failed

    if total == 0:
        return

    percentage = (passed / total * 100) if total > 0 else 0

    # Determine stage and message based on pass percentage
    if percentage < 30:
        stage = "Starting Point"
        message = "Don't be discouraged! These failures show you what to implement."
        next_step = "Start with Stage 1: Password Hashing (test_password_security.py)"
    elif percentage < 50:
        stage = "Early Stage 1"
        message = "Good progress! Keep working on Stage 1 security features."
        next_step = "Complete input validation and XSS prevention tests"
    elif percentage < 65:
        stage = "Completing Stage 1"
        message = "Great work! You're mastering the basics of secure coding."
        next_step = "Finish remaining Stage 1 tests, then move to Stage 2"
    elif percentage < 80:
        stage = "Stage 2 Progress"
        message = "Excellent! Your security implementations are getting stronger."
        next_step = "Complete session token validation and security"
    elif percentage < 95:
        stage = "Stage 3 Progress"
        message = "Outstanding! You're implementing advanced security features."
        next_step = "Finish CSRF protection and HTTP-Only cookie implementation"
    else:
        stage = "Near Completion"
        message = "Amazing work! You've built a secure application!"
        next_step = "Review any remaining failures and ensure all tests pass"

    # Build the summary message
    summary = f"""
╔══════════════════════════════════════════════════════════════════════════════╗
║                           TEST RUN SUMMARY                                   ║
╚══════════════════════════════════════════════════════════════════════════════╝

  📈 Progress: {passed}/{total} tests passing ({percentage:.1f}%)
  🎯 Current Stage: {stage}

  {message}

  ➡️  Next Step: {next_step}

"""

    # Add stage-specific tips
    if percentage < 65:
        summary += """  💡 Stage 1 Tips:
     • Use werkzeug.security for password hashing
     • Validate inputs with regex patterns
     • Sanitise HTML with html.escape()
     • Check SECURITY_FEATURES.md for code examples

"""
    elif percentage < 80:
        summary += """  💡 Stage 2 Tips:
     • Use secrets.token_urlsafe() for secure tokens
     • Implement session validation in auth_core.py
     • Update frontend to use sessionStorage
     • Test with invalid/expired tokens

"""
    elif percentage < 95:
        summary += """  💡 Stage 3 Tips:
     • Generate CSRF tokens alongside session tokens
     • Set HTTP-Only cookies with response.set_cookie()
     • Validate X-CSRF-Token header on POST/PUT/DELETE
     • Use SameSite=Lax for cookie security

"""
    else:
        summary += """  🎉 Congratulations! You've implemented comprehensive security!
     • Run 'pytest --cov' to check code coverage
     • Review your implementation for any improvements
     • Test the application manually to ensure it works correctly

"""

    summary += "═══════════════════════════════════════════════════════════════════════════════\n"

    # Display the summary
    terminalreporter.write(summary)


def pytest_collection_modifyitems(config, items):
    """Add markers to tests to help identify their stage"""

    stage1_files = ['test_password_security.py', 'test_input_validation.py',
                    'test_xss_prevention.py', 'test_auth_register.py']
    stage2_files = ['test_session_security.py', 'test_auth_logout.py']
    stage3_files = ['test_csrf_protection.py']

    for item in items:
        # Get the test file name
        test_file = item.nodeid.split("::")[0].split("/")[-1]

        # Add markers based on file
        if test_file in stage1_files:
            item.add_marker(pytest.mark.stage1)
        elif test_file in stage2_files:
            item.add_marker(pytest.mark.stage2)
        elif test_file in stage3_files:
            item.add_marker(pytest.mark.stage3)


# Register custom markers
def pytest_configure(config):
    config.addinivalue_line("markers", "stage1: Stage 1 - Basic Security tests")
    config.addinivalue_line("markers", "stage2: Stage 2 - Session Management tests")
    config.addinivalue_line("markers", "stage3: Stage 3 - CSRF Protection tests")
