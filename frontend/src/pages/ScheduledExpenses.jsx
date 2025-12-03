import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import api from '../utils/axios';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';

export default function ScheduledExpenses() {
  const [scheduledExpenses, setScheduledExpenses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [statusFilter, setStatusFilter] = useState('');

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  useEffect(() => {
    fetchCategories();
    fetchScheduledExpenses();
  }, [statusFilter]);

  const fetchCategories = async () => {
    try {
      const res = await api.get('/categories');
      setCategories(res.data.categories);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  const fetchScheduledExpenses = async () => {
    try {
      setLoading(true);
      const params = statusFilter ? `?status=${statusFilter}` : '';
      const res = await api.get(`/scheduled-expenses${params}`);
      setScheduledExpenses(res.data.scheduledExpenses);
    } catch (error) {
      console.error('Failed to fetch scheduled expenses:', error);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data) => {
    try {
      if (editingExpense) {
        await api.put(`/scheduled-expenses/${editingExpense.id}`, data);
      } else {
        await api.post('/scheduled-expenses', data);
      }
      setShowModal(false);
      setEditingExpense(null);
      reset();
      fetchScheduledExpenses();
    } catch (error) {
      console.error('Failed to save scheduled expense:', error);
      alert(error.response?.data?.message || 'Failed to save scheduled expense');
    }
  };

  const handleEdit = (expense) => {
    setEditingExpense(expense);
    reset({
      name: expense.name,
      amount: expense.amount,
      dueDate: new Date(expense.dueDate).toISOString().split('T')[0],
      categoryId: expense.categoryId,
      status: expense.status,
      notes: expense.notes || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this scheduled expense?')) return;

    try {
      await api.delete(`/scheduled-expenses/${id}`);
      fetchScheduledExpenses();
    } catch (error) {
      console.error('Failed to delete scheduled expense:', error);
      alert('Failed to delete scheduled expense');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'paid':
        return 'bg-green-500/10 text-green-600 dark:text-green-400';
      case 'overdue':
        return 'bg-red-500/10 text-red-600 dark:text-red-400';
      default:
        return 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400';
    }
  };

  return (
    <Layout>
      <div className="space-y-4 lg:space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <h2 className="text-2xl lg:text-3xl font-semibold text-gray-900 dark:text-white">Scheduled Expenses</h2>
          <button
            onClick={() => {
              setEditingExpense(null);
              reset();
              setShowModal(true);
            }}
            className="w-full sm:w-auto px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors shadow-sm"
          >
            + Add Scheduled Expense
          </button>
        </div>

        {/* Filter */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 lg:p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2.5 rounded-lg bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
          >
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="paid">Paid</option>
            <option value="overdue">Overdue</option>
          </select>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
            {scheduledExpenses.map((expense) => (
              <motion.div
                key={expense.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700"
              >
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold">{expense.name}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {expense.category?.name}
                    </p>
                  </div>
                  <div className="text-3xl">{expense.category?.icon || '📦'}</div>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Amount:</span>
                    <span className="font-bold">${expense.amount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Due Date:</span>
                    <span className="font-medium">
                      {new Date(expense.dueDate).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Status:</span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(expense.status)}`}>
                      {expense.status.toUpperCase()}
                    </span>
                  </div>
                  {expense.notes && (
                    <div className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                      {expense.notes}
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(expense)}
                    className="flex-1 px-3 py-2 text-sm bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded hover:bg-indigo-500/20"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(expense.id)}
                    className="flex-1 px-3 py-2 text-sm bg-red-500/10 text-red-600 dark:text-red-400 rounded hover:bg-red-500/20"
                  >
                    Delete
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto border border-gray-200 dark:border-gray-700 p-6"
            >
              <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
                {editingExpense ? 'Edit Scheduled Expense' : 'Add Scheduled Expense'}
              </h3>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Name *</label>
                  <input
                    type="text"
                    {...register('name', { required: 'Name is required' })}
                    className="w-full px-4 py-2.5 rounded-lg bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                  />
                  {errors.name && (
                    <p className="text-sm text-red-600 dark:text-red-400 mt-1">{errors.name.message}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Amount *</label>
                    <input
                      type="number"
                      step="0.01"
                      {...register('amount', { required: 'Amount is required', min: 0 })}
                      className="w-full px-4 py-2.5 rounded-lg bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Due Date *</label>
                    <input
                      type="date"
                      {...register('dueDate', { required: 'Due date is required' })}
                      className="w-full px-4 py-2.5 rounded-lg bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Category *</label>
                  <select
                    {...register('categoryId', { required: 'Category is required' })}
                    className="w-full px-4 py-2.5 rounded-lg bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                  >
                    <option value="">Select category</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>
                        {cat.icon} {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                {editingExpense && (
                  <div>
                    <label className="block text-sm font-medium mb-2">Status</label>
                    <select
                      {...register('status')}
                      className="w-full px-4 py-2.5 rounded-lg bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                    >
                      <option value="pending">Pending</option>
                      <option value="paid">Paid</option>
                      <option value="overdue">Overdue</option>
                    </select>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium mb-2">Notes</label>
                  <textarea
                    {...register('notes')}
                    rows={3}
                    className="w-full px-4 py-2.5 rounded-lg bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                  />
                </div>

                <div className="flex gap-4">
                  <button
                    type="submit"
                    className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors shadow-sm"
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
                    className="flex-1 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
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

