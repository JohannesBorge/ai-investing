import React, { useState } from 'react';
import { motion } from 'framer-motion';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import { CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';

const plans = [
  {
    name: 'Basic',
    price: '$9',
    period: 'month',
    features: [
      'Basic news analysis',
      'Portfolio tracking',
      'Email notifications',
      'Basic market insights',
    ],
    current: false,
  },
  {
    name: 'Pro',
    price: '$29',
    period: 'month',
    features: [
      'Advanced news analysis',
      'Portfolio optimization',
      'Real-time notifications',
      'AI-powered insights',
      'Priority support',
      'Custom reports',
    ],
    current: true,
  },
  {
    name: 'Enterprise',
    price: '$99',
    period: 'month',
    features: [
      'Everything in Pro',
      'Custom AI models',
      'API access',
      'Dedicated support',
      'Team collaboration',
      'Advanced analytics',
    ],
    current: false,
  },
];

const paymentHistory = [
  {
    id: 'INV-001',
    date: 'Mar 1, 2024',
    amount: '$29.00',
    status: 'Paid',
    method: 'Credit Card',
  },
  {
    id: 'INV-002',
    date: 'Feb 1, 2024',
    amount: '$29.00',
    status: 'Paid',
    method: 'Credit Card',
  },
  {
    id: 'INV-003',
    date: 'Jan 1, 2024',
    amount: '$29.00',
    status: 'Paid',
    method: 'Credit Card',
  },
];

export default function Billing() {
  const [selectedPlan, setSelectedPlan] = useState('Pro');

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Billing & Subscriptions</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage your subscription and payment methods.
          </p>
        </div>

        {/* Current Plan */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Current Plan</h2>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">You are currently on the</p>
              <p className="text-2xl font-bold text-gray-900">Pro Plan</p>
            </div>
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
              Change Plan
            </button>
          </div>
        </div>

        {/* Available Plans */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {plans.map((plan) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`bg-white rounded-xl shadow-sm p-6 ${
                plan.current ? 'ring-2 ring-blue-500' : ''
              }`}
            >
              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-900">{plan.name}</h3>
                <div className="mt-4">
                  <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                  <span className="text-gray-500">/{plan.period}</span>
                </div>
              </div>
              <ul className="mt-6 space-y-4">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start">
                    <CheckIcon className="w-5 h-5 text-green-500 mr-2" />
                    <span className="text-sm text-gray-600">{feature}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-6">
                <button
                  className={`w-full px-4 py-2 rounded-lg transition-colors ${
                    plan.current
                      ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                  disabled={plan.current}
                >
                  {plan.current ? 'Current Plan' : 'Select Plan'}
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Payment History */}
        <div className="bg-white rounded-xl shadow-sm">
          <div className="px-6 py-4 border-b">
            <h2 className="text-lg font-semibold text-gray-900">Payment History</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Invoice
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Method
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paymentHistory.map((payment) => (
                  <tr key={payment.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {payment.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {payment.date}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {payment.amount}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        {payment.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {payment.method}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
} 