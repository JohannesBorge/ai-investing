import React from 'react';
import { motion } from 'framer-motion';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import {
  ChartBarIcon,
  CurrencyDollarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
} from '@heroicons/react/24/outline';

const metrics = [
  {
    name: 'Portfolio Value',
    value: '$124,563.00',
    change: '+12.5%',
    trend: 'up',
    icon: CurrencyDollarIcon,
  },
  {
    name: 'News Sentiment',
    value: 'Positive',
    change: '+5.2%',
    trend: 'up',
    icon: ChartBarIcon,
  },
  {
    name: 'Market Volatility',
    value: 'Low',
    change: '-2.1%',
    trend: 'down',
    icon: ArrowTrendingDownIcon,
  },
  {
    name: 'Portfolio Growth',
    value: '+8.3%',
    change: '+1.2%',
    trend: 'up',
    icon: ArrowTrendingUpIcon,
  },
];

const recentNews = [
  {
    title: 'Apple Announces New AI Features',
    category: 'Portfolio',
    sentiment: 'Positive',
    date: '2 hours ago',
  },
  {
    title: 'Global Market Update: Tech Sector Surges',
    category: 'Global',
    sentiment: 'Positive',
    date: '4 hours ago',
  },
  {
    title: 'Local Market Analysis: Regional Growth',
    category: 'Local',
    sentiment: 'Neutral',
    date: '6 hours ago',
  },
];

export default function Dashboard() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-1 text-sm text-gray-500">
            Welcome back! Here's an overview of your portfolio and market insights.
          </p>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {metrics.map((metric, index) => (
            <motion.div
              key={metric.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-xl shadow-sm p-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">{metric.name}</p>
                  <p className="mt-1 text-2xl font-semibold text-gray-900">{metric.value}</p>
                </div>
                <div className={`p-3 rounded-full ${
                  metric.trend === 'up' ? 'bg-green-100' : 'bg-red-100'
                }`}>
                  <metric.icon className={`w-6 h-6 ${
                    metric.trend === 'up' ? 'text-green-600' : 'text-red-600'
                  }`} />
                </div>
              </div>
              <div className="mt-4">
                <span className={`text-sm font-medium ${
                  metric.trend === 'up' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {metric.change}
                </span>
                <span className="text-sm text-gray-500"> from last month</span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Recent News */}
        <div className="bg-white rounded-xl shadow-sm">
          <div className="px-6 py-4 border-b">
            <h2 className="text-lg font-semibold text-gray-900">Recent News</h2>
          </div>
          <div className="divide-y">
            {recentNews.map((news, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="px-6 py-4"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">{news.title}</h3>
                    <div className="mt-1 flex items-center space-x-2">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        news.category === 'Portfolio' ? 'bg-purple-100 text-purple-800' :
                        news.category === 'Local' ? 'bg-blue-100 text-blue-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {news.category}
                      </span>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        news.sentiment === 'Positive' ? 'bg-green-100 text-green-800' :
                        news.sentiment === 'Negative' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {news.sentiment}
                      </span>
                    </div>
                  </div>
                  <span className="text-sm text-gray-500">{news.date}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Portfolio Performance Chart */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Portfolio Performance</h2>
          <div className="h-80 bg-gray-50 rounded-lg flex items-center justify-center">
            <p className="text-gray-500">Chart will be implemented here</p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
} 