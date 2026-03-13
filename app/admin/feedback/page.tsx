'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import type { ContentFeedback, FeedbackCategory, FeedbackStatus, PageType } from '@/lib/feedback-types';

export default function AdminFeedbackPage() {
  const t = useTranslations('feedback.admin');
  const [feedbacks, setFeedbacks] = useState<ContentFeedback[]>([]);
  const [categories, setCategories] = useState<FeedbackCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);

  // Filters
  const [statusFilter, setStatusFilter] = useState<FeedbackStatus | 'all'>('all');
  const [pageTypeFilter, setPageTypeFilter] = useState<PageType | 'all'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Selected feedback for details
  const [selectedFeedback, setSelectedFeedback] = useState<ContentFeedback | null>(null);
  const [adminNote, setAdminNote] = useState('');
  const [newStatus, setNewStatus] = useState<FeedbackStatus>('pending');

  // Stats
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    reviewing: 0,
    resolved: 0,
    dismissed: 0,
  });

  // Fetch categories
  useEffect(() => {
    fetch('/api/feedback/categories')
      .then(res => res.json())
      .then(data => setCategories(data.data || []))
      .catch(err => console.error('Error fetching categories:', err));
  }, []);

  // Fetch feedbacks
  useEffect(() => {
    fetchFeedbacks();
  }, [statusFilter, pageTypeFilter, categoryFilter, searchQuery]);

  const fetchFeedbacks = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (pageTypeFilter !== 'all') params.append('page_type', pageTypeFilter);
      if (categoryFilter !== 'all') params.append('category_slug', categoryFilter);
      if (searchQuery) params.append('search', searchQuery);

      const response = await fetch(`/api/feedback?${params.toString()}`);
      const data = await response.json();

      setFeedbacks(data.data || []);
      setTotal(data.total || 0);

      // Calculate stats
      const allFeedbacks = data.data || [];
      setStats({
        total: allFeedbacks.length,
        pending: allFeedbacks.filter((f: ContentFeedback) => f.status === 'pending').length,
        reviewing: allFeedbacks.filter((f: ContentFeedback) => f.status === 'reviewing').length,
        resolved: allFeedbacks.filter((f: ContentFeedback) => f.status === 'resolved').length,
        dismissed: allFeedbacks.filter((f: ContentFeedback) => f.status === 'dismissed').length,
      });
    } catch (error) {
      console.error('Error fetching feedbacks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateFeedback = async () => {
    if (!selectedFeedback) return;

    try {
      const response = await fetch(`/api/feedback/${selectedFeedback.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: newStatus,
          admin_note: adminNote,
        }),
      });

      if (response.ok) {
        alert('Updated successfully!');
        setSelectedFeedback(null);
        fetchFeedbacks();
      } else {
        alert('Failed to update');
      }
    } catch (error) {
      console.error('Error updating feedback:', error);
      alert('Error occurred');
    }
  };

  const handleDeleteFeedback = async (id: string) => {
    if (!confirm(t('details.confirmDelete'))) return;

    try {
      const response = await fetch(`/api/feedback/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        alert('Deleted successfully!');
        setSelectedFeedback(null);
        fetchFeedbacks();
      } else {
        alert('Failed to delete');
      }
    } catch (error) {
      console.error('Error deleting feedback:', error);
      alert('Error occurred');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">{t('title')}</h1>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          {[
            { key: 'total', label: t('stats.total'), value: stats.total, color: 'bg-blue-500' },
            { key: 'pending', label: t('stats.pending'), value: stats.pending, color: 'bg-yellow-500' },
            { key: 'reviewing', label: t('stats.reviewing'), value: stats.reviewing, color: 'bg-purple-500' },
            { key: 'resolved', label: t('stats.resolved'), value: stats.resolved, color: 'bg-green-500' },
            { key: 'dismissed', label: t('stats.dismissed'), value: stats.dismissed, color: 'bg-gray-500' },
          ].map((stat) => (
            <div key={stat.key} className="bg-white rounded-lg shadow p-4">
              <div className={`w-12 h-12 ${stat.color} rounded-full flex items-center justify-center mb-2`}>
                <span className="text-white text-xl font-bold">{stat.value}</span>
              </div>
              <p className="text-gray-600 text-sm">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="px-4 py-2 border rounded-lg"
            />

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-4 py-2 border rounded-lg"
            >
              <option value="all">{t('filters.all')} {t('filters.status')}</option>
              <option value="pending">{t('stats.pending')}</option>
              <option value="reviewing">{t('stats.reviewing')}</option>
              <option value="resolved">{t('stats.resolved')}</option>
              <option value="dismissed">{t('stats.dismissed')}</option>
            </select>

            {/* Page Type Filter */}
            <select
              value={pageTypeFilter}
              onChange={(e) => setPageTypeFilter(e.target.value as any)}
              className="px-4 py-2 border rounded-lg"
            >
              <option value="all">{t('filters.all')} {t('filters.pageType')}</option>
              <option value="journey">{t('pageTypes.journey')}</option>
              <option value="article">{t('pageTypes.article')}</option>
              <option value="quiz">{t('pageTypes.quiz')}</option>
              <option value="wisdom">{t('pageTypes.wisdom')}</option>
              <option value="qna">{t('pageTypes.qna')}</option>
              <option value="other">{t('pageTypes.other')}</option>
            </select>

            {/* Category Filter */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-4 py-2 border rounded-lg"
            >
              <option value="all">{t('filters.all')} {t('filters.category')}</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.slug}>
                  {cat.icon} {cat.name_en}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Feedbacks Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-gray-500">Loading...</div>
          ) : feedbacks.length === 0 ? (
            <div className="p-8 text-center text-gray-500">No feedback found</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">{t('table.subject')}</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">{t('table.category')}</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">{t('table.page')}</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">{t('table.status')}</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">{t('table.date')}</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">{t('table.actions')}</th>
                  </tr>
                </thead>
                <tbody>
                  {feedbacks.map((feedback) => (
                    <tr key={feedback.id} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm">{feedback.subject}</td>
                      <td className="px-4 py-3 text-sm">
                        {feedback.category?.icon} {feedback.category?.name_en}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <span className="text-xs bg-gray-100 px-2 py-1 rounded">{feedback.page_type}</span>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <span
                          className={`text-xs px-2 py-1 rounded ${
                            feedback.status === 'pending'
                              ? 'bg-yellow-100 text-yellow-800'
                              : feedback.status === 'reviewing'
                              ? 'bg-purple-100 text-purple-800'
                              : feedback.status === 'resolved'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {feedback.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {new Date(feedback.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <button
                          onClick={() => {
                            setSelectedFeedback(feedback);
                            setAdminNote(feedback.admin_note || '');
                            setNewStatus(feedback.status);
                          }}
                          className="text-blue-600 hover:text-blue-800 font-semibold"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Details Modal */}
      {selectedFeedback && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="sticky top-0 bg-gradient-to-r from-amber-500 to-orange-600 text-white p-6 rounded-t-xl">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">{t('details.title')}</h2>
                <button
                  onClick={() => setSelectedFeedback(null)}
                  className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              {/* Reported By */}
              <div>
                <p className="text-sm font-semibold text-gray-600 mb-1">{t('details.reportedBy')}</p>
                <p className="text-gray-800">
                  {selectedFeedback.user_email || t('details.anonymous')}
                </p>
              </div>

              {/* Page Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-semibold text-gray-600 mb-1">{t('details.pageType')}</p>
                  <p className="text-gray-800">{selectedFeedback.page_type}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-600 mb-1">{t('details.pagePath')}</p>
                  <a
                    href={selectedFeedback.page_path}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    {selectedFeedback.page_path}
                  </a>
                </div>
              </div>

              {/* Subject */}
              <div>
                <p className="text-sm font-semibold text-gray-600 mb-1">{t('table.subject')}</p>
                <p className="text-gray-800 font-semibold">{selectedFeedback.subject}</p>
              </div>

              {/* Description */}
              <div>
                <p className="text-sm font-semibold text-gray-600 mb-1">{t('details.description')}</p>
                <p className="text-gray-800 whitespace-pre-wrap">{selectedFeedback.description}</p>
              </div>

              {/* Suggested Correction */}
              {selectedFeedback.suggested_correction && (
                <div>
                  <p className="text-sm font-semibold text-gray-600 mb-1">{t('details.suggestion')}</p>
                  <p className="text-gray-800 bg-green-50 p-3 rounded-lg whitespace-pre-wrap">
                    {selectedFeedback.suggested_correction}
                  </p>
                </div>
              )}

              {/* Content Excerpt */}
              {selectedFeedback.content_excerpt && (
                <div>
                  <p className="text-sm font-semibold text-gray-600 mb-1">{t('details.excerpt')}</p>
                  <p className="text-gray-800 bg-amber-50 p-3 rounded-lg">{selectedFeedback.content_excerpt}</p>
                </div>
              )}

              {/* Admin Controls */}
              <div className="border-t pt-4">
                <div className="mb-4">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {t('details.changeStatus')}
                  </label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value as FeedbackStatus)}
                    className="w-full px-4 py-2 border rounded-lg"
                  >
                    <option value="pending">{t('stats.pending')}</option>
                    <option value="reviewing">{t('stats.reviewing')}</option>
                    <option value="resolved">{t('stats.resolved')}</option>
                    <option value="dismissed">{t('stats.dismissed')}</option>
                  </select>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {t('details.adminNote')}
                  </label>
                  <textarea
                    value={adminNote}
                    onChange={(e) => setAdminNote(e.target.value)}
                    placeholder={t('details.adminNotePlaceholder')}
                    rows={3}
                    className="w-full px-4 py-2 border rounded-lg"
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={handleUpdateFeedback}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-lg font-semibold"
                  >
                    {t('details.save')}
                  </button>
                  <button
                    onClick={() => handleDeleteFeedback(selectedFeedback.id)}
                    className="px-6 py-3 bg-red-500 text-white rounded-lg font-semibold"
                  >
                    {t('details.delete')}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
