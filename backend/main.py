from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Optional
import os
from dotenv import load_dotenv
import openai
import requests
from bs4 import BeautifulSoup
import yfinance as yf
from pypfopt import EfficientFrontier
from pypfopt import risk_models
from pypfopt import expected_returns

# Load environment variables
load_dotenv()

# Initialize OpenAI client
openai.api_key = os.getenv("OPENAI_API_KEY")

app = FastAPI(title="AI Stock Investment Tool")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://ai-investing-one.vercel.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Models
class NewsAnalysisRequest(BaseModel):
    text: str
    url: Optional[str] = None

class NewsAnalysisResponse(BaseModel):
    sentiment: str
    companies: List[str]
    topic: str

class PortfolioRequest(BaseModel):
    tickers: List[str]
    weights: List[float]
    risk_tolerance: float  # 0-1 scale

class PortfolioResponse(BaseModel):
    optimized_weights: Dict[str, float]
    expected_return: float
    expected_risk: float

class ChatRequest(BaseModel):
    question: str
    portfolio: Optional[Dict[str, float]] = None
    news_sentiment: Optional[Dict[str, str]] = None

class ChatResponse(BaseModel):
    answer: str

# Helper functions
def extract_text_from_url(url: str) -> str:
    try:
        response = requests.get(url)
        soup = BeautifulSoup(response.text, 'html.parser')
        return ' '.join([p.text for p in soup.find_all('p')])
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error fetching URL: {str(e)}")

def analyze_news_with_gpt(text: str) -> Dict:
    try:
        response = openai.ChatCompletion.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": "You are a financial news analyst. Analyze the following news article and provide: 1) sentiment (positive/neutral/negative), 2) mentioned companies, and 3) main topic."},
                {"role": "user", "content": text}
            ]
        )
        
        analysis = response.choices[0].message.content
        # Parse the response into structured format
        # This is a simplified version - you might want to make the prompt more structured
        return {
            "sentiment": "positive" if "positive" in analysis.lower() else "negative" if "negative" in analysis.lower() else "neutral",
            "companies": [word for word in analysis.split() if word.isupper() and len(word) > 1],
            "topic": analysis.split("topic:")[-1].strip() if "topic:" in analysis else "general"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error analyzing news: {str(e)}")

def optimize_portfolio(tickers: List[str], weights: List[float], risk_tolerance: float) -> Dict:
    try:
        # Get historical data
        data = yf.download(tickers, period="1y")["Adj Close"]
        
        # Calculate expected returns and covariance matrix
        mu = expected_returns.mean_historical_return(data)
        S = risk_models.sample_cov(data)
        
        # Optimize portfolio
        ef = EfficientFrontier(mu, S)
        ef.add_constraint(lambda x: sum(x) == 1)  # weights sum to 1
        
        # Adjust risk tolerance
        ef.max_sharpe(risk_free_rate=0.02)
        weights = ef.clean_weights()
        
        # Calculate portfolio metrics
        portfolio_performance = ef.portfolio_performance(risk_free_rate=0.02)
        
        return {
            "optimized_weights": weights,
            "expected_return": portfolio_performance[0],
            "expected_risk": portfolio_performance[1]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error optimizing portfolio: {str(e)}")

# Endpoints
@app.post("/analyze-news", response_model=NewsAnalysisResponse)
async def analyze_news(request: NewsAnalysisRequest):
    text = request.text
    if request.url:
        text = extract_text_from_url(request.url)
    
    analysis = analyze_news_with_gpt(text)
    return NewsAnalysisResponse(**analysis)

@app.post("/optimize-portfolio", response_model=PortfolioResponse)
async def optimize_portfolio_endpoint(request: PortfolioRequest):
    if len(request.tickers) != len(request.weights):
        raise HTTPException(status_code=400, detail="Number of tickers must match number of weights")
    
    result = optimize_portfolio(request.tickers, request.weights, request.risk_tolerance)
    return PortfolioResponse(**result)

@app.post("/chat", response_model=ChatResponse)
async def chat_endpoint(request: ChatRequest):
    try:
        # Prepare context for the AI
        context = "You are a financial advisor AI assistant. "
        if request.portfolio:
            context += f"Current portfolio: {request.portfolio}. "
        if request.news_sentiment:
            context += f"Recent news sentiment: {request.news_sentiment}. "
        
        response = openai.ChatCompletion.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": context},
                {"role": "user", "content": request.question}
            ]
        )
        
        return ChatResponse(answer=response.choices[0].message.content)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error in chat: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port) 