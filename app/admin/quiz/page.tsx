'use client';

import { useState, useEffect, useCallback } from 'react';
import Papa from 'papaparse';

interface Quiz {
  id: string;
  title_th: string;
  title_en: string;
  description_th?: string;
  description_en?: string;
  category: string;
  difficulty: string;
  questions_count: number;
  is_published: boolean;
  created_at: string;
}

interface ParsedQuestion {
  order: number;
  question_th: string;
  question_en: string;
  option_1_th: string;
  option_1_en: string;
  option_2_th: string;
  option_2_en: string;
  option_3_th: string;
  option_3_en: string;
  option_4_th: string;
  option_4_en: string;
  correct_answer: number;
  explanation_th: string;
  explanation_en: string;
}

const categories = [
  { value: 'salah', label: 'ละหมาด' },
  { value: 'wudu', label: 'วุฎูอฺ' },
  { value: 'umrah', label: 'อุมเราะฮ์' },
  { value: 'hajj', label: 'ฮัจญ์' },
  { value: 'zakat', label: 'ซะกาต' },
  { value: 'sawm', label: 'ถือศีลอด' },
  { value: 'adhkar', label: 'อัซการ์' },
  { value: 'general', label: 'ทั่วไป' },
];

const difficulties = [
  { value: 'easy', label: 'ง่าย' },
  { value: 'medium', label: 'ปานกลาง' },
  { value: 'hard', label: 'ยาก' },
];

