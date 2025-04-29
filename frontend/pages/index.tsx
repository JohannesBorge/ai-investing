import React, { useState } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { ChatBubbleLeftIcon, ChartBarIcon, NewspaperIcon, PlusIcon, TrashIcon, XMarkIcon, ArrowTrendingUpIcon } from '@heroicons/react/24/outline';
import Navbar from '../components/Navbar';

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

const features = [
  {
    name: 'News Analysis',
    description: 'Get AI-powered analysis of market news and its impact on your portfolio.',
    icon: NewspaperIcon,
  },
  {
    name: 'Portfolio Tracking',
    description: 'Track your investments and get real-time insights about your portfolio.',
    icon: ChartBarIcon,
  },
  {
    name: 'AI Chat Assistant',
    description: 'Get instant answers to your investment questions from our AI assistant.',
    icon: ChatBubbleLeftIcon,
  },
  {
    name: 'Market Insights',
    description: 'Stay ahead with advanced market analysis and trend predictions.',
    icon: ArrowTrendingUpIcon,
  },
];

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
      <Navbar />

      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="relative z-10 pb-8 bg-white sm:pb-16 md:pb-20 lg:max-w-2xl lg:w-full lg:pb-28 xl:pb-32">
            <main className="mt-10 mx-auto max-w-7xl px-4 sm:mt-12 sm:px-6 md:mt-16 lg:mt-20 lg:px-8 xl:mt-28">
              <div className="sm:text-center lg:text-left">
                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl"
                >
                  <span className="block">Intelligent</span>
                  <span className="block text-blue-600">Stock Analysis</span>
                </motion.h1>
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="mt-3 text-base text-gray-500 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0"
                >
                  Leverage AI to analyze market news, track your portfolio, and get real-time insights to make better investment decisions.
                </motion.p>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="mt-5 sm:mt-8 sm:flex sm:justify-center lg:justify-start"
                >
                  <div className="rounded-md shadow">
                    <a
                      href="/dashboard"
                      className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 md:py-4 md:text-lg md:px-10"
                    >
                      Get Started
                    </a>
                  </div>
                  <div className="mt-3 sm:mt-0 sm:ml-3">
                    <a
                      href="/news"
                      className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 md:py-4 md:text-lg md:px-10"
                    >
                      View News
                    </a>
                  </div>
                </motion.div>
              </div>
            </main>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center">
            <h2 className="text-base text-blue-600 font-semibold tracking-wide uppercase">Features</h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              Everything you need to invest smarter
            </p>
            <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
              Our platform combines cutting-edge AI technology with comprehensive market analysis to help you make better investment decisions.
            </p>
          </div>

          <div className="mt-10">
            <div className="space-y-10 md:space-y-0 md:grid md:grid-cols-2 md:gap-x-8 md:gap-y-10">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="relative"
                >
                  <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white">
                    <feature.icon className="h-6 w-6" aria-hidden="true" />
                  </div>
                  <p className="ml-16 text-lg leading-6 font-medium text-gray-900">{feature.name}</p>
                  <p className="mt-2 ml-16 text-base text-gray-500">{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white">
        <div className="max-w-7xl mx-auto py-12 px-4 overflow-hidden sm:px-6 lg:px-8">
          <nav className="-mx-5 -my-2 flex flex-wrap justify-center" aria-label="Footer">
            <div className="px-5 py-2">
              <a href="/about" className="text-base text-gray-500 hover:text-gray-900">
                About
              </a>
            </div>
            <div className="px-5 py-2">
              <a href="/contact" className="text-base text-gray-500 hover:text-gray-900">
                Contact
              </a>
            </div>
            <div className="px-5 py-2">
              <a href="/privacy" className="text-base text-gray-500 hover:text-gray-900">
                Privacy
              </a>
            </div>
            <div className="px-5 py-2">
              <a href="/terms" className="text-base text-gray-500 hover:text-gray-900">
                Terms
              </a>
            </div>
          </nav>
          <p className="mt-8 text-center text-base text-gray-400">
            &copy; 2024 AI Stock News. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
} 