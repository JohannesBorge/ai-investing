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

const API_BASE_URL = 'https://ai-investing-b4b1.onrender.com';

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
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-5xl font-bold text-center mb-12 text-gray-900">AI Stock Investment Tool</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* News Analysis Section */}
          <div className="bg-gray-50 rounded-2xl shadow-sm p-8">
            <h2 className="text-3xl font-semibold mb-6 flex items-center text-gray-900">
              <NewspaperIcon className="h-8 w-8 mr-3 text-blue-600" />
              News Analysis
            </h2>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">News Article</label>
                <textarea
                  className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
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
                  className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                  placeholder="Enter news URL..."
                  value={newsUrl}
                  onChange={(e) => setNewsUrl(e.target.value)}
                />
              </div>
              <button
                className="w-full bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 font-medium"
                onClick={analyzeNews}
                disabled={isLoading || (!newsText && !newsUrl)}
              >
                {isLoading ? 'Analyzing...' : 'Analyze News'}
              </button>
              {newsAnalysis && (
                <div className="mt-6 p-6 bg-white rounded-xl border border-gray-200">
                  <h3 className="text-xl font-semibold mb-4 text-gray-900">Analysis Results</h3>
                  <div className="space-y-3">
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
          <div className="bg-gray-50 rounded-2xl shadow-sm p-8">
            <h2 className="text-3xl font-semibold mb-6 flex items-center text-gray-900">
              <ChartBarIcon className="h-8 w-8 mr-3 text-green-600" />
              Portfolio Optimization
            </h2>
            <div className="space-y-6">
              <div className="flex space-x-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Ticker Symbol</label>
                  <input
                    type="text"
                    className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white"
                    placeholder="e.g., AAPL"
                    value={newTicker}
                    onChange={(e) => setNewTicker(e.target.value)}
                  />
                </div>
                <div className="w-32">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Weight (%)</label>
                  <input
                    type="number"
                    className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white"
                    placeholder="e.g., 20"
                    value={newWeight}
                    onChange={(e) => setNewWeight(e.target.value)}
                  />
                </div>
                <button
                  className="mt-6 bg-green-600 text-white px-4 py-4 rounded-xl hover:bg-green-700 transition-colors"
                  onClick={addToPortfolio}
                >
                  <PlusIcon className="h-6 w-6" />
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
                <div className="mt-6">
                  <h3 className="text-xl font-semibold mb-4 text-gray-900">Current Portfolio</h3>
                  <div className="space-y-3">
                    {portfolio.map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-200">
                        <span className="font-medium text-gray-900">{item.ticker}</span>
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
                  <div className="mt-6 h-64">
                    <Pie data={portfolioData} />
                  </div>
                </div>
              )}

              <button
                className="w-full bg-green-600 text-white px-6 py-3 rounded-xl hover:bg-green-700 transition-colors disabled:opacity-50 font-medium"
                onClick={optimizePortfolio}
                disabled={isLoading || portfolio.length === 0}
              >
                {isLoading ? 'Optimizing...' : 'Optimize Portfolio'}
              </button>

              {optimizedPortfolio && (
                <div className="mt-6 p-6 bg-white rounded-xl border border-gray-200">
                  <h3 className="text-xl font-semibold mb-4 text-gray-900">Optimized Portfolio</h3>
                  <div className="space-y-3">
                    <p>
                      <span className="font-medium text-gray-700">Expected Return:</span>{' '}
                      <span className="text-green-600">{(optimizedPortfolio.expected_return * 100).toFixed(2)}%</span>
                    </p>
                    <p>
                      <span className="font-medium text-gray-700">Expected Risk:</span>{' '}
                      <span className="text-red-600">{(optimizedPortfolio.expected_risk * 100).toFixed(2)}%</span>
                    </p>
                    <div className="mt-4">
                      {Object.entries(optimizedPortfolio.optimized_weights).map(([ticker, weight]) => (
                        <p key={ticker} className="flex justify-between py-2 border-b border-gray-100 last:border-0">
                          <span className="font-medium text-gray-900">{ticker}</span>
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
        <div className="mt-12 bg-gray-50 rounded-2xl shadow-sm p-8">
          <h2 className="text-3xl font-semibold mb-6 flex items-center text-gray-900">
            <ChatBubbleLeftIcon className="h-8 w-8 mr-3 text-purple-600" />
            AI Chatbot
          </h2>
          <div className="space-y-6">
            <div className="h-64 overflow-y-auto border border-gray-200 rounded-xl p-6 bg-white">
              {chatHistory.map((chat, index) => (
                <div key={index} className="mb-4">
                  <p className="font-semibold text-gray-900">Q: {chat.question}</p>
                  <p className="mt-2 text-gray-600">A: {chat.answer}</p>
                </div>
              ))}
            </div>
            <div className="flex space-x-4">
              <input
                type="text"
                className="flex-1 p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white"
                placeholder="Ask about your portfolio or news..."
                value={chatQuestion}
                onChange={(e) => setChatQuestion(e.target.value)}
              />
              <button
                className="bg-purple-600 text-white px-8 py-4 rounded-xl hover:bg-purple-700 transition-colors disabled:opacity-50 font-medium"
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