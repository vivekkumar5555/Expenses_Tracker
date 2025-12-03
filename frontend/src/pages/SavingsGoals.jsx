import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import api from '../utils/axios';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';

export default function SavingsGoals() {
  const [savingsGoals, setSavingsGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  useEffect(() => {
    fetchSavingsGoals();
  }, []);

  const fetchSavingsGoals = async () => {
    try {
      setLoading(true);
      const res = await api.get('/savings-goals');
      setSavingsGoals(res.data.savingsGoals);
    } catch (error) {
      console.error('Failed to fetch savings goals:', error);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data) => {
    try {
      if (editingGoal) {
        await api.put(`/savings-goals/${editingGoal.id}`, data);
      } else {
        await api.post('/savings-goals', data);
      }
      setShowModal(false);
      setEditingGoal(null);
      reset();
      fetchSavingsGoals();
    } catch (error) {
      console.error('Failed to save savings goal:', error);
      alert(error.response?.data?.message || 'Failed to save savings goal');
    }
  };

  const handleEdit = (goal) => {
    setEditingGoal(goal);
    reset({
      name: goal.name,
      targetAmount: goal.targetAmount,
      currentAmount: goal.currentAmount,
      targetDate: new Date(goal.targetDate).toISOString().split('T')[0]
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this savings goal?')) return;

    try {
      await api.delete(`/savings-goals/${id}`);
      fetchSavingsGoals();
    } catch (error) {
      console.error('Failed to delete savings goal:', error);
      alert('Failed to delete savings goal');
    }
  };

  return (
    <Layout>
      <div className="space-y-4 lg:space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <h2 className="text-2xl lg:text-3xl font-semibold text-gray-900 dark:text-white">Savings Goals</h2>
          <button
            onClick={() => {
              setEditingGoal(null);
              reset();
              setShowModal(true);
            }}
            className="w-full sm:w-auto px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors shadow-sm"
          >
            + Add Savings Goal
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
            {savingsGoals.map((goal) => (
              <motion.div
                key={goal.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700"
              >
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold">{goal.name}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Target: {new Date(goal.targetDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>

                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Progress</span>
                    <span className="text-sm font-bold">
                      {goal.percentage.toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                    <div
                      className="h-3 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 transition-all"
                      style={{ width: `${Math.min(goal.percentage, 100)}%` }}
                    />
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Target:</span>
                    <span className="font-bold">${goal.targetAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Current:</span>
                    <span className="font-bold">${goal.currentAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Remaining:</span>
                    <span className="font-bold text-indigo-600 dark:text-indigo-400">
                      ${goal.remaining.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Daily Required:</span>
                    <span className="font-medium">
                      ${goal.requiredDaily.toFixed(2)}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(goal)}
                    className="flex-1 px-3 py-2 text-sm bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded hover:bg-indigo-500/20"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(goal.id)}
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
                {editingGoal ? 'Edit Savings Goal' : 'Add Savings Goal'}
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
                    <label className="block text-sm font-medium mb-2">Target Amount *</label>
                    <input
                      type="number"
                      step="0.01"
                      {...register('targetAmount', { required: 'Target amount is required', min: 0 })}
                      className="w-full px-4 py-2.5 rounded-lg bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                    />
                    {errors.targetAmount && (
                      <p className="text-sm text-red-600 dark:text-red-400 mt-1">{errors.targetAmount.message}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Current Amount</label>
                    <input
                      type="number"
                      step="0.01"
                      {...register('currentAmount', { min: 0 })}
                      defaultValue={0}
                      className="w-full px-4 py-2.5 rounded-lg bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Target Date *</label>
                  <input
                    type="date"
                    {...register('targetDate', { required: 'Target date is required' })}
                    className="w-full px-4 py-2.5 rounded-lg bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                  />
                  {errors.targetDate && (
                    <p className="text-sm text-red-600 dark:text-red-400 mt-1">{errors.targetDate.message}</p>
                  )}
                </div>

                <div className="flex gap-4">
                  <button
                    type="submit"
                    className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors shadow-sm"
                  >
                    {editingGoal ? 'Update' : 'Create'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      setEditingGoal(null);
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

