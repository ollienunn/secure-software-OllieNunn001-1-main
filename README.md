[![Review Assignment Due Date](https://classroom.github.com/assets/deadline-readme-button-22041afd0340ce965d47ae6ef1cefeee28c7c493a6346c4f15d667ab976d596c.svg)](https://classroom.github.com/a/ZBUhpRr9)
[![Open in Visual Studio Code](https://classroom.github.com/assets/open-in-vscode-2e0aaae1b6195c2367325f4f02e2d04e9abb55f0b24a779b69b11b9e10269abc.svg)](https://classroom.github.com/online_ide?assignment_repo_id=23887198&assignment_repo_type=AssignmentRepo)
# 12 SENG AT1 - Secure Software Assessment

## Overview

**Small-Brain** is an intentionally insecure quiz application designed as a hands-on security assessment. You are acting as a junior backend developer tasked with securing this Python Flask backend to meet modern web security standards.

> [!WARNING]
> This application contains **intentional security vulnerabilities** for educational purposes. Your task is to identify and fix these vulnerabilities across three progressive stages.

## Assessment Summary

This assessment is divided into **three progressive stages**:

### Stage 1 - Basic Security (Foundational)
- ✅ Implement password hashing and salting
- ✅ Add input validation to all API routes
- ✅ Sanitise user inputs to prevent XSS attacks

### Stage 2 - Intermediate Security (Session Management)
- ✅ Generate cryptographically secure session tokens
- ✅ Validate session tokens on protected routes
- ✅ Migrate from localStorage to sessionStorage in frontend

### Stage 3 - Advanced Security (CSRF Protection)
- ✅ Implement double-token CSRF protection
- ✅ Use HTTP-Only cookies for session tokens
- ✅ Validate CSRF tokens on state-changing requests

> [!TIP]
> Focus on understanding the "why" behind each security measure, not just implementing code. This knowledge is critical for your career.

## Important Documents

Before starting, please read:
- **[SPECIFICATIONS.md](SPECIFICATIONS.md)** - Detailed requirements for each stage
- **[SECURITY_FEATURES.md](SECURITY_FEATURES.md)** - Security implementation guide and code examples
- **[DOCUMENTATION.md](DOCUMENTATION.md)** - Project architecture and file structure
- **[TESTING.md](TESTING.md)** - Comprehensive testing guide and test expectations

## Quick Links

[![Setup for Mac/Linux](https://img.shields.io/badge/Setup%20Mac%2FLinux-000000?style=for-the-badge&logo=linux&logoColor=white)](#macos--linux)
[![Setup for Windows](https://img.shields.io/badge/Setup%20Windows-0078D6?style=for-the-badge&logo=windows&logoColor=white)](#manual-guide)
[![Run Frontend](https://img.shields.io/badge/Run%20Frontend-FF9800?style=for-the-badge&logo=javascript&logoColor=white)](#run-frontend)
[![Run Backend](https://img.shields.io/badge/Run%20Backend-4CAF50?style=for-the-badge&logo=python&logoColor=white)](#run-backend)
[![Testing](https://img.shields.io/badge/Testing-E91E63?style=for-the-badge&logo=pytest&logoColor=white)](#testing)

---

> [!NOTE]
> **If you are on MacOS**, run `setup.sh` to install and configure everything.
> **If you are on Windows**, follow the manual instructions below.


## Prerequisites

Before setting up the project, ensure you have the following installed:

### Node.js and npm

**macOS:**
```bash
# Option 1: Using Homebrew (recommended)
brew install node

# Option 2: Download from official website
# Visit https://nodejs.org/ and download the LTS version
```

**Windows:**
```bash
# Download the installer from https://nodejs.org/
# Run the installer and follow the setup wizard
# This will install both Node.js and npm
```

**Linux (Ubuntu/Debian):**
```bash
# Using NodeSource repository (recommended for latest version)
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
sudo apt-get install -y nodejs

# Or using default package manager
sudo apt update
sudo apt install nodejs npm
```

**Verify Installation:**
```bash
node --version
npm --version
```

### Python 3

Ensure you have Python 3 installed:
```bash
python3 --version
```

If not installed, download from [python.org](https://www.python.org/downloads/) or use your system's package manager.

---

## Quick Start (TL;DR)

**For experienced users who want to get started immediately:**

```bash
# macOS/Linux automatic setup
chmod +x setup.sh && ./setup.sh

# Manual setup (all platforms)
cd backend && pip install -r requirements.txt
cd ../frontend && npm install

# Run the application (use two terminals)
# Terminal 1 - Backend:
cd backend && python3 app.py

# Terminal 2 - Frontend:
cd frontend && npm run dev
```

Then open the URL shown in Terminal 2 (usually `http://localhost:5173`).

> [!IMPORTANT]
> Before coding, read [SPECIFICATIONS.md](SPECIFICATIONS.md) to understand what you need to implement!

---

## Understanding the Application Flow

Before you start coding, it's helpful to understand how the application works:

### User Registration & Login Flow
1. User navigates to `/register` and creates an account
2. Backend receives credentials and stores user in `database/users.database.json`
3. User navigates to `/login` and enters credentials
4. Backend validates credentials and generates a session token
5. Frontend stores token and uses it for authenticated requests
6. User can now access admin features (create quizzes, manage games)

### Quiz Game Flow
1. **Admin creates a quiz**: Add questions with multiple choice answers
2. **Admin starts a session**: Generates a unique game PIN
3. **Players join**: Enter the PIN to join the game lobby
4. **Admin starts the game**: Questions are displayed one at a time
5. **Players answer**: Submit answers within the time limit
6. **Results shown**: Leaderboard displays after each question

### API Request Flow
```
Frontend (React)
    ↓ API Request (with tokens)
Services Layer (services/*.js)
    ↓ HTTP Request
Backend Flask (app.py)
    ↓ Route Handler
Services (services/*.py)
    ↓ Business Logic
Core Logic (core/*.py)
    ↓ Data Access
Database (database/*.json)
```

### Testing Your Changes
After implementing each stage:
1. Register a new user and verify password is hashed (Stage 1)
2. Try invalid inputs and verify proper error handling (Stage 1)
3. Login and check token format in storage (Stage 2)
4. Try accessing protected routes without tokens (Stage 2)
5. Inspect browser cookies and headers (Stage 3)
6. Run `pytest` to verify backend tests pass

---

## MacOS
We have created a shell script to automate all frontend and backend depedencies.
```bash
$ chmod +x setup.sh
$ ./setup.sh
```


If your shells script executes without any failures, skip to [run backend](#RunBackend).


## Manual-Guide

### Step 1 — Clone the Repository
```bash
$ git clone https://github.com/your-username/your-repository.git
```
Replace with your actual repository URL.

### Step 2 — Open in VS Code
Open the cloned folder in Visual Studio Code.

### Step 3 — Install Backend
```bash
cd backend
pip install -r requirements.txt
```

### Step 4 — Install Frontend
Open a new terminal window:
```bash
cd frontend
npm install
```

## Execute App
### Run-Backend

1. Navigate to the backend folder:
```bash
$ cd backend
```

2. Start the server:
```bash
$ python3 app.py
```

3. The backend will run at:
```
http://127.0.0.1:8000
```
Leave this terminal running.

### Run-Frontend

1. Navigate to the frontend folder:
```bash
$ cd frontend
```

2. Start the development server:
```bash
$ npm run dev
```

3. Open the printed URL in your browser (e.g. `http://localhost:3000`).


## Project Structure

```
project/
│
├── README.md                    # This file - setup instructions
├── SPECIFICATIONS.md            # Assessment requirements and stages
├── SECURITY_FEATURES.md         # Security implementation guide
├── DOCUMENTATION.md             # Detailed project architecture
├── setup.sh                     # macOS/Linux auto-setup script
│
├── backend/                     # Python Flask API
│   ├── app.py                   # Main Flask application entry point
│   ├── requirements.txt         # Python dependencies
│   ├── classes/                 # Data structures (User, Error classes)
│   │   ├── User.py             # User class - STAGE 1 & 2 work here
│   │   └── Error.py            # Custom exception classes
│   ├── core/                    # Business logic layer
│   │   ├── auth_core.py        # Authentication logic - STAGE 2 & 3 (token validation)
│   │   ├── game_core.py        # Game management logic
│   │   └── player_core.py      # Player interaction logic
│   ├── services/                # API route handlers (controllers)
│   │   ├── auth.py             # /auth/* endpoints - STAGE 1 (input validation), STAGE 2 & 3
│   │   ├── game.py             # /game/* endpoints
│   │   └── player.py           # /player/* endpoints
│   ├── database/                # JSON file storage
│   │   ├── data.py             # Database helper functions
│   │   ├── users.database.json
│   │   ├── games.database.json
│   │   └── sessions.database.json
│   ├── tests/                   # Backend unit tests
│   │   ├── test_auth_register.py
│   │   ├── test_auth_login.py
│   │   └── ...
│   └── utils/                   # Utility functions
│
└── frontend/                    # React + Vite UI (pre-built)
    ├── package.json             # Node.js dependencies
    ├── src/
    │   ├── services/            # API calls - STAGE 2 & 3 modifications
    │   │   ├── auth.js         # Auth API calls - STAGE 2 & 3
    │   │   ├── game.js
    │   │   └── play.js
    │   ├── routes/              # Page components
    │   ├── components/          # Reusable UI components
    │   └── contexts/            # Global state management
    └── cypress/                 # End-to-end tests
```

## Testing

> [!IMPORTANT]
> **Failing tests are EXPECTED and NORMAL!** This application is intentionally insecure. The tests will guide you through implementing security features. Don't be discouraged by initial failures - they show you exactly what needs to be fixed!

### Backend Tests (PyTest)

Run all backend tests to verify your security implementations:

```bash
# From the project root directory
cd backend
pytest

# Run specific test file
pytest tests/test_auth_register.py

# Run with verbose output
pytest -v

# Run with coverage report
pytest --cov=. --cov-report=html

# Run only Stage 1 tests
pytest -m stage1

# Run only Stage 2 tests
pytest -m stage2

# Stop at first failure (helpful when debugging)
pytest -x
```

### Understanding Test Results

When you first run tests, you'll see approximately **73 failing tests**. This is **completely normal**!

The test suite includes helpful messages that show:
- ✅ Your current progress percentage
- 🎯 Which stage you're working on
- 💡 Tips for what to implement next
- ➡️ Clear next steps

**Expected Progress:**
- **Starting**: ~20% passing (20/93 tests)
- **After Stage 1**: ~50-60% passing (47-56/93 tests)
- **After Stage 2**: ~75-85% passing (70-79/93 tests)
- **After Stage 3**: ~95-100% passing (88-93/93 tests)

> [!TIP]
> Use failing tests as a roadmap! Each test name describes what security feature needs to be implemented. Read the test code to understand exactly what's expected.

### Frontend Tests

```bash
cd frontend

# Run unit tests (Vitest)
npm run test

# Run end-to-end tests (Cypress)
npm run cypress:open
```

## Key Areas to Modify

Based on the assessment stages, you'll primarily work in these files:

### Stage 1 (Basic Security)
- `backend/classes/User.py` - Password hashing
- `backend/services/auth.py` - Input validation (email, password, name validation)
- `backend/services/*.py` - Input sanitisation across all routes (XSS prevention)

### Stage 2 (Intermediate Security)
- `backend/classes/User.py` - Secure token generation
- `backend/core/auth_core.py` - Session token validation
- `frontend/src/services/auth.js` - Change localStorage to sessionStorage
- `frontend/src/services/game.js` - Update token storage
- `frontend/src/services/play.js` - Update token storage

### Stage 3 (Advanced Security)
- `backend/core/auth_core.py` - CSRF token generation and validation
- `backend/services/*.py` - HTTP-Only cookie implementation
- `frontend/src/services/*.js` - CSRF token header inclusion

> [!IMPORTANT]
> You **do NOT need to modify** `.jsx` files in the frontend. Only modify `.js` files in `frontend/src/services/` for Stages 2-3.

## Troubleshooting

### Backend Issues

**Problem: `ModuleNotFoundError` when running tests**
```bash
# Solution: Ensure you're in the backend directory and dependencies are installed
cd backend
pip install -r requirements.txt
pytest
```

**Problem: Port 8000 already in use**
```bash
# Solution: Kill the process using port 8000
# macOS/Linux:
lsof -ti:8000 | xargs kill -9

# Windows:
netstat -ano | findstr :8000
taskkill /PID <PID> /F
```

**Problem: `werkzeug` or other module not found**
```bash
# Solution: Reinstall dependencies
pip install -r requirements.txt
```

### Frontend Issues

**Problem: `npm install` fails**
```bash
# Solution: Clear npm cache and retry
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

**Problem: Port 3000/5173 already in use**
```bash
# Solution: Kill the process or use a different port
# macOS/Linux:
lsof -ti:5173 | xargs kill -9

# Or specify a different port
npm run dev -- --port 3001
```

**Problem: Frontend can't connect to backend**
- Ensure backend is running at `http://127.0.0.1:8000`
- Check `frontend/backend.config.json` for correct backend URL
- Verify no CORS errors in browser console

### Database Issues

**Problem: Database appears corrupted or has invalid data**
```bash
# Solution: Clear and reset the database
cd backend
./clear.sh

# Or manually delete and restart:
rm database/*.json
python3 app.py  # This will recreate empty database files
```

### Common Mistakes to Avoid

**Stage 1 Mistakes:**
- ❌ Storing passwords as plain text or using weak hashing (MD5, SHA1)
- ✅ Use `werkzeug.security.generate_password_hash()` with default settings
- ❌ Forgetting to validate inputs on the backend (only validating client-side)
- ✅ Always validate on the server; never trust client input
- ❌ Not escaping HTML special characters in user inputs
- ✅ Use proper sanitisation libraries or functions

**Stage 2 Mistakes:**
- ❌ Using predictable tokens (timestamps, sequential numbers)
- ✅ Use `secrets.token_urlsafe()` for cryptographically secure tokens
- ❌ Not validating session tokens on every protected route
- ✅ Create middleware or decorators to validate tokens consistently
- ❌ Forgetting to update all API calls in frontend when switching to sessionStorage
- ✅ Search for all `localStorage` references in `frontend/src/services/`

**Stage 3 Mistakes:**
- ❌ Only setting cookies without CSRF tokens (vulnerable to CSRF)
- ✅ Implement both HTTP-Only cookies AND CSRF token validation
- ❌ Setting `SameSite=Strict` (will break legitimate navigation)
- ✅ Use `SameSite=Lax` as specified
- ❌ Not including CSRF token in request headers
- ✅ Add `X-CSRF-Token` header to all POST/PUT/DELETE requests
- ❌ Validating CSRF token only on some routes
- ✅ Validate on ALL state-changing operations

## Submission Checklist

Before submitting your assessment, ensure:

- [ ] All three stages are completed (or as many as possible)
- [ ] Backend tests are passing (`pytest` in backend directory)
- [ ] Application runs without errors
- [ ] You can register a new user successfully
- [ ] You can login with correct credentials
- [ ] Login fails with incorrect credentials
- [ ] Session tokens are being generated securely (Stage 2)
- [ ] CSRF protection is implemented (Stage 3)
- [ ] Code is well-documented with comments explaining security decisions
- [ ] No sensitive information (passwords, keys) in code or git history
- [ ] All modified files are committed to your repository

## Resources and Helpful Links

### Security Concepts
- [OWASP Top 10](https://owasp.org/www-project-top-ten/) - Common web security vulnerabilities
- [OWASP Cheat Sheet Series](https://cheatsheetseries.owasp.org/) - Security implementation guides
- [OWASP Input Validation](https://cheatsheetseries.owasp.org/cheatsheets/Input_Validation_Cheat_Sheet.html)
- [OWASP CSRF Prevention](https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html)

### Python/Flask Security
- [Werkzeug Security Documentation](https://werkzeug.palletsprojects.com/en/stable/utils/#module-werkzeug.security) - Password hashing
- [Flask Security Best Practices](https://flask.palletsprojects.com/en/stable/security/)
- [Python Secrets Module](https://docs.python.org/3/library/secrets.html) - Secure token generation

### Testing
- [PyTest Documentation](https://docs.pytest.org/) - Backend testing framework
- [Flask Testing](https://flask.palletsprojects.com/en/stable/testing/) - Testing Flask applications

### General Web Security
- [MDN Web Security](https://developer.mozilla.org/en-US/docs/Web/Security) - Comprehensive web security guide
- [Content Security Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)
- [HTTP Cookies Security](https://developer.mozilla.org/en-US/docs/Web/HTTP/Cookies)

## Tips for Success

- **Read the specifications first** - Understand all requirements before starting
- **Work through stages sequentially** - Don't skip ahead; each stage builds on the previous
- **Use the security features guide** - `SECURITY_FEATURES.md` contains code examples
- **Test frequently** - Run tests after each change to catch issues early
- **Keep terminals separate** - Run backend and frontend in different terminal windows
- **Commit often** - Save your progress regularly with meaningful commit messages
- **Ask for help** - If stuck, review Canvas modules or consult with instructors
- **Focus on backend** - Most work is in the backend; frontend changes are minimal

## Getting Help

If you encounter issues:
1. Check the [Troubleshooting](#troubleshooting) section above
2. Review the specification documents for clarification
3. Consult Canvas course materials and lecture slides
4. Reach out to your instructor or teaching assistants

---

Good luck with your assessment! Remember, the goal is to learn secure coding practices that you'll use throughout your career as a software developer.
