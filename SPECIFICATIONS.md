# 12 SENG AT1 - Secure Software 

## Table of Contents

[![Assessment Overview](https://img.shields.io/badge/Assessment%20Overview-9C27B0?style=for-the-badge&logo=readme&logoColor=white)](#assessment-overview)
[![Stage 1 - Basic](https://img.shields.io/badge/Stage%201%20--%20Basic-2196F3?style=for-the-badge&logo=security&logoColor=white)](#stage-1---basic)
[![Stage 2 - Intermediate](https://img.shields.io/badge/Stage%202%20--%20Intermediate-FF9800?style=for-the-badge&logo=security&logoColor=white)](#stage-2---intermediate)
[![Stage 3 - Advanced](https://img.shields.io/badge/Stage%203%20--%20Advanced-4CAF50?style=for-the-badge&logo=security&logoColor=white)](#stage-3---advanced)

[![Canvas Assessment](https://img.shields.io/badge/Canvas%20Assessment-FF0000?style=for-the-badge&logo=canvas&logoColor=white)](https://canvas.kings.edu.au/courses/10579/assignments)  

## Assessment Overview
Modern web applications are increasingly being scrutinised in areas of security and trust. In real-world development, backend developers play a crucial role in ensuring that applications meet best-practice security standards.

### Task

In this task, you are acting as a junior backend developer for a pre-built quiz application called "Small-Brain". You are tasked with securing the backend to modern web security standards. 

You are provided an insecure Python Flask API backend. Your task is to secure the backend across **three** stages - each stage with increasing difficulty.

Submission will be completed as per the  Canvas assignment module. 

> [!WARNING]
> The `frontend/` is a pre-built React-Vite UI for the backend application. 
> - You will NOT need to modify any of the `.jsx` files.
> - Stages 2-3 will require basic modification of modern JavaScript (JS). 
> - The frontend may contain minor bugs, but these should not impact your ability to secure the backend. It is provided primarily as a reference to illustrate how the backend and frontend interact.

### 
In your back-end, some basic unit tests have been written in the `backend/tests/` directory. 
Many tests will initially fail. However, as you progress through each stage, the number of ailing tests should decrease.

## Stage 1 - Basic
> [!IMPORTANT]
> Stage 1 covers the basics of security. 
> If you are struggling with Stage 1, it is highly suggested to revise your Canvas modules and slides before attempting further. 

### Stage 1.1 - Password Hashing

**Security Features to Implement:** Confidentiality

To begin the assignment, you will refactor the Python `User` class to ensure that the user's password is hashed using secure cryptographic methods before being stored.

- **Location:** Inside the `classes` folder, modify the `User.py` file.

**Specifications:**

Your implementation must include the following security features:

1. **Confidentiality**
    - The current `self.__password` attribute is stored as plain text, a security vulnerability that may compromise confidential user information.
    - Update this attribute such that the password is NEVER stored as plain text in our database. 

2. **Authentication**
    - Update the `verify_password` method to verify with the hashed version of the user's password. 

> [!NOTE]
> You are required to hash and salt the password.
> Consider using the `werkzeug.security` [module](https://werkzeug.palletsprojects.com/en/stable/utils/#module-werkzeug.security). 

**Example:**
```python
# create a new user with email and password
user = User(email="rianni@kings.edu.au", first_name="Rocco", last_name="Ianni", password="Ilovesoftware1")

# verify the password
password_attempt = "Ilovesoftware1"
if user.verify_password(password_attempt):
    print("Password verification successful.")
else:
    print("Password verification failed.")
```


### Stage 1.2 - Input Validation

**Security Features Addressed:** Integrity, Accountability

Implement input validation to ensure that all data received from the user client-side frontend (from an API request) meets specific criteria before being sent to the backend.

For each route, implement necessary input validation and sanitisation measures to protect the backend prior to persisting any data. Provide a clear justification for each decision in your documentation.

- **Location:** Inside the `services` folder, modify the `auth.py` file (specifically the `auth_register_user` and `auth_login_user` functions).
- **Server Routes:** The API routes are defined in `app.py` (e.g., `/admin/auth/register/`), but the validation logic should be implemented in the service layer (`services/auth.py`).

**Example: Handling Invalid Email Input**
```python
from classes.Error import InputError

def auth_register_user(email):
    email = email.lower()  # handle lower-case
    if email in users_dictionary:
        raise InputError("Email already exists.")
```

>[!TIP]
> Use the `InputError` or `AccessError` exception class to handle any error exceptions with the error message as the input.
> InputError - raises 400 (Bad Request) for invalid input.
> AccessError - raises 403 (Forbidden) for unauthorized access.

### Stage 1.3 - Input Sanitisation (XSS Vulnerabilities)

**Vulnerabilities Addressed:** Cross-site Scripting (XSS)

Similar to Stage 1.2, your task is to sanitise any potentially harmful user input to minimise cross-site scripting (XSS) attacks. Implement this across all routes that retrieve data from user inputs. 

> [!warning]
> Our frontend framework automatically sanitises all input. However, you are still expected to sanitise these to protect against 3rd-party or external API calls. 

**Example: Sanitising User Input**
```python
new_user = {
    ...
    'email': 'mienna@kings.edu.au',
    'first_name': '&lt;script&gt;alert(\'XSS Attack!\');&lt;/script&gt;',
    ...
}
```

## Stage 2 - Intermediate
In Stage 2, we focus on securing our app on both the frontend and backend.  

### Stage 2.1 – Invalid Forwarding

**Vulnerability Addressed:** Token Spoofing / Session Forgery

Currently, the frontend allows users to render restricted pages by manually modifying the URL. This bypasses intended access control mechanisms.

To address this, you must validate the session token for **every protected route** (excluding player, login, and register routes):

- Check if the provided session token matches a valid session in your backend database.
- If the token is invalid or missing, return the response: `"Invalid session token"`.

If implemented correctly, the frontend should automatically redirect the user back to the login page.

- **Location:** Modify `app.py` (Flask middleware function `flask_middle_auth`) to extract and validate tokens
- **Location:** Modify `core/auth_core.py` (implement the `authorise_user` function to validate session tokens)

> [!TIP]
> Consider using Flask middleware to ensure a separation of concerns in our backend codebase.
---

### Stage 2.2 – Session Management

**Vulnerability Addressed:** Broken Authentication, Insecure Token Storage

You will enhance session security by upgrading how session tokens are generated and stored.

**Specifications:**

1. **Cryptographically Secure Tokens**  
   - Modify the `__generate_token()` method in the `User` class to use a secure, base64-encoded token (e.g., via `secrets.token_urlsafe()`).

2. **Frontend Adjustments**  
   - The current frontend stores session tokens in `localStorage`, which increases exposure to XSS and CSRF attacks.
   - **Update the frontend to store session tokens in `sessionStorage`** instead. This limits persistence and reduces attack surface in shared devices or tab reuse.

   ```javascript
    // Example: Setting tokens after login
    export const adminAuthLogin = async (email, password) => {
        const body = { email, password };
        const response = await requestBackend("POST", "admin/auth/login", null, body, null);

        if (response.error) {
            throw new Error(response.error);
        }
        // Store tokens in sessionStorage
        sessionStorage.setItem("session_token", response.session_token);
        sessionStorage.setItem("csrf_token", response.csrf_token);

        return response;
    };

    // Example: Retrieving tokens to call a protected route
    export const getAllGames = async () => {
        const tokens = {
            sessionToken: sessionStorage.getItem("session_token"),
            csrfToken: sessionStorage.getItem("csrf_token")
        };

        return await requestBackend("GET", "admin/games", tokens, null, null);
    };
   ```

> [!TIP]
> - Unlike `localStorage`, `sessionStorage` is cleared when the tab is closed and is inaccessible across tabs — providing a safer default for session-based authentication.
> - Your frontend API calls to your backend are located in `frontend/src/services/`. 

## Stage 3 - Advanced

**Security Features Addressed:** Authenticity, Integrity

In this stage, you will secure your application against **Cross-Site Request Forgery (CSRF)** attacks using a **double-token strategy**.

This method helps ensure that only trusted client-side scripts can make authenticated requests on behalf of a user.

**Locations:**
- `backend/classes/User.py` - Generate CSRF tokens in `initiate_user_session()` method
- `backend/core/auth_core.py` - Validate CSRF tokens in `authorise_user()` function
- `backend/app.py` - Set HTTP-Only cookies in login/register routes and validate CSRF in middleware
- `frontend/src/services/*.js` - Include CSRF token in request headers

**Implementation Details:**

- **Session Token**
  Store the user's session token in an **HTTP-Only cookie**, making it inaccessible to JavaScript and protected against XSS attacks.
  - Set this as `samesite="lax"`.


- **CSRF Token**
  Generate a **CSRF token** on each session and:
  - Store it in the browser's `sessionStorage`
  - Include it manually in every `POST`, `PUT`, or `DELETE` request via a custom header (e.g., `X-CSRF-Token`)
  - Validate it server-side by comparing it to the value in the user's session

**Example: Verifying CSRF Token on the Backend**

```python
from flask import Flask, request, make_response
from classes.Error import AccessError

@app.route('/resource', methods=['POST'])
def secure_post():
    client_token = request.headers.get("X-CSRF-Token")
    server_token = session.get("csrf_token")

    if client_token != server_token:
        raise AccessError("CSRF token mismatch.")
    
    # Proceed with secure logic
```
> [!TIP]
> Store the CSRF token in the browser’s sessionStorage and send it in a custom header (e.g., X-CSRF-Token) on all unsafe requests (POST, PUT, DELETE).
> This ensures only your frontend code can perform authenticated actions.

**Example: Setting HTTP-Only Cookies**

```python
from flask import jsonify, request

@catch_errors
@app.route("/login")
def login():
    session_token = "abc123"
    csrf_token = "xyz789"

    # jsonify() already returns a response
    response = jsonify({"csrf_token": csrf_token})

    # attach session_token as HTTP-only cookie
    response.set_cookie("session_token", session_token, httponly=True, samesite="Lax", secure=True)

    return resp
```

> [!WARNING]
> Relying solely on session cookies is not enough. Attackers can forge requests that include valid cookies.
> Always use CSRF tokens validated on the server to prevent unauthorised actions.
> Since we manually set CSRF tokens, we dont need our SameSite prevention to be 'strict'. 

## Extension Stage
> [!NOTE]
> **Stage 4 is an _extension_ task rewards 0 marks.**
>
> The extension stage is designed for students who wish to further challenge themselves. 

Flask is a Python web application framework designed for lightweight and small-scale applications, making it well-suited for prototyping and rapid development. By default, Flask applications are synchronous, processing each request sequentially, meaning the chances of race conditions occurring are relatively low.

**Your task is to refactor the backend application to enable asynchronous operations AND prevent race-conditions** 
- You are **not required to test every route** for race conditions.  
- Instead, focus on experimenting with **one or two routes** by adding a slight delay (e.g. `asyncio.sleep`) to simulate I/O latency.

This will help verify that **concurrent requests do not overlap at the start**, confirming that your asynchronous logic (e.g. locks) is working as intended.

> [!TIP]
> - Use Python's [`asyncio`](https://docs.python.org/3/library/asyncio.html) for asynchronous operations and [`aiofile`](https://github.com/Tinche/aiofiles) for async file I/O:
>   - Use locks to prevent async requests from accessing the same database resource.
> - Refactor the [Flask](https://flask.palletsprojects.com/en/stable/) backend into [Quart](https://quart.palletsprojects.com/en/latest/) framework — a Flask-compatible ASGI framework.
>   - Define your API-level functions with keywords `async` and `await`. 
> - You should _deploy_ this stage using a **Hypercorn** server.
> - Your app should still work correctly with these adjustments.
