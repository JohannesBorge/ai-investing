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
    name: 'AI-Powered Analysis',
    description: 'Get instant insights from our advanced AI system that analyzes market news and trends.',
    icon: NewspaperIcon,
  },
  {
    name: 'Smart Portfolio',
    description: 'Track and optimize your investments with real-time data and intelligent recommendations.',
    icon: ChartBarIcon,
  },
  {
    name: 'Expert Guidance',
    description: 'Get personalized advice from our AI assistant to make better investment decisions.',
    icon: ChatBubbleLeftIcon,
  },
  {
    name: 'Market Intelligence',
    description: 'Stay ahead with comprehensive market analysis and predictive insights.',
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
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero Section */}
      <section className="hero-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="hero-title"
            >
              You Don't Need More Data.
              <br />
              You Need Better Insights.
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="hero-subtitle"
            >
              For investors looking to make smarter decisions. I combine AI-powered analysis and expert insights to help you navigate the market with confidence.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mt-10 flex flex-col sm:flex-row justify-center gap-4"
            >
              <a href="/dashboard" className="btn-primary">
                Get Started
              </a>
              <a href="/contact" className="btn-secondary">
                Contact Me
              </a>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Everything you need to invest smarter
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Our platform combines cutting-edge AI technology with comprehensive market analysis to help you make better investment decisions.
            </p>
          </div>

          <div className="mt-20 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature, index) => (
              <motion.div
                key={feature.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="feature-card"
              >
                <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-black text-white">
                  <feature.icon className="h-6 w-6" aria-hidden="true" />
                </div>
                <h3 className="mt-6 text-xl font-semibold text-gray-900">{feature.name}</h3>
                <p className="mt-2 text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-black text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Ready to start investing smarter?
          </h2>
          <p className="mt-4 text-lg text-gray-300">
            Join thousands of investors who are already using our platform to make better decisions.
          </p>
          <div className="mt-8">
            <a href="/dashboard" className="btn-primary bg-white text-black hover:bg-gray-100">
              Get Started Now
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex flex-wrap justify-center gap-8" aria-label="Footer">
            <a href="/about" className="footer-link">
              About
            </a>
            <a href="/contact" className="footer-link">
              Contact
            </a>
            <a href="/privacy" className="footer-link">
              Privacy
            </a>
            <a href="/terms" className="footer-link">
              Terms
            </a>
          </nav>
          <p className="mt-8 text-center text-gray-500">
            &copy; 2024 AI Stock News. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
} 