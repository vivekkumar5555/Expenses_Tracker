import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import api from '../utils/axios';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';

export default function Expenses() {
  const [expenses, setExpenses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    categoryId: '',
    vendor: '',
    paymentMode: '',
    startDate: '',
    endDate: '',
    search: ''
  });
  const [pagination, setPagination] = useState({});

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  useEffect(() => {
    fetchCategories();
    fetchExpenses();
  }, [filters]);

  const fetchCategories = async () => {
    try {
      const res = await api.get('/categories');
      setCategories(res.data.categories);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });

      const res = await api.get(`/expenses?${params}`);
      setExpenses(res.data.expenses);
      setPagination(res.data.pagination);
    } catch (error) {
      console.error('Failed to fetch expenses:', error);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data) => {
    try {
      if (editingExpense) {
        await api.put(`/expenses/${editingExpense.id}`, data);
      } else {
        await api.post('/expenses', data);
      }
      setShowModal(false);
      setEditingExpense(null);
      reset();
      fetchExpenses();
    } catch (error) {
      console.error('Failed to save expense:', error);
      alert(error.response?.data?.message || 'Failed to save expense');
    }
  };

  const handleEdit = (expense) => {
    setEditingExpense(expense);
    reset({
      amount: expense.amount,
      description: expense.description,
      date: new Date(expense.date).toISOString().split('T')[0],
      categoryId: expense.categoryId,
      vendor: expense.vendor || '',
      notes: expense.notes || '',
      paymentMode: expense.paymentMode,
      tags: expense.tags?.join(', ') || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this expense?')) return;

    try {
      await api.delete(`/expenses/${id}`);
      fetchExpenses();
    } catch (error) {
      console.error('Failed to delete expense:', error);
      alert('Failed to delete expense');
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }));
  };

  return (
    <Layout>
      <div className="space-y-4 lg:space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <h2 className="text-2xl lg:text-3xl font-semibold text-gray-900 dark:text-white">Expenses</h2>
          <button
            onClick={() => {
              setEditingExpense(null);
              reset();
              setShowModal(true);
            }}
            className="w-full sm:w-auto px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors shadow-sm"
          >
            + Add Expense
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 lg:p-6 shadow-sm border border-gray-200 dark:border-gray-700 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <input
            type="text"
            placeholder="Search..."
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            className="px-4 py-2.5 rounded-lg bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
          />
          <select
            value={filters.categoryId}
            onChange={(e) => handleFilterChange('categoryId', e.target.value)}
            className="px-4 py-2.5 rounded-lg bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
          >
            <option value="">All Categories</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
          <select
            value={filters.paymentMode}
            onChange={(e) => handleFilterChange('paymentMode', e.target.value)}
            className="px-4 py-2.5 rounded-lg bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
          >
            <option value="">All Payment Modes</option>
            <option value="cash">Cash</option>
            <option value="card">Card</option>
            <option value="bank_transfer">Bank Transfer</option>
            <option value="digital_wallet">Digital Wallet</option>
            <option value="other">Other</option>
          </select>
          <input
            type="date"
            value={filters.startDate}
            onChange={(e) => handleFilterChange('startDate', e.target.value)}
            className="px-4 py-2.5 rounded-lg bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
            placeholder="Start Date"
          />
        </div>

        {/* Expenses Table */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
            </div>
          ) : expenses.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700/50">
                  <tr>
                    <th className="text-left p-3 lg:p-4 text-xs lg:text-sm font-semibold text-gray-700 dark:text-gray-300">Date</th>
                    <th className="text-left p-3 lg:p-4 text-xs lg:text-sm font-semibold text-gray-700 dark:text-gray-300">Description</th>
                    <th className="text-left p-3 lg:p-4 text-xs lg:text-sm font-semibold text-gray-700 dark:text-gray-300 hidden sm:table-cell">Category</th>
                    <th className="text-left p-3 lg:p-4 text-xs lg:text-sm font-semibold text-gray-700 dark:text-gray-300 hidden md:table-cell">Vendor</th>
                    <th className="text-left p-3 lg:p-4 text-xs lg:text-sm font-semibold text-gray-700 dark:text-gray-300 hidden lg:table-cell">Payment</th>
                    <th className="text-right p-3 lg:p-4 text-xs lg:text-sm font-semibold text-gray-700 dark:text-gray-300">Amount</th>
                    <th className="text-center p-3 lg:p-4 text-xs lg:text-sm font-semibold text-gray-700 dark:text-gray-300">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {expenses.map((expense) => (
                    <motion.tr
                      key={expense.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors"
                    >
                      <td className="p-3 lg:p-4 text-sm text-gray-900 dark:text-gray-100">{new Date(expense.date).toLocaleDateString()}</td>
                      <td className="p-3 lg:p-4 text-sm text-gray-900 dark:text-gray-100">{expense.description || '-'}</td>
                      <td className="p-3 lg:p-4 text-sm text-gray-900 dark:text-gray-100 hidden sm:table-cell">
                        <span className="flex items-center gap-2">
                          <span>{expense.category?.icon}</span>
                          <span className="truncate">{expense.category?.name}</span>
                        </span>
                      </td>
                      <td className="p-3 lg:p-4 text-sm text-gray-900 dark:text-gray-100 hidden md:table-cell truncate max-w-xs">{expense.vendor || '-'}</td>
                      <td className="p-3 lg:p-4 text-sm text-gray-900 dark:text-gray-100 hidden lg:table-cell capitalize">{expense.paymentMode}</td>
                      <td className="p-3 lg:p-4 text-right text-sm font-semibold text-gray-900 dark:text-white">${expense.amount.toFixed(2)}</td>
                      <td className="p-3 lg:p-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleEdit(expense)}
                            className="px-2 lg:px-3 py-1 text-xs lg:text-sm bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded hover:bg-indigo-100 dark:hover:bg-indigo-900/30 transition-colors"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(expense.id)}
                            className="px-2 lg:px-3 py-1 text-xs lg:text-sm bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              No expenses found
            </div>
          )}

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="flex items-center justify-between mt-4 p-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Page {pagination.page} of {pagination.pages}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setFilters(prev => ({ ...prev, page: prev.page - 1 }))}
                  disabled={pagination.page === 1}
                  className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => setFilters(prev => ({ ...prev, page: prev.page + 1 }))}
                  disabled={pagination.page === pagination.pages}
                  className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="card max-w-2xl w-full max-h-[90vh] overflow-y-auto p-8"
            >
              <h3 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
                {editingExpense ? 'Edit Expense' : 'Add Expense'}
              </h3>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">Amount *</label>
                    <input
                      type="number"
                      step="0.01"
                      {...register('amount', { required: 'Amount is required', min: 0 })}
                      className="w-full px-4 py-3 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent transition-all"
                    />
                    {errors.amount && (
                      <p className="text-sm text-red-600 dark:text-red-400 mt-1">{errors.amount.message}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">Date *</label>
                    <input
                      type="date"
                      {...register('date', { required: 'Date is required' })}
                      className="w-full px-4 py-3 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                    />
                    {errors.date && (
                      <p className="text-sm text-red-600 dark:text-red-400 mt-1">{errors.date.message}</p>
                    )}
                  </div>
                </div>

                <div>
                    <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">Category *</label>
                    <select
                      {...register('categoryId', { required: 'Category is required' })}
                      className="w-full px-4 py-3 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                    >
                    <option value="">Select category</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>
                        {cat.icon} {cat.name}
                      </option>
                    ))}
                  </select>
                  {errors.categoryId && (
                    <p className="text-sm text-red-600 dark:text-red-400 mt-1">{errors.categoryId.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">Description</label>
                  <input
                    type="text"
                    {...register('description')}
                    className="w-full px-4 py-3 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">Vendor</label>
                    <input
                      type="text"
                      {...register('vendor')}
                      className="w-full px-4 py-3 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">Payment Mode</label>
                    <select
                      {...register('paymentMode')}
                      className="w-full px-4 py-3 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                    >
                      <option value="cash">Cash</option>
                      <option value="card">Card</option>
                      <option value="bank_transfer">Bank Transfer</option>
                      <option value="digital_wallet">Digital Wallet</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">Notes</label>
                  <textarea
                    {...register('notes')}
                    rows={3}
                    className="w-full px-4 py-3 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">Tags (comma separated)</label>
                  <input
                    type="text"
                    {...register('tags')}
                    placeholder="tag1, tag2, tag3"
                    className="w-full px-4 py-3 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                  />
                </div>

                <div className="flex gap-4">
                  <button
                    type="submit"
                    className="flex-1 py-3.5 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-semibold transition-all duration-200 shadow-sm hover:shadow-md"
                  >
                    {editingExpense ? 'Update' : 'Create'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      setEditingExpense(null);
                      reset();
                    }}
                    className="flex-1 py-3.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg font-semibold hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </div>
    </Layout>
  );
}

