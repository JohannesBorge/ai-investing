import React, { useState } from 'react';
import { motion } from 'framer-motion';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import {
  ChartBarIcon,
  NewspaperIcon,
  UserIcon,
  CogIcon,
  BellIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';

const activities = [
  {
    id: 1,
    type: 'news',
    icon: NewspaperIcon,
    title: 'News Analysis',
    description: 'Analyzed news article about Apple Inc.',
    timestamp: '2 hours ago',
    category: 'Portfolio',
  },
  {
    id: 2,
    type: 'portfolio',
    icon: ChartBarIcon,
    title: 'Portfolio Update',
    description: 'Updated portfolio weights for AAPL and MSFT',
    timestamp: '4 hours ago',
    category: 'Portfolio',
  },
  {
    id: 3,
    type: 'system',
    icon: CogIcon,
    title: 'System Update',
    description: 'System maintenance completed',
    timestamp: '6 hours ago',
    category: 'System',
  },
  {
    id: 4,
    type: 'user',
    icon: UserIcon,
    title: 'Profile Update',
    description: 'Updated notification preferences',
    timestamp: '1 day ago',
    category: 'User',
  },
  {
    id: 5,
    type: 'notification',
    icon: BellIcon,
    title: 'New Alert',
    description: 'Received market volatility alert',
    timestamp: '1 day ago',
    category: 'Notification',
  },
  {
    id: 6,
    type: 'system',
    icon: ArrowPathIcon,
    title: 'Data Refresh',
    description: 'Refreshed market data for all tracked stocks',
    timestamp: '2 days ago',
    category: 'System',
  },
];

const categories = [
  { id: 'all', name: 'All Activities' },
  { id: 'portfolio', name: 'Portfolio' },
  { id: 'news', name: 'News' },
  { id: 'system', name: 'System' },
  { id: 'user', name: 'User' },
  { id: 'notification', name: 'Notifications' },
];

export default function Activity() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredActivities = activities.filter((activity) => {
    const matchesCategory = selectedCategory === 'all' || activity.category === selectedCategory;
    const matchesSearch = activity.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         activity.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Activity Logs</h1>
          <p className="mt-1 text-sm text-gray-500">
            Track your account activity and system events.
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <div className="flex space-x-2">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                    selectedCategory === category.id
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </div>
            <div className="relative">
              <input
                type="text"
                placeholder="Search activities..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full sm:w-64 pl-10 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Activity Timeline */}
        <div className="bg-white rounded-xl shadow-sm">
          <div className="px-6 py-4 border-b">
            <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
          </div>
          <div className="divide-y">
            {filteredActivities.map((activity, index) => (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="px-6 py-4"
              >
                <div className="flex items-start space-x-4">
                  <div className={`p-2 rounded-lg ${
                    activity.type === 'news' ? 'bg-blue-100' :
                    activity.type === 'portfolio' ? 'bg-green-100' :
                    activity.type === 'system' ? 'bg-gray-100' :
                    activity.type === 'user' ? 'bg-purple-100' :
                    'bg-yellow-100'
                  }`}>
                    <activity.icon className={`w-5 h-5 ${
                      activity.type === 'news' ? 'text-blue-600' :
                      activity.type === 'portfolio' ? 'text-green-600' :
                      activity.type === 'system' ? 'text-gray-600' :
                      activity.type === 'user' ? 'text-purple-600' :
                      'text-yellow-600'
                    }`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                      <p className="text-sm text-gray-500">{activity.timestamp}</p>
                    </div>
                    <p className="mt-1 text-sm text-gray-500">{activity.description}</p>
                    <div className="mt-2">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        activity.category === 'Portfolio' ? 'bg-purple-100 text-purple-800' :
                        activity.category === 'System' ? 'bg-gray-100 text-gray-800' :
                        activity.category === 'User' ? 'bg-blue-100 text-blue-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {activity.category}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
} 