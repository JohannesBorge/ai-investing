import React, { useState } from 'react';
import axios from 'axios';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Pie } from 'react-chartjs-2';
import { motion } from 'framer-motion';
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

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 }
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

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
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <nav className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">AI Stock Investment Tool</h1>
            <div className="flex items-center space-x-4">
              <a href="https://www.johannesborge.com" target="_blank" rel="noopener noreferrer" 
                 className="text-gray-600 hover:text-gray-900 transition-colors">
                About
              </a>
              <a href="https://www.johannesborge.com/contact" target="_blank" rel="noopener noreferrer"
                 className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                Contact
              </a>
            </div>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-16">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-5xl font-bold text-gray-900 mb-4">Intelligent Investment Analysis</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Leverage AI to analyze market news, optimize your portfolio, and get real-time insights
          </p>
        </motion.div>
        
        <motion.div 
          variants={staggerContainer}
          initial="initial"
          animate="animate"
          className="grid grid-cols-1 lg:grid-cols-2 gap-16"
        >
          {/* News Analysis Section */}
          <motion.div 
            variants={fadeIn}
            className="bg-white rounded-3xl shadow-lg p-10 hover:shadow-xl transition-shadow"
          >
            <h2 className="text-3xl font-semibold mb-8 flex items-center text-gray-900">
              <NewspaperIcon className="h-10 w-10 mr-4 text-blue-600" />
              News Analysis
            </h2>
            <div className="space-y-8">
              <div>
                <label className="block text-lg font-medium text-gray-700 mb-3">News Article</label>
                <textarea
                  className="w-full p-5 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-lg transition-all"
                  placeholder="Paste news article here..."
                  value={newsText}
                  onChange={(e) => setNewsText(e.target.value)}
                  rows={4}
                />
              </div>
              <div>
                <label className="block text-lg font-medium text-gray-700 mb-3">Or News URL</label>
                <input
                  type="text"
                  className="w-full p-5 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-lg transition-all"
                  placeholder="Enter news URL..."
                  value={newsUrl}
                  onChange={(e) => setNewsUrl(e.target.value)}
                />
              </div>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full bg-blue-600 text-white px-8 py-4 rounded-2xl hover:bg-blue-700 transition-colors disabled:opacity-50 text-lg font-medium"
                onClick={analyzeNews}
                disabled={isLoading || (!newsText && !newsUrl)}
              >
                {isLoading ? 'Analyzing...' : 'Analyze News'}
              </motion.button>
              {newsAnalysis && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-8 p-8 bg-gray-50 rounded-2xl border border-gray-200"
                >
                  <h3 className="text-2xl font-semibold mb-6 text-gray-900">Analysis Results</h3>
                  <div className="space-y-4">
                    <p className="text-lg">
                      <span className="font-medium text-gray-700">Sentiment:</span>{' '}
                      <span className={`font-semibold ${
                        newsAnalysis.sentiment === 'positive' ? 'text-green-600' :
                        newsAnalysis.sentiment === 'negative' ? 'text-red-600' :
                        'text-yellow-600'
                      }`}>
                        {newsAnalysis.sentiment}
                      </span>
                    </p>
                    <p className="text-lg">
                      <span className="font-medium text-gray-700">Companies:</span>{' '}
                      <span className="text-gray-600">{newsAnalysis.companies.join(', ')}</span>
                    </p>
                    <p className="text-lg">
                      <span className="font-medium text-gray-700">Topic:</span>{' '}
                      <span className="text-gray-600">{newsAnalysis.topic}</span>
                    </p>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>

          {/* Portfolio Section */}
          <motion.div 
            variants={fadeIn}
            className="bg-white rounded-3xl shadow-lg p-10 hover:shadow-xl transition-shadow"
          >
            <h2 className="text-3xl font-semibold mb-8 flex items-center text-gray-900">
              <ChartBarIcon className="h-10 w-10 mr-4 text-green-600" />
              Portfolio Optimization
            </h2>
            <div className="space-y-8">
              <div className="flex space-x-4">
                <div className="flex-1">
                  <label className="block text-lg font-medium text-gray-700 mb-3">Ticker Symbol</label>
                  <input
                    type="text"
                    className="w-full p-5 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white text-lg transition-all"
                    placeholder="e.g., AAPL"
                    value={newTicker}
                    onChange={(e) => setNewTicker(e.target.value)}
                  />
                </div>
                <div className="w-32">
                  <label className="block text-lg font-medium text-gray-700 mb-3">Weight (%)</label>
                  <input
                    type="number"
                    className="w-full p-5 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white text-lg transition-all"
                    placeholder="e.g., 20"
                    value={newWeight}
                    onChange={(e) => setNewWeight(e.target.value)}
                  />
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="mt-8 bg-green-600 text-white px-6 py-5 rounded-2xl hover:bg-green-700 transition-colors"
                  onClick={addToPortfolio}
                >
                  <PlusIcon className="h-8 w-8" />
                </motion.button>
              </div>

              <div>
                <label className="block text-lg font-medium text-gray-700 mb-3">
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
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-8"
                >
                  <h3 className="text-2xl font-semibold mb-6 text-gray-900">Current Portfolio</h3>
                  <div className="space-y-4">
                    {portfolio.map((item, index) => (
                      <motion.div 
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="flex items-center justify-between p-5 bg-gray-50 rounded-2xl border border-gray-200"
                      >
                        <span className="font-medium text-gray-900 text-lg">{item.ticker}</span>
                        <div className="flex items-center space-x-6">
                          <span className="text-gray-600 text-lg">{item.weight}%</span>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => removeFromPortfolio(index)}
                            className="text-red-500 hover:text-red-600"
                          >
                            <TrashIcon className="h-6 w-6" />
                          </motion.button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                  <div className="mt-8 h-80">
                    <Pie data={portfolioData} />
                  </div>
                </motion.div>
              )}

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full bg-green-600 text-white px-8 py-4 rounded-2xl hover:bg-green-700 transition-colors disabled:opacity-50 text-lg font-medium"
                onClick={optimizePortfolio}
                disabled={isLoading || portfolio.length === 0}
              >
                {isLoading ? 'Optimizing...' : 'Optimize Portfolio'}
              </motion.button>

              {optimizedPortfolio && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-8 p-8 bg-gray-50 rounded-2xl border border-gray-200"
                >
                  <h3 className="text-2xl font-semibold mb-6 text-gray-900">Optimized Portfolio</h3>
                  <div className="space-y-4">
                    <p className="text-lg">
                      <span className="font-medium text-gray-700">Expected Return:</span>{' '}
                      <span className="text-green-600">{(optimizedPortfolio.expected_return * 100).toFixed(2)}%</span>
                    </p>
                    <p className="text-lg">
                      <span className="font-medium text-gray-700">Expected Risk:</span>{' '}
                      <span className="text-red-600">{(optimizedPortfolio.expected_risk * 100).toFixed(2)}%</span>
                    </p>
                    <div className="mt-6">
                      {Object.entries(optimizedPortfolio.optimized_weights).map(([ticker, weight]) => (
                        <p key={ticker} className="flex justify-between py-3 border-b border-gray-100 last:border-0 text-lg">
                          <span className="font-medium text-gray-900">{ticker}</span>
                          <span className="text-gray-600">{(Number(weight) * 100).toFixed(2)}%</span>
                        </p>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        </motion.div>

        {/* Chat Section */}
        <motion.div 
          variants={fadeIn}
          className="mt-16 bg-white rounded-3xl shadow-lg p-10 hover:shadow-xl transition-shadow"
        >
          <h2 className="text-3xl font-semibold mb-8 flex items-center text-gray-900">
            <ChatBubbleLeftIcon className="h-10 w-10 mr-4 text-purple-600" />
            AI Chatbot
          </h2>
          <div className="space-y-8">
            <div className="h-80 overflow-y-auto border border-gray-200 rounded-2xl p-8 bg-gray-50">
              {chatHistory.map((chat, index) => (
                <motion.div 
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-6"
                >
                  <p className="font-semibold text-gray-900 text-lg">Q: {chat.question}</p>
                  <p className="mt-3 text-gray-600 text-lg">A: {chat.answer}</p>
                </motion.div>
              ))}
            </div>
            <div className="flex space-x-4">
              <input
                type="text"
                className="flex-1 p-5 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white text-lg transition-all"
                placeholder="Ask about your portfolio or news..."
                value={chatQuestion}
                onChange={(e) => setChatQuestion(e.target.value)}
              />
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="bg-purple-600 text-white px-10 py-5 rounded-2xl hover:bg-purple-700 transition-colors disabled:opacity-50 text-lg font-medium"
                onClick={askChat}
                disabled={isLoading || !chatQuestion}
              >
                {isLoading ? 'Thinking...' : 'Ask'}
              </motion.button>
            </div>
          </div>
        </motion.div>
      </main>

      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-600">© 2024 AI Stock Investment Tool. All rights reserved.</p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="https://www.johannesborge.com" target="_blank" rel="noopener noreferrer" 
                 className="text-gray-600 hover:text-gray-900 transition-colors">
                About
              </a>
              <a href="https://www.johannesborge.com/contact" target="_blank" rel="noopener noreferrer"
                 className="text-gray-600 hover:text-gray-900 transition-colors">
                Contact
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
} 