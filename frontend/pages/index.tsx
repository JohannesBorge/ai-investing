import React, { useState } from 'react';
import axios from 'axios';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Pie } from 'react-chartjs-2';
import { ChatBubbleLeftIcon, ChartBarIcon, NewspaperIcon } from '@heroicons/react/24/outline';

ChartJS.register(ArcElement, Tooltip, Legend);

interface NewsAnalysis {
  sentiment: string;
  companies: string[];
  topic: string;
}

interface PortfolioItem {
  ticker: string;
  weight: number;
}

interface OptimizedPortfolio {
  optimized_weights: Record<string, number>;
  expected_return: number;
  expected_risk: number;
}

export default function Home() {
  const [newsText, setNewsText] = useState('');
  const [newsUrl, setNewsUrl] = useState('');
  const [newsAnalysis, setNewsAnalysis] = useState<NewsAnalysis | null>(null);
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([]);
  const [newTicker, setNewTicker] = useState('');
  const [newWeight, setNewWeight] = useState('');
  const [riskTolerance, setRiskTolerance] = useState(0.5);
  const [optimizedPortfolio, setOptimizedPortfolio] = useState<OptimizedPortfolio | null>(null);
  const [chatQuestion, setChatQuestion] = useState('');
  const [chatHistory, setChatHistory] = useState<{ question: string; answer: string }[]>([]);

  const analyzeNews = async () => {
    try {
      const response = await axios.post('http://localhost:8000/analyze-news', {
        text: newsText,
        url: newsUrl || undefined,
      });
      setNewsAnalysis(response.data);
    } catch (error) {
      console.error('Error analyzing news:', error);
    }
  };

  const addToPortfolio = () => {
    if (newTicker && newWeight) {
      setPortfolio([...portfolio, { ticker: newTicker.toUpperCase(), weight: parseFloat(newWeight) }]);
      setNewTicker('');
      setNewWeight('');
    }
  };

  const optimizePortfolio = async () => {
    try {
      const response = await axios.post('http://localhost:8000/optimize-portfolio', {
        tickers: portfolio.map(p => p.ticker),
        weights: portfolio.map(p => p.weight),
        risk_tolerance: riskTolerance,
      });
      setOptimizedPortfolio(response.data);
    } catch (error) {
      console.error('Error optimizing portfolio:', error);
    }
  };

  const askChat = async () => {
    try {
      const response = await axios.post('http://localhost:8000/chat', {
        question: chatQuestion,
        portfolio: portfolio.reduce((acc, p) => ({ ...acc, [p.ticker]: p.weight }), {}),
        news_sentiment: newsAnalysis ? { sentiment: newsAnalysis.sentiment } : undefined,
      });
      setChatHistory([...chatHistory, { question: chatQuestion, answer: response.data.answer }]);
      setChatQuestion('');
    } catch (error) {
      console.error('Error in chat:', error);
    }
  };

  const portfolioData = {
    labels: portfolio.map(p => p.ticker),
    datasets: [{
      data: portfolio.map(p => p.weight),
      backgroundColor: [
        '#FF6384',
        '#36A2EB',
        '#FFCE56',
        '#4BC0C0',
        '#9966FF',
      ],
    }],
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-center mb-8">AI Stock Investment Tool</h1>
        
        {/* News Analysis Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-4 flex items-center">
            <NewspaperIcon className="h-6 w-6 mr-2" />
            News Analysis
          </h2>
          <div className="space-y-4">
            <textarea
              className="w-full p-2 border rounded"
              placeholder="Paste news article here..."
              value={newsText}
              onChange={(e) => setNewsText(e.target.value)}
              rows={4}
            />
            <input
              type="text"
              className="w-full p-2 border rounded"
              placeholder="Or enter news URL..."
              value={newsUrl}
              onChange={(e) => setNewsUrl(e.target.value)}
            />
            <button
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              onClick={analyzeNews}
            >
              Analyze News
            </button>
            {newsAnalysis && (
              <div className="mt-4 p-4 bg-gray-50 rounded">
                <p><strong>Sentiment:</strong> {newsAnalysis.sentiment}</p>
                <p><strong>Companies:</strong> {newsAnalysis.companies.join(', ')}</p>
                <p><strong>Topic:</strong> {newsAnalysis.topic}</p>
              </div>
            )}
          </div>
        </div>

        {/* Portfolio Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-4 flex items-center">
            <ChartBarIcon className="h-6 w-6 mr-2" />
            Portfolio Optimization
          </h2>
          <div className="space-y-4">
            <div className="flex space-x-4">
              <input
                type="text"
                className="flex-1 p-2 border rounded"
                placeholder="Ticker symbol"
                value={newTicker}
                onChange={(e) => setNewTicker(e.target.value)}
              />
              <input
                type="number"
                className="w-32 p-2 border rounded"
                placeholder="Weight"
                value={newWeight}
                onChange={(e) => setNewWeight(e.target.value)}
              />
              <button
                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                onClick={addToPortfolio}
              >
                Add
              </button>
            </div>
            <div className="flex items-center space-x-4">
              <label>Risk Tolerance:</label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={riskTolerance}
                onChange={(e) => setRiskTolerance(parseFloat(e.target.value))}
                className="flex-1"
              />
              <span>{riskTolerance}</span>
            </div>
            <button
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              onClick={optimizePortfolio}
            >
              Optimize Portfolio
            </button>
            {portfolio.length > 0 && (
              <div className="mt-4">
                <h3 className="text-lg font-semibold mb-2">Current Portfolio</h3>
                <div className="h-64">
                  <Pie data={portfolioData} />
                </div>
              </div>
            )}
            {optimizedPortfolio && (
              <div className="mt-4 p-4 bg-gray-50 rounded">
                <h3 className="text-lg font-semibold mb-2">Optimized Portfolio</h3>
                <p><strong>Expected Return:</strong> {(optimizedPortfolio.expected_return * 100).toFixed(2)}%</p>
                <p><strong>Expected Risk:</strong> {(optimizedPortfolio.expected_risk * 100).toFixed(2)}%</p>
                <div className="mt-2">
                  {Object.entries(optimizedPortfolio.optimized_weights).map(([ticker, weight]) => (
                    <p key={ticker}>
                      <strong>{ticker}:</strong> {(Number(weight) * 100).toFixed(2)}%
                    </p>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Chat Section */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-semibold mb-4 flex items-center">
            <ChatBubbleLeftIcon className="h-6 w-6 mr-2" />
            AI Chatbot
          </h2>
          <div className="space-y-4">
            <div className="h-64 overflow-y-auto border rounded p-4">
              {chatHistory.map((chat, index) => (
                <div key={index} className="mb-4">
                  <p className="font-semibold">Q: {chat.question}</p>
                  <p className="mt-1">A: {chat.answer}</p>
                </div>
              ))}
            </div>
            <div className="flex space-x-4">
              <input
                type="text"
                className="flex-1 p-2 border rounded"
                placeholder="Ask about your portfolio or news..."
                value={chatQuestion}
                onChange={(e) => setChatQuestion(e.target.value)}
              />
              <button
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                onClick={askChat}
              >
                Ask
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 