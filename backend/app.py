from flask import Flask, request, jsonify
from flask_cors import CORS
import yfinance as yf
import numpy as np
from datetime import datetime, timedelta
import requests
from bs4 import BeautifulSoup
import nltk
from nltk.sentiment import SentimentIntensityAnalyzer
from nltk.tokenize import word_tokenize
from nltk.corpus import stopwords
import re
import os
from dotenv import load_dotenv
import openai

# Load environment variables
load_dotenv()

# Initialize Flask app
app = Flask(__name__)
CORS(app)

# Download required NLTK data
nltk.download('punkt')
nltk.download('stopwords')
nltk.download('vader_lexicon')

# Initialize OpenAI client
openai.api_key = os.getenv('OPENAI_API_KEY')

def get_stock_data(ticker, period='1d'):
    """Get current stock data for a given ticker."""
    try:
        stock = yf.Ticker(ticker)
        info = stock.info
        return {
            'price': info.get('currentPrice', 0),
            'change': info.get('regularMarketChangePercent', 0),
            'volume': info.get('regularMarketVolume', 0)
        }
    except Exception as e:
        print(f"Error fetching stock data for {ticker}: {str(e)}")
        return None

def calculate_returns(stock_data):
    """Calculate daily returns from stock data."""
    if stock_data is None or len(stock_data) < 2:
        return None
    return stock_data['Close'].pct_change().dropna()

def calculate_portfolio_metrics(portfolio, risk_tolerance):
    """Calculate portfolio metrics including expected return and risk."""
    try:
        # Get historical data for all stocks
        stock_data = {}
        returns_data = {}
        for item in portfolio:
            ticker = item['ticker']
            data = get_stock_data(ticker)
            if data is not None:
                stock_data[ticker] = data
                returns = calculate_returns(data)
                if returns is not None:
                    returns_data[ticker] = returns

        if not returns_data:
            return None

        # Calculate mean returns and covariance matrix
        returns_df = pd.DataFrame(returns_data)
        mean_returns = returns_df.mean()
        cov_matrix = returns_df.cov()

        # Get current weights
        weights = np.array([item['weight'] / 100 for item in portfolio])

        # Calculate portfolio metrics
        portfolio_return = np.sum(mean_returns * weights)
        portfolio_risk = np.sqrt(np.dot(weights.T, np.dot(cov_matrix, weights)))

        # Optimize weights based on risk tolerance
        num_assets = len(portfolio)
        num_portfolios = 1000
        results = np.zeros((num_portfolios, num_assets + 2))

        for i in range(num_portfolios):
            weights = np.random.random(num_assets)
            weights = weights / np.sum(weights)
            
            portfolio_return = np.sum(mean_returns * weights)
            portfolio_risk = np.sqrt(np.dot(weights.T, np.dot(cov_matrix, weights)))
            
            results[i, 0] = portfolio_risk
            results[i, 1] = portfolio_return
            results[i, 2:] = weights

        # Find optimal portfolio based on risk tolerance
        risk_tolerance = float(risk_tolerance)
        target_risk = risk_tolerance * np.max(results[:, 0])
        optimal_idx = np.argmin(np.abs(results[:, 0] - target_risk))
        
        optimized_weights = results[optimal_idx, 2:]
        optimized_return = results[optimal_idx, 1]
        optimized_risk = results[optimal_idx, 0]

        return {
            'expected_return': float(optimized_return),
            'expected_risk': float(optimized_risk),
            'optimized_weights': {
                portfolio[i]['ticker']: float(optimized_weights[i])
                for i in range(len(portfolio))
            }
        }
    except Exception as e:
        print(f"Error calculating portfolio metrics: {str(e)}")
        return None

def extract_text_from_url(url):
    """Extract text content from a URL."""
    try:
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
        response = requests.get(url, headers=headers, timeout=10)
        response.raise_for_status()
        
        soup = BeautifulSoup(response.text, 'html.parser')
        
        # Remove script and style elements
        for script in soup(["script", "style"]):
            script.decompose()
            
        # Get text content
        text = soup.get_text()
        
        # Clean up text
        lines = (line.strip() for line in text.splitlines())
        chunks = (phrase.strip() for line in lines for phrase in line.split("  "))
        text = ' '.join(chunk for chunk in chunks if chunk)
        
        return text
    except Exception as e:
        print(f"Error extracting text from URL: {str(e)}")
        return None

