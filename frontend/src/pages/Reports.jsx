import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import api from '../utils/axios';
import { motion, AnimatePresence } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import Toast from '../components/Toast';
import { useToast } from '../hooks/useToast';
import { useTranslation } from '../hooks/useTranslation';

export default function Reports() {
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { toast, showToast, hideToast } = useToast();
  const { t } = useTranslation();
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: ''
  });

  useEffect(() => {
    fetchReports();
  }, [dateRange]);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (dateRange.startDate) params.append('startDate', dateRange.startDate);
      if (dateRange.endDate) params.append('endDate', dateRange.endDate);

      const res = await api.get(`/reports/summary?${params}`);
      setReportData(res.data);
    } catch (error) {
      console.error('Failed to fetch reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = async () => {
    try {
      const params = new URLSearchParams();
      if (dateRange.startDate) params.append('startDate', dateRange.startDate);
      if (dateRange.endDate) params.append('endDate', dateRange.endDate);

      const response = await api.get(`/reports/export-csv?${params}`, {
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `expenses-${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      showToast(t('reports.exportCSV') + ' - Success!', 'success');
    } catch (error) {
      console.error('Failed to export CSV:', error);
      showToast(t('reports.exportFailed'), 'error');
    }
  };

  const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#ef4444'];

  if (loading) {
    return (
      <Layout>
        <AnimatePresence>
          {toast && (
            <Toast
              message={toast.message}
              type={toast.type}
              duration={toast.duration}
              onClose={hideToast}
            />
          )}
        </AnimatePresence>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <AnimatePresence>
        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            duration={toast.duration}
            onClose={hideToast}
          />
        )}
      </AnimatePresence>
      <div className="space-y-4 lg:space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <h2 className="text-2xl lg:text-3xl font-semibold text-gray-900 dark:text-white">Reports</h2>
          <button
            onClick={handleExportCSV}
            className="w-full sm:w-auto px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors shadow-sm flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Export CSV
          </button>
        </div>

        {/* Date Range Filter */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 lg:p-6 shadow-sm border border-gray-200 dark:border-gray-700 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Start Date</label>
            <input
              type="date"
              value={dateRange.startDate}
              onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
              className="w-full px-4 py-2.5 rounded-lg bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">End Date</label>
            <input
              type="date"
              value={dateRange.endDate}
              onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
              className="w-full px-4 py-2.5 rounded-lg bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={() => setDateRange({ startDate: '', endDate: '' })}
              className="w-full px-4 py-2.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 lg:gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700"
          >
            <p className="text-sm text-gray-600 dark:text-gray-400">Total Expenses</p>
            <p className="text-3xl font-bold mt-2">
              ${reportData?.summary?.totalExpenses?.toFixed(2) || '0.00'}
            </p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-card"
          >
            <p className="text-sm text-gray-600 dark:text-gray-400">Total Transactions</p>
            <p className="text-3xl font-bold mt-2">{reportData?.summary?.totalCount || 0}</p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-card"
          >
            <p className="text-sm text-gray-600 dark:text-gray-400">Average Expense</p>
            <p className="text-3xl font-bold mt-2">
              ${reportData?.summary?.averageExpense?.toFixed(2) || '0.00'}
            </p>
          </motion.div>
        </div>

        {/* Category Breakdown */}
        {reportData?.categoryBreakdown?.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700"
          >
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Category Breakdown</h3>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={reportData.categoryBreakdown}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="category.name" />
                <YAxis />
                <Tooltip formatter={(value) => `$${value.toFixed(2)}`} />
                <Bar dataKey="amount" fill="#6366f1" />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>
        )}

        {/* Vendor Breakdown */}
        {reportData?.vendorBreakdown?.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700"
          >
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Vendor Breakdown</h3>
            <div className="space-y-3">
              {reportData.vendorBreakdown.slice(0, 10).map((vendor, index) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-white/5 dark:bg-gray-800/5">
                  <div>
                    <p className="font-medium">{vendor.vendor}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {vendor.count} transactions • {vendor.percentage.toFixed(1)}%
                    </p>
                  </div>
                  <p className="font-bold text-lg">${vendor.amount.toFixed(2)}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Payment Mode Breakdown */}
        {reportData?.paymentModeBreakdown?.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700"
          >
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Payment Mode Breakdown</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={reportData.paymentModeBreakdown}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ mode, percentage }) => `${mode} (${percentage.toFixed(1)}%)`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="amount"
                >
                  {reportData.paymentModeBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `$${value.toFixed(2)}`} />
              </PieChart>
            </ResponsiveContainer>
          </motion.div>
        )}

        {/* Monthly Trend */}
        {reportData?.monthlyTrend?.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700"
          >
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Monthly Trend</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={reportData.monthlyTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => `$${value.toFixed(2)}`} />
                <Line type="monotone" dataKey="amount" stroke="#6366f1" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>
        )}
      </div>
    </Layout>
  );
}

