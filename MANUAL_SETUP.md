# Manual Setup Guide

If the automated `start_dev.sh` script doesn't work, follow these manual steps:

## Prerequisites

Make sure you have:
- Python 3.8+ installed
- Node.js 18+ installed
- npm installed

## Step 1: Frontend Setup

```bash
# Install frontend dependencies
npm install

# Start frontend development server
npm run dev
```

The frontend will be available at: http://localhost:8080

## Step 2: Backend Setup

```bash
# Navigate to backend directory
cd Backend

# Create virtual environment
python3 -m venv venv

# Activate virtual environment
# On macOS/Linux:
source venv/bin/activate
# On Windows:
# venv\Scripts\activate

# Install dependencies
python -m pip install -r requirements.txt

# Create .env file (if not exists)
# Add your API keys to Backend/.env:
# OPENAI_API_KEY=your_key_here
# FIREWORKS_API_KEY=your_key_here
# MONGO_URI=your_mongodb_connection_string

# Start backend server
python run_server.py
```

The backend will be available at: http://localhost:8000

## Step 3: Test the Integration

1. Open http://localhost:8080 in your browser
2. Navigate to the Chat page
3. Try asking: "Find papers on transformers"

## Troubleshooting

### Python/pip not found
- Make sure Python 3 is installed: `python3 --version`
- Try using `python3 -m pip` instead of just `pip`
- On macOS, you might need to install Python via Homebrew: `brew install python`

### Virtual environment issues
- Make sure you're in the Backend directory when creating the venv
- Try deleting the venv folder and recreating it
- On Windows, use `venv\Scripts\activate` instead of `source venv/bin/activate`

### Backend won't start
- Check that your `.env` file exists in the Backend directory
- Verify your API keys are correct
- Make sure MongoDB Atlas is accessible

### Frontend can't connect to backend
- Ensure backend is running on port 8000
- Check that CORS is properly configured
- Try accessing http://localhost:8000 directly to test the API 