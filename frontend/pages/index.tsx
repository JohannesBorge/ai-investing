import React, { useState } from 'react';
import axios from 'axios';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Pie } from 'react-chartjs-2';
import { ChatBubbleLeftIcon, ChartBarIcon, NewspaperIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/outline';

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

interface ChatResponse {
  answer: string;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';

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
  const [isLoading, setIsLoading] = useState(false);

  const analyzeNews = async () => {
    if (!newsText && !newsUrl) return;
    setIsLoading(true);
    try {
      const response = await axios.post<NewsAnalysis>(`${API_BASE_URL}/analyze-news`, {
        text: newsText,
        url: newsUrl || undefined,
      });
      setNewsAnalysis(response.data);
    } catch (error) {
      console.error('Error analyzing news:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const addToPortfolio = () => {
    if (newTicker && newWeight) {
      setPortfolio([...portfolio, { ticker: newTicker.toUpperCase(), weight: parseFloat(newWeight) }]);
      setNewTicker('');
      setNewWeight('');
    }
  };

  const removeFromPortfolio = (index: number) => {
    setPortfolio(portfolio.filter((_, i) => i !== index));
  };

  const optimizePortfolio = async () => {
    if (portfolio.length === 0) return;
    setIsLoading(true);
    try {
      const response = await axios.post<OptimizedPortfolio>(`${API_BASE_URL}/optimize-portfolio`, {
        tickers: portfolio.map(p => p.ticker),
        weights: portfolio.map(p => p.weight),
        risk_tolerance: riskTolerance,
      });
      setOptimizedPortfolio(response.data);
    } catch (error) {
      console.error('Error optimizing portfolio:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const askChat = async () => {
    if (!chatQuestion) return;
    setIsLoading(true);
    try {
      const response = await axios.post<ChatResponse>(`${API_BASE_URL}/chat`, {
        question: chatQuestion,
        portfolio: portfolio.reduce((acc, p) => ({ ...acc, [p.ticker]: p.weight }), {}),
        news_sentiment: newsAnalysis ? { sentiment: newsAnalysis.sentiment } : undefined,
      });
      setChatHistory([...chatHistory, { question: chatQuestion, answer: response.data.answer }]);
      setChatQuestion('');
    } catch (error) {
      console.error('Error in chat:', error);
    } finally {
      setIsLoading(false);
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
        '#FF9F40',
        '#8AC24A',
        '#9C27B0',
        '#F44336',
        '#2196F3',
      ],
    }],
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-center mb-8 text-gray-800">AI Stock Investment Tool</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* News Analysis Section */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-semibold mb-4 flex items-center text-gray-700">
              <NewspaperIcon className="h-6 w-6 mr-2 text-blue-500" />
              News Analysis
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">News Article</label>
                <textarea
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Paste news article here..."
                  value={newsText}
                  onChange={(e) => setNewsText(e.target.value)}
                  rows={4}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Or News URL</label>
                <input
                  type="text"
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter news URL..."
                  value={newsUrl}
                  onChange={(e) => setNewsUrl(e.target.value)}
                />
              </div>
              <button
                className="w-full bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
                onClick={analyzeNews}
                disabled={isLoading || (!newsText && !newsUrl)}
              >
                {isLoading ? 'Analyzing...' : 'Analyze News'}
              </button>
              {newsAnalysis && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg border">
                  <h3 className="text-lg font-semibold mb-2 text-gray-700">Analysis Results</h3>
                  <div className="space-y-2">
                    <p>
                      <span className="font-medium text-gray-700">Sentiment:</span>{' '}
                      <span className={`font-semibold ${
                        newsAnalysis.sentiment === 'positive' ? 'text-green-600' :
                        newsAnalysis.sentiment === 'negative' ? 'text-red-600' :
                        'text-yellow-600'
                      }`}>
                        {newsAnalysis.sentiment}
                      </span>
                    </p>
                    <p>
                      <span className="font-medium text-gray-700">Companies:</span>{' '}
                      <span className="text-gray-600">{newsAnalysis.companies.join(', ')}</span>
                    </p>
                    <p>
                      <span className="font-medium text-gray-700">Topic:</span>{' '}
                      <span className="text-gray-600">{newsAnalysis.topic}</span>
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Portfolio Section */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-semibold mb-4 flex items-center text-gray-700">
              <ChartBarIcon className="h-6 w-6 mr-2 text-green-500" />
              Portfolio Optimization
            </h2>
            <div className="space-y-4">
              <div className="flex space-x-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Ticker Symbol</label>
                  <input
                    type="text"
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="e.g., AAPL"
                    value={newTicker}
                    onChange={(e) => setNewTicker(e.target.value)}
                  />
                </div>
                <div className="w-32">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Weight (%)</label>
                  <input
                    type="number"
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="e.g., 20"
                    value={newWeight}
                    onChange={(e) => setNewWeight(e.target.value)}
                  />
                </div>
                <button
                  className="mt-6 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
                  onClick={addToPortfolio}
                >
                  <PlusIcon className="h-5 w-5" />
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Risk Tolerance: {riskTolerance}
                </label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={riskTolerance}
                  onChange={(e) => setRiskTolerance(parseFloat(e.target.value))}
                  className="w-full"
                />
              </div>

              {portfolio.length > 0 && (
                <div className="mt-4">
                  <h3 className="text-lg font-semibold mb-2 text-gray-700">Current Portfolio</h3>
                  <div className="space-y-2">
                    {portfolio.map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <span className="font-medium">{item.ticker}</span>
                        <div className="flex items-center space-x-4">
                          <span className="text-gray-600">{item.weight}%</span>
                          <button
                            onClick={() => removeFromPortfolio(index)}
                            className="text-red-500 hover:text-red-600"
                          >
                            <TrashIcon className="h-5 w-5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 h-64">
                    <Pie data={portfolioData} />
                  </div>
                </div>
              )}

              <button
                className="w-full bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50"
                onClick={optimizePortfolio}
                disabled={isLoading || portfolio.length === 0}
              >
                {isLoading ? 'Optimizing...' : 'Optimize Portfolio'}
              </button>

              {optimizedPortfolio && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg border">
                  <h3 className="text-lg font-semibold mb-2 text-gray-700">Optimized Portfolio</h3>
                  <div className="space-y-2">
                    <p>
                      <span className="font-medium text-gray-700">Expected Return:</span>{' '}
                      <span className="text-green-600">{(optimizedPortfolio.expected_return * 100).toFixed(2)}%</span>
                    </p>
                    <p>
                      <span className="font-medium text-gray-700">Expected Risk:</span>{' '}
                      <span className="text-red-600">{(optimizedPortfolio.expected_risk * 100).toFixed(2)}%</span>
                    </p>
                    <div className="mt-2">
                      {Object.entries(optimizedPortfolio.optimized_weights).map(([ticker, weight]) => (
                        <p key={ticker} className="flex justify-between">
                          <span className="font-medium">{ticker}</span>
                          <span className="text-gray-600">{(Number(weight) * 100).toFixed(2)}%</span>
                        </p>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Chat Section */}
        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-semibold mb-4 flex items-center text-gray-700">
            <ChatBubbleLeftIcon className="h-6 w-6 mr-2 text-purple-500" />
            AI Chatbot
          </h2>
          <div className="space-y-4">
            <div className="h-64 overflow-y-auto border rounded-lg p-4 bg-gray-50">
              {chatHistory.map((chat, index) => (
                <div key={index} className="mb-4">
                  <p className="font-semibold text-gray-700">Q: {chat.question}</p>
                  <p className="mt-1 text-gray-600">A: {chat.answer}</p>
                </div>
              ))}
            </div>
            <div className="flex space-x-4">
              <input
                type="text"
                className="flex-1 p-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                placeholder="Ask about your portfolio or news..."
                value={chatQuestion}
                onChange={(e) => setChatQuestion(e.target.value)}
              />
              <button
                className="bg-purple-500 text-white px-6 py-2 rounded-lg hover:bg-purple-600 transition-colors disabled:opacity-50"
                onClick={askChat}
                disabled={isLoading || !chatQuestion}
              >
                {isLoading ? 'Thinking...' : 'Ask'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 