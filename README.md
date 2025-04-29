# AI-Powered Stock Investment Tool

An intelligent investment platform that combines news analysis, portfolio optimization, and AI-powered insights to help investors make better decisions.

## Features

- 🔍 **News Analysis**: Analyze news articles for sentiment, company mentions, and topics
- 📊 **Portfolio Optimization**: Optimize portfolio weights based on news sentiment and risk tolerance
- 🤖 **AI Chatbot**: Get real-time insights about your portfolio and market news
- 🎯 **Modern UI**: Clean and intuitive interface built with Next.js

## Tech Stack

- **Frontend**: Next.js (React)
- **Backend**: FastAPI (Python)
- **AI/ML**: OpenAI GPT-4 API
- **Portfolio Optimization**: PyPortfolioOpt
- **Deployment**: Vercel (Frontend), Render/Railway (Backend)

## Project Structure

```
.
├── frontend/           # Next.js frontend application
├── backend/           # FastAPI backend application
├── .env.example      # Example environment variables
└── README.md         # This file
```

## Deployment Instructions

### 1. GitHub Setup

1. Create a new GitHub repository
2. Push your code to the repository:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin your-repository-url
   git push -u origin main
   ```

### 2. Frontend Deployment (Vercel)

1. Go to [Vercel](https://vercel.com) and sign in with your GitHub account
2. Click "New Project" and import your repository
3. Configure the project:
   - Framework Preset: Next.js
   - Root Directory: `frontend`
   - Build Command: `npm run build`
   - Output Directory: `.next`
4. Add environment variables:
   - `NEXT_PUBLIC_BACKEND_URL`: Your backend URL (will be set after backend deployment)
   - `OPENAI_API_KEY`: Your OpenAI API key
5. Deploy!

### 3. Backend Deployment (Render)

1. Go to [Render](https://render.com) and sign up/login
2. Click "New +" and select "Web Service"
3. Connect your GitHub repository
4. Configure the service:
   - Name: `ai-stock-investment-backend`
   - Environment: `Python 3.9`
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
   - Root Directory: `backend`
5. Add environment variables:
   - `OPENAI_API_KEY`: Your OpenAI API key
   - `FRONTEND_URL`: Your Vercel frontend URL
6. Deploy!

### 4. Update Frontend Configuration

1. After the backend is deployed, copy the Render URL
2. Go to your Vercel project settings
3. Update the `NEXT_PUBLIC_BACKEND_URL` environment variable with your Render backend URL

### 5. GitHub Actions Setup (Optional)

If you want to automate deployments:

1. Go to your GitHub repository settings
2. Add the following secrets:
   - `RENDER_API_KEY`: Your Render API key
   - `RENDER_SERVICE_ID`: Your Render service ID
3. The GitHub Actions workflow will automatically deploy your backend when you push to main

## Local Development

### Prerequisites

- Node.js 18+ and npm
- Python 3.9+
- OpenAI API key
- A modern web browser

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Create a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: .\venv\Scripts\activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Copy `.env.example` to `.env` and fill in your API keys:
   ```bash
   cp .env.example .env
   ```

5. Start the backend server:
   ```bash
   uvicorn main:app --reload
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Copy `.env.example` to `.env.local` and fill in your API keys:
   ```bash
   cp .env.example .env.local
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## API Documentation

Once the backend is running, visit:
- http://localhost:8000/docs for Swagger UI documentation
- http://localhost:8000/redoc for ReDoc documentation

## License

MIT 