export default function AdminQuizPage() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [parsedQuestions, setParsedQuestions] = useState<ParsedQuestion[]>([]);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    title_th: '',
    title_en: '',
    description_th: '',
    description_en: '',
    category: 'general',
    difficulty: 'medium',
    is_published: false,
  });

  const fetchQuizzes = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/quiz');
      const data = await res.json();
      setQuizzes(data);
    } catch (error) {
      console.error('Error fetching quizzes:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchQuizzes();
  }, [fetchQuizzes]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError(null);
    setParsedQuestions([]);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      encoding: 'UTF-8',
      complete: (results) => {
        try {
          const questions: ParsedQuestion[] = (results.data as Record<string, string>[]).map((row, index) => {
            // Support both Thai and English column names
            const order = row['ลำดับ'] || row['order'] || (index + 1);
            const question = row['คำถาม'] || row['question'] || '';
            const option1 = row['ตัวเลือก 1'] || row['option_1'] || '';
            const option2 = row['ตัวเลือก 2'] || row['option_2'] || '';
            const option3 = row['ตัวเลือก 3'] || row['option_3'] || '';
            const option4 = row['ตัวเลือก 4'] || row['option_4'] || '';
            const correctAnswer = row['คำตอบที่ถูก'] || row['correct_answer'] || '1';
            const explanation = row['เฉลยละเอียด'] || row['explanation'] || '';

            return {
              order: Number(order),
              question_th: question,
              question_en: question, // Same as Thai for now
              option_1_th: option1,
              option_1_en: option1,
              option_2_th: option2,
              option_2_en: option2,
              option_3_th: option3,
              option_3_en: option3,
              option_4_th: option4,
              option_4_en: option4,
              correct_answer: Number(correctAnswer),
              explanation_th: explanation,
              explanation_en: explanation,
            };
          });

          // Validate questions
          const validQuestions = questions.filter(q =>
            q.question_th &&
            q.option_1_th &&
            q.option_2_th &&
            q.option_3_th &&
            q.option_4_th &&
            q.correct_answer >= 1 &&
            q.correct_answer <= 4
          );

          if (validQuestions.length === 0) {
            setUploadError('ไม่พบคำถามที่ถูกต้องในไฟล์ กรุณาตรวจสอบรูปแบบไฟล์');
            return;
          }

          setParsedQuestions(validQuestions);
        } catch (error) {
          console.error('Parse error:', error);
          setUploadError('เกิดข้อผิดพลาดในการอ่านไฟล์');
        }
      },
      error: (error) => {
        console.error('CSV parse error:', error);
        setUploadError('ไม่สามารถอ่านไฟล์ได้ กรุณาตรวจสอบรูปแบบไฟล์');
      },
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (parsedQuestions.length === 0) {
      setUploadError('กรุณาอัปโหลดไฟล์คำถาม');
      return;
    }

    setIsUploading(true);

    try {
      const res = await fetch('/api/admin/quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quiz: formData,
          questions: parsedQuestions,
        }),
      });

      if (!res.ok) throw new Error('Failed to create quiz');

      // Reset form
      setFormData({
        title_th: '',
        title_en: '',
        description_th: '',
        description_en: '',
        category: 'general',
        difficulty: 'medium',
        is_published: false,
      });
      setParsedQuestions([]);
      setShowModal(false);
      fetchQuizzes();
    } catch (error) {
      console.error('Error creating quiz:', error);
      setUploadError('เกิดข้อผิดพลาดในการสร้างควิซ');
    } finally {
      setIsUploading(false);
    }
  };

  const togglePublish = async (quiz: Quiz) => {
    try {
      await fetch(`/api/admin/quiz/${quiz.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...quiz, is_published: !quiz.is_published }),
      });
      fetchQuizzes();
    } catch (error) {
      console.error('Error updating quiz:', error);
    }
  };

  const deleteQuiz = async (id: string) => {
    if (!confirm('คุณแน่ใจหรือไม่ที่จะลบควิซนี้?')) return;

    try {
      await fetch(`/api/admin/quiz/${id}`, { method: 'DELETE' });
      fetchQuizzes();
    } catch (error) {
      console.error('Error deleting quiz:', error);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">จัดการควิซ</h1>
          <p className="text-gray-500 mt-1">อัปโหลดและจัดการควิซทดสอบความรู้</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
        >
          <span>➕</span>
          <span>เพิ่มควิซใหม่</span>
        </button>
      </div>

      {/* Quiz List */}
      {isLoading ? (
        <div className="text-center py-12 text-gray-500">กำลังโหลด...</div>
      ) : quizzes.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center">
          <span className="text-6xl mb-4 block">📝</span>
          <h2 className="text-xl font-medium text-gray-700 mb-2">ยังไม่มีควิซ</h2>
          <p className="text-gray-500">เริ่มต้นสร้างควิซแรกของคุณ</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">ชื่อควิซ</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">หมวดหมู่</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">ระดับ</th>
                <th className="text-center px-6 py-4 text-sm font-medium text-gray-500">จำนวนข้อ</th>
                <th className="text-center px-6 py-4 text-sm font-medium text-gray-500">สถานะ</th>
                <th className="text-right px-6 py-4 text-sm font-medium text-gray-500">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {quizzes.map((quiz) => (
                <tr key={quiz.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-800">{quiz.title_th}</div>
                    <div className="text-sm text-gray-500">{quiz.title_en}</div>
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    {categories.find(c => c.value === quiz.category)?.label || quiz.category}
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    {difficulties.find(d => d.value === quiz.difficulty)?.label || quiz.difficulty}
                  </td>
                  <td className="px-6 py-4 text-center text-gray-600">{quiz.questions_count}</td>
                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={() => togglePublish(quiz)}
                      className={`px-3 py-1 rounded-full text-sm ${
                        quiz.is_published
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {quiz.is_published ? 'เผยแพร่' : 'ฉบับร่าง'}
                    </button>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => deleteQuiz(quiz.id)}
                      className="text-red-500 hover:text-red-700 ml-3"
                    >
                      🗑️
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create Quiz Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b sticky top-0 bg-white z-10">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold">สร้างควิซใหม่</h2>
                <button
                  onClick={() => {
                    setShowModal(false);
                    setParsedQuestions([]);
                    setUploadError(null);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Title */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ชื่อควิซ (ไทย) *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title_th}
                    onChange={(e) => setFormData({ ...formData, title_th: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                    placeholder="เช่น ควิซทดสอบความรู้เรื่องละหมาด"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ชื่อควิซ (English) *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title_en}
                    onChange={(e) => setFormData({ ...formData, title_en: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                    placeholder="e.g. Salah Knowledge Quiz"
                  />
                </div>
              </div>

              {/* Description */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    คำอธิบาย (ไทย)
                  </label>
                  <textarea
                    value={formData.description_th}
                    onChange={(e) => setFormData({ ...formData, description_th: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                    rows={2}
                    placeholder="คำอธิบายเกี่ยวกับควิซ"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description (English)
                  </label>
                  <textarea
                    value={formData.description_en}
                    onChange={(e) => setFormData({ ...formData, description_en: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                    rows={2}
                    placeholder="Quiz description"
                  />
                </div>
              </div>

              {/* Category & Difficulty */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">หมวดหมู่</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                  >
                    {categories.map((cat) => (
                      <option key={cat.value} value={cat.value}>{cat.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">ระดับความยาก</label>
                  <select
                    value={formData.difficulty}
                    onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                  >
                    {difficulties.map((diff) => (
                      <option key={diff.value} value={diff.value}>{diff.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* File Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  อัปโหลดไฟล์คำถาม (CSV) *
                </label>
                <div className="border-2 border-dashed rounded-lg p-6 text-center hover:border-primary transition-colors">
                  <input
                    type="file"
                    accept=".csv"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="file-upload"
                  />
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <span className="text-4xl block mb-2">📁</span>
                    <p className="text-gray-600">คลิกเพื่อเลือกไฟล์ CSV</p>
                    <p className="text-sm text-gray-400 mt-1">
                      คอลัมน์: ลำดับ, คำถาม, ตัวเลือก 1-4, คำตอบที่ถูก, เฉลยละเอียด
                    </p>
                  </label>
                </div>

                {uploadError && (
                  <p className="mt-2 text-red-500 text-sm">{uploadError}</p>
                )}

                {parsedQuestions.length > 0 && (
                  <div className="mt-4 p-4 bg-green-50 rounded-lg">
                    <p className="text-green-700 font-medium">
                      ✓ พบคำถาม {parsedQuestions.length} ข้อ
                    </p>
                    <div className="mt-2 max-h-40 overflow-y-auto text-sm text-gray-600">
                      {parsedQuestions.slice(0, 5).map((q, i) => (
                        <p key={i} className="truncate">
                          {q.order}. {q.question_th}
                        </p>
                      ))}
                      {parsedQuestions.length > 5 && (
                        <p className="text-gray-400">... และอีก {parsedQuestions.length - 5} ข้อ</p>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Publish checkbox */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is_published"
                  checked={formData.is_published}
                  onChange={(e) => setFormData({ ...formData, is_published: e.target.checked })}
                  className="w-4 h-4 text-primary rounded focus:ring-primary"
                />
                <label htmlFor="is_published" className="text-sm text-gray-700">
                  เผยแพร่ทันที
                </label>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setParsedQuestions([]);
                    setUploadError(null);
                  }}
                  className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={isUploading || parsedQuestions.length === 0}
                  className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isUploading ? 'กำลังสร้าง...' : 'สร้างควิซ'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CSV Template Info */}
      <div className="mt-8 bg-white rounded-xl p-6">
        <h3 className="font-bold text-gray-800 mb-4">📋 รูปแบบไฟล์ CSV</h3>
        <p className="text-gray-600 mb-4">ไฟล์ CSV ต้องมีคอลัมน์ดังนี้:</p>
        <div className="overflow-x-auto">
          <table className="text-sm border">
            <thead className="bg-gray-50">
              <tr>
                <th className="border px-3 py-2">ลำดับ</th>
                <th className="border px-3 py-2">คำถาม</th>
                <th className="border px-3 py-2">ตัวเลือก 1</th>
                <th className="border px-3 py-2">ตัวเลือก 2</th>
                <th className="border px-3 py-2">ตัวเลือก 3</th>
                <th className="border px-3 py-2">ตัวเลือก 4</th>
                <th className="border px-3 py-2">คำตอบที่ถูก</th>
                <th className="border px-3 py-2">เฉลยละเอียด</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border px-3 py-2 text-center">1</td>
                <td className="border px-3 py-2">ละหมาดฟัรดูมีกี่เวลา?</td>
                <td className="border px-3 py-2">3 เวลา</td>
                <td className="border px-3 py-2">5 เวลา</td>
                <td className="border px-3 py-2">7 เวลา</td>
                <td className="border px-3 py-2">4 เวลา</td>
                <td className="border px-3 py-2 text-center">2</td>
                <td className="border px-3 py-2">ละหมาดฟัรดูมี 5 เวลา คือ...</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
