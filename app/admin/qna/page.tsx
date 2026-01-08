'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';

interface Question {
  id: string;
  title: string;
  content: string;
  status: 'pending' | 'answered' | 'closed';
  view_count: number;
  created_at: string;
  category?: {
    name_th: string;
    name_en: string;
    icon: string;
  };
  user?: {
    display_name: string;
  };
  answers?: { id: string }[];
}

export default function AdminQnAPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'answered'>('pending');
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
  const [answerContent, setAnswerContent] = useState('');
  const [answerSources, setAnswerSources] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchQuestions = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== 'all') {
        params.append('status', statusFilter);
      }

      const response = await fetch(`/api/qna?${params.toString()}`);
      const data = await response.json();

      if (data.questions) {
        setQuestions(data.questions);
      }
    } catch (error) {
      console.error('Error fetching questions:', error);
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  const handleSubmitAnswer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedQuestion) return;

    setSubmitting(true);
    try {
      // Get auth token from session storage
      const authToken = sessionStorage.getItem('admin_auth_token');

      const response = await fetch(`/api/qna/${selectedQuestion.id}/answer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          content: answerContent,
          sources: answerSources.split('\n').filter(s => s.trim()),
        }),
      });

      if (response.ok) {
        setSelectedQuestion(null);
        setAnswerContent('');
        setAnswerSources('');
        fetchQuestions();
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to submit answer');
      }
    } catch (error) {
      console.error('Error submitting answer:', error);
      alert('Failed to submit answer');
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Q&A Management</h1>
        <Link
          href="/admin"
          className="text-gray-600 hover:text-gray-900"
        >
          ← Back to Dashboard
        </Link>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-6">
        {(['all', 'pending', 'answered'] as const).map((status) => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              statusFilter === status
                ? 'bg-green-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {status === 'all' && 'All'}
            {status === 'pending' && 'Pending'}
            {status === 'answered' && 'Answered'}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Questions List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-200 bg-gray-50">
            <h2 className="font-semibold text-gray-900">Questions</h2>
          </div>

          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-4 border-green-600 border-t-transparent mx-auto" />
            </div>
          ) : questions.length > 0 ? (
            <div className="divide-y divide-gray-100 max-h-[600px] overflow-y-auto">
              {questions.map((question) => (
                <button
                  key={question.id}
                  onClick={() => setSelectedQuestion(question)}
                  className={`w-full p-4 text-left hover:bg-gray-50 transition-colors ${
                    selectedQuestion?.id === question.id ? 'bg-green-50' : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">{question.category?.icon || '❓'}</span>
                    <div className="flex-grow min-w-0">
                      <h3 className="font-medium text-gray-900 line-clamp-1">
                        {question.title}
                      </h3>
                      <p className="text-sm text-gray-500 line-clamp-1 mt-1">
                        {question.content}
                      </p>
                      <div className="flex items-center gap-2 mt-2 text-xs text-gray-400">
                        <span className={`px-2 py-0.5 rounded-full ${
                          question.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {question.status}
                        </span>
                        <span>{question.user?.display_name || 'Anonymous'}</span>
                        <span>{formatDate(question.created_at)}</span>
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-gray-500">
              No questions found
            </div>
          )}
        </div>

        {/* Answer Form */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-200 bg-gray-50">
            <h2 className="font-semibold text-gray-900">
              {selectedQuestion ? 'Answer Question' : 'Select a Question'}
            </h2>
          </div>

          {selectedQuestion ? (
            <div className="p-4">
              {/* Question Details */}
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xl">{selectedQuestion.category?.icon}</span>
                  <span className="text-sm text-gray-500">
                    {selectedQuestion.category?.name_th}
                  </span>
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{selectedQuestion.title}</h3>
                <p className="text-gray-700 text-sm whitespace-pre-wrap">
                  {selectedQuestion.content}
                </p>
                <div className="mt-2 text-xs text-gray-400">
                  By {selectedQuestion.user?.display_name || 'Anonymous'} • {formatDate(selectedQuestion.created_at)}
                </div>
              </div>

              {/* Answer Form */}
              {selectedQuestion.status === 'pending' ? (
                <form onSubmit={handleSubmitAnswer}>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Answer
                    </label>
                    <textarea
                      value={answerContent}
                      onChange={(e) => setAnswerContent(e.target.value)}
                      required
                      rows={8}
                      placeholder="Write your answer here..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    />
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Sources (one per line)
                    </label>
                    <textarea
                      value={answerSources}
                      onChange={(e) => setAnswerSources(e.target.value)}
                      rows={3}
                      placeholder="Quran 2:286&#10;Sahih Bukhari&#10;..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50"
                  >
                    {submitting ? 'Submitting...' : 'Submit Answer'}
                  </button>
                </form>
              ) : (
                <div className="p-4 bg-green-50 rounded-lg text-center text-green-700">
                  This question has already been answered.
                </div>
              )}
            </div>
          ) : (
            <div className="p-8 text-center text-gray-500">
              <span className="text-4xl block mb-2">👈</span>
              Select a question from the list to answer
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
