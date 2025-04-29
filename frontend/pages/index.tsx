import React, { useState } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { ChatBubbleLeftIcon, ChartBarIcon, NewspaperIcon, PlusIcon, TrashIcon, XMarkIcon } from '@heroicons/react/24/outline';

interface NewsAnalysis {
  category: string;
  sentiment: string;
  companies: string[];
  topic: string;
}

interface PortfolioItem {
  ticker: string;
  weight: number;
}

interface ChatResponse {
  answer: string;
}

const API_BASE_URL = 'https://ai-investing-b4b1.onrender.com';

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.3 }
};

const slideIn = {
  initial: { x: '100%' },
  animate: { x: 0 },
  exit: { x: '100%' },
  transition: { duration: 0.3 }
};

export default function Home() {
  const [newsText, setNewsText] = useState('');
  const [newsUrl, setNewsUrl] = useState('');
  const [newsAnalysis, setNewsAnalysis] = useState<NewsAnalysis | null>(null);
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([]);
  const [newTicker, setNewTicker] = useState('');
  const [newWeight, setNewWeight] = useState('');
  const [chatQuestion, setChatQuestion] = useState('');
  const [chatHistory, setChatHistory] = useState<{ question: string; answer: string }[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);

  const analyzeNews = async () => {
    if (!newsText && !newsUrl) return;
    setIsLoading(true);
    try {
      const response = await axios.post<NewsAnalysis>(`${API_BASE_URL}/analyze-news`, {
        text: newsText,
        url: newsUrl || undefined,
        portfolio_tickers: portfolio.map(p => p.ticker)
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

  const askChat = async () => {
    if (!chatQuestion) return;
    setIsLoading(true);
    try {
      const response = await axios.post<ChatResponse>(`${API_BASE_URL}/chat`, {
        question: chatQuestion,
        portfolio: portfolio.reduce((acc, p) => ({ ...acc, [p.ticker]: p.weight }), {}),
        news_analysis: newsAnalysis
      });
      setChatHistory([...chatHistory, { question: chatQuestion, answer: response.data.answer }]);
      setChatQuestion('');
    } catch (error) {
      console.error('Error in chat:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <nav className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold text-gray-900">AI Stock News Analyzer</h1>
            <div className="flex items-center space-x-4">
              <a href="https://www.johannesborge.com" target="_blank" rel="noopener noreferrer" 
                 className="text-gray-600 hover:text-gray-900 transition-colors">
                About
              </a>
              <a href="https://www.johannesborge.com/contact" target="_blank" rel="noopener noreferrer"
                 className="bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 transition-colors text-sm">
                Contact
              </a>
            </div>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="text-center mb-8"
        >
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Intelligent News Analysis</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Analyze market news, track your portfolio, and get AI-powered insights
          </p>
        </motion.div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* News Analysis Section */}
          <motion.div 
            variants={fadeIn}
            className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow"
          >
            <h2 className="text-xl font-semibold mb-4 flex items-center text-gray-900">
              <NewspaperIcon className="h-5 w-5 mr-2 text-blue-600" />
              News Analysis
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">News Article</label>
                <textarea
                  className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-sm transition-all"
                  placeholder="Paste news article here..."
                  value={newsText}
                  onChange={(e) => setNewsText(e.target.value)}
                  rows={3}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Or News URL</label>
                <input
                  type="text"
                  className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-sm transition-all"
                  placeholder="Enter news URL..."
                  value={newsUrl}
                  onChange={(e) => setNewsUrl(e.target.value)}
                />
              </div>
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 text-sm font-medium"
                onClick={analyzeNews}
                disabled={isLoading || (!newsText && !newsUrl)}
              >
                {isLoading ? 'Analyzing...' : 'Analyze News'}
              </motion.button>
              {newsAnalysis && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200"
                >
                  <h3 className="text-lg font-semibold mb-3 text-gray-900">Analysis Results</h3>
                  <div className="space-y-2">
                    <p className="text-sm">
                      <span className="font-medium text-gray-700">Category:</span>{' '}
                      <span className={`font-semibold ${
                        newsAnalysis.category === 'portfolio' ? 'text-purple-600' :
                        newsAnalysis.category === 'local' ? 'text-blue-600' :
                        'text-green-600'
                      }`}>
                        {newsAnalysis.category}
                      </span>
                    </p>
                    <p className="text-sm">
                      <span className="font-medium text-gray-700">Sentiment:</span>{' '}
                      <span className={`font-semibold ${
                        newsAnalysis.sentiment === 'positive' ? 'text-green-600' :
                        newsAnalysis.sentiment === 'negative' ? 'text-red-600' :
                        'text-yellow-600'
                      }`}>
                        {newsAnalysis.sentiment}
                      </span>
                    </p>
                    <p className="text-sm">
                      <span className="font-medium text-gray-700">Companies:</span>{' '}
                      <span className="text-gray-600">{newsAnalysis.companies.join(', ')}</span>
                    </p>
                    <p className="text-sm">
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
            className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow"
          >
            <h2 className="text-xl font-semibold mb-4 flex items-center text-gray-900">
              <ChartBarIcon className="h-5 w-5 mr-2 text-green-600" />
              Your Portfolio
            </h2>
            <div className="space-y-4">
              <div className="flex space-x-2">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ticker Symbol</label>
                  <input
                    type="text"
                    className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white text-sm transition-all"
                    placeholder="e.g., AAPL"
                    value={newTicker}
                    onChange={(e) => setNewTicker(e.target.value)}
                  />
                </div>
                <div className="w-24">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Weight (%)</label>
                  <input
                    type="number"
                    className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white text-sm transition-all"
                    placeholder="e.g., 20"
                    value={newWeight}
                    onChange={(e) => setNewWeight(e.target.value)}
                  />
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="mt-6 bg-green-600 text-white px-3 py-3 rounded-lg hover:bg-green-700 transition-colors"
                  onClick={addToPortfolio}
                >
                  <PlusIcon className="h-5 w-5" />
                </motion.button>
              </div>

              {portfolio.length > 0 && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-4"
                >
                  <h3 className="text-lg font-semibold mb-3 text-gray-900">Current Portfolio</h3>
                  <div className="space-y-2">
                    {portfolio.map((item, index) => (
                      <motion.div 
                        key={index}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10 }}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
                      >
                        <span className="font-medium text-gray-900 text-sm">{item.ticker}</span>
                        <div className="flex items-center space-x-4">
                          <span className="text-gray-600 text-sm">{item.weight}%</span>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => removeFromPortfolio(index)}
                            className="text-red-500 hover:text-red-600"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </motion.button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        </div>

        {/* Chat Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsChatOpen(true)}
          className="fixed bottom-6 right-6 bg-purple-600 text-white p-4 rounded-full shadow-lg hover:bg-purple-700 transition-colors"
        >
          <ChatBubbleLeftIcon className="h-6 w-6" />
        </motion.button>

        {/* Chat Popup */}
        <AnimatePresence>
          {isChatOpen && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 z-50"
              onClick={() => setIsChatOpen(false)}
            >
              <motion.div 
                variants={slideIn}
                initial="initial"
                animate="animate"
                exit="exit"
                className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-xl"
                onClick={e => e.stopPropagation()}
              >
                <div className="flex items-center justify-between p-4 border-b">
                  <h2 className="text-xl font-semibold text-gray-900">AI Chatbot</h2>
                  <button 
                    onClick={() => setIsChatOpen(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>
                <div className="h-[calc(100vh-8rem)] flex flex-col">
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {chatHistory.map((chat, index) => (
                      <motion.div 
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-4"
                      >
                        <p className="font-semibold text-gray-900 text-sm">Q: {chat.question}</p>
                        <p className="mt-1 text-gray-600 text-sm">A: {chat.answer}</p>
                      </motion.div>
                    ))}
                  </div>
                  <div className="p-4 border-t">
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        className="flex-1 p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white text-sm transition-all"
                        placeholder="Ask about your portfolio or news..."
                        value={chatQuestion}
                        onChange={(e) => setChatQuestion(e.target.value)}
                      />
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="bg-purple-600 text-white px-4 py-3 rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 text-sm font-medium"
                        onClick={askChat}
                        disabled={isLoading || !chatQuestion}
                      >
                        {isLoading ? 'Thinking...' : 'Ask'}
                      </motion.button>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <footer className="bg-white border-t border-gray-200 mt-8">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-gray-600">© 2024 AI Stock News Analyzer. All rights reserved.</p>
            <div className="flex space-x-4 mt-2 md:mt-0">
              <a href="https://www.johannesborge.com" target="_blank" rel="noopener noreferrer" 
                 className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                About
              </a>
              <a href="https://www.johannesborge.com/contact" target="_blank" rel="noopener noreferrer"
                 className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                Contact
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
} 