def categorize_news(text, portfolio_tickers=None):
    """Categorize news into stock-specific, local, and global news."""
    try:
        # Initialize sentiment analyzer
        sia = SentimentIntensityAnalyzer()
        
        # Get sentiment scores
        sentiment_scores = sia.polarity_scores(text)
        
        # Determine sentiment
        if sentiment_scores['compound'] >= 0.05:
            sentiment = 'positive'
        elif sentiment_scores['compound'] <= -0.05:
            sentiment = 'negative'
        else:
            sentiment = 'neutral'
            
        # Use OpenAI to analyze and categorize the news
        response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "You are a financial news analyzer. Analyze the given text and determine if it's about specific stocks, local news, or global news. Also extract relevant company names and the main topic."},
                {"role": "user", "content": f"Analyze this text and categorize it:\n\n{text}"}
            ],
            max_tokens=200
        )
        
        analysis = response.choices[0].message.content
        
        # Extract category and details from OpenAI response
        category = "global"  # default category
        companies = []
        topic = ""
        
        # Simple parsing of OpenAI response
        lines = analysis.split('\n')
        for line in lines:
            if 'category' in line.lower():
                category = line.split(':')[1].strip().lower()
            elif 'companies' in line.lower() or 'company' in line.lower():
                companies = [c.strip() for c in line.split(':')[1].split(',')]
            elif 'topic' in line.lower():
                topic = line.split(':')[1].strip()
        
        # Check if news is about portfolio stocks
        if portfolio_tickers:
            for ticker in portfolio_tickers:
                if any(ticker.lower() in company.lower() for company in companies):
                    category = "portfolio"
                    break
        
        return {
            'category': category,
            'sentiment': sentiment,
            'companies': companies,
            'topic': topic
        }
    except Exception as e:
        print(f"Error categorizing news: {str(e)}")
        return None

def get_chat_response(question, portfolio=None, news_analysis=None):
    """Get AI response for chat questions about portfolio and news."""
    try:
        # Prepare context
        context = """You are a knowledgeable financial advisor with expertise in stock market analysis and portfolio management. 
        Your role is to provide insightful analysis and recommendations based on the user's portfolio and current market news.
        Focus on:
        1. Analyzing how news affects specific stocks in the portfolio
        2. Providing context about market conditions
        3. Suggesting potential portfolio adjustments based on news
        4. Explaining the implications of news on different sectors
        Be clear, concise, and professional in your responses."""

        # Add portfolio context
        if portfolio:
            portfolio_str = "\nCurrent Portfolio:\n"
            for ticker, weight in portfolio.items():
                portfolio_str += f"- {ticker}: {weight}%\n"
            context += portfolio_str

        # Add news analysis context
        if news_analysis:
            news_str = "\nLatest News Analysis:\n"
            news_str += f"Category: {news_analysis.get('category', 'unknown')}\n"
            news_str += f"Sentiment: {news_analysis.get('sentiment', 'unknown')}\n"
            news_str += f"Companies: {', '.join(news_analysis.get('companies', []))}\n"
            news_str += f"Topic: {news_analysis.get('topic', 'unknown')}\n"
            context += news_str

        # Get response from OpenAI
        response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": context},
                {"role": "user", "content": f"Question: {question}"}
            ],
            max_tokens=500,
            temperature=0.7
        )
        
        return response.choices[0].message.content
    except Exception as e:
        print(f"Error getting chat response: {str(e)}")
        return "I apologize, but I'm having trouble processing your request at the moment. Please try again later."

@app.route('/api/analyze-news', methods=['POST'])
def analyze_news():
    """Analyze and categorize news article or URL."""
    try:
        data = request.get_json()
        news_text = data.get('text', '')
        news_url = data.get('url', '')
        portfolio_tickers = data.get('portfolio_tickers', [])
        
        if not news_text and not news_url:
            return jsonify({'error': 'Please provide either news text or URL'}), 400
            
        if news_url:
            news_text = extract_text_from_url(news_url)
            if not news_text:
                return jsonify({'error': 'Could not extract text from URL'}), 400
                
        analysis = categorize_news(news_text, portfolio_tickers)
        if not analysis:
            return jsonify({'error': 'Could not analyze news content'}), 500
            
        return jsonify(analysis)
    except Exception as e:
        print(f"Error in analyze_news endpoint: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/api/optimize-portfolio', methods=['POST'])
def optimize_portfolio():
    """Optimize portfolio based on risk tolerance."""
    try:
        data = request.get_json()
        portfolio = data.get('portfolio', [])
        risk_tolerance = data.get('risk_tolerance', 0.5)
        
        if not portfolio:
            return jsonify({'error': 'Portfolio is required'}), 400
            
        metrics = calculate_portfolio_metrics(portfolio, risk_tolerance)
        if not metrics:
            return jsonify({'error': 'Could not calculate portfolio metrics'}), 500
            
        return jsonify(metrics)
    except Exception as e:
        print(f"Error in optimize_portfolio endpoint: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/api/chat', methods=['POST'])
def chat():
    """Handle chat questions about portfolio and news."""
    try:
        data = request.get_json()
        question = data.get('question', '')
        portfolio = data.get('portfolio', None)
        news_analysis = data.get('news_analysis', None)
        
        if not question:
            return jsonify({'error': 'Question is required'}), 400
            
        response = get_chat_response(question, portfolio, news_analysis)
        return jsonify({'answer': response})
    except Exception as e:
        print(f"Error in chat endpoint: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

if __name__ == '__main__':
    app.run(debug=True) 