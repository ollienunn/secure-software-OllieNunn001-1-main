#!/bin/dash
# POSIX shell script to setup AT1 - only works for UNIX based operating systems
# If using Windows, read README.md to setup

set -e  # Exit on error

error_handler() {
    status=$?
    if [ "$status" -ne 0 ]; then
        echo "❌ Setup failed. See above for details."
    fi
    exit "$status"
}

trap error_handler EXIT

echo "🚀 Setting up 12SENG AT1...."

# Step 0: install Node.js if not found
if ! command -v node >/dev/null 2>&1; then
    echo "Node.js not found. Installing..."
    if command -v brew >/dev/null 2>&1; then
        brew install node
    elif command -v curl >/dev/null 2>&1; then
        echo "📥 Installing Node.js via official setup script..."
        curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo bash -
        sudo apt-get install -y nodejs || {
            echo "Could not install Node.js. Please install manually from https://nodejs.org/"
            exit 1
        }
    else
        echo "No package manager found (brew/apt missing). Please install Node.js manually from https://nodejs.org/"
        exit 1
    fi
else
    echo "✅ Node.js $(node -v) found."
fi

# Step 1: install frontend npm dependencies
echo "📦 Installing frontend dependencies..."
cd frontend || exit 1
npm install
cd .. || exit 1

# Step 2: backend setup
echo "Setting up backend..."
cd backend || exit 1

# check for Python3 exists - then create /venv
if command -v python3 >/dev/null 2>&1; then
    python3 -m venv venv
    echo "✅ Virtual environment created."
else
    echo "Python3 not found"
    exit 1
fi

. venv/bin/activate
echo "✅ Activated virtual environment."

# check pip3 exists
if ! command -v pip3 >/dev/null 2>&1; then
    echo "pip3 not found. Please install pip3."
    exit 1
fi

pip3 install -r requirements.txt

cd .. || exit 1

# Step 3: Install Material Icon Theme for VS Code (optional)
if command -v code >/dev/null 2>&1; then
    echo "🎨 Installing Material Icon Theme for VS Code..."
    code --install-extension PKief.material-icon-theme --force >/dev/null 2>&1 \
        && echo "✅ Material Icon Theme installed." \
        || echo "Failed to install Material Icon Theme. You can install it manually in VS Code."
else
    echo "VS Code CLI not found (command 'code'). Skipping icon theme installation."
fi

echo "✅ AT1 Installation complete!"
