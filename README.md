# AI Investment Assistant

A web application that helps users analyze stocks, optimize portfolios, and get AI-powered investment advice.

## Features

- Stock analysis and portfolio optimization
- News sentiment analysis
- AI-powered investment advice
- Real-time stock data
- Modern, responsive UI

## Prerequisites

- Python 3.8 or higher
- Node.js 14 or higher
- OpenAI API key

## Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd ai-investering
```

2. Set up the backend:
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

3. Set up the frontend:
```bash
cd ../frontend
npm install
```

4. Create a `.env` file in the backend directory with your OpenAI API key:
```
OPENAI_API_KEY=your_api_key_here
```

## Running the Application

1. Start the backend server:
```bash
cd backend
source venv/bin/activate  # On Windows: venv\Scripts\activate
python app.py
```

2. Start the frontend development server:
```bash
cd frontend
npm run dev
```

3. Open your browser and navigate to `http://localhost:5173`

## Project Structure

- `frontend/` - React frontend application
- `backend/` - Flask backend server
- `backend/app.py` - Main backend application
- `backend/requirements.txt` - Python dependencies
- `frontend/package.json` - Node.js dependencies

## Technologies Used

- Frontend:
  - React
  - TypeScript
  - Tailwind CSS
  - Vite
  - React Router
  - Axios

- Backend:
  - Flask
  - Python
  - OpenAI API
  - yfinance
  - NLTK
  - BeautifulSoup4

## License

MIT 