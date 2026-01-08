'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { use } from 'react';

interface Question {
  id: string;
  order_number: number;
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
  correct_answer?: number;
  explanation_th?: string;
  explanation_en?: string;
}

interface Quiz {
  id: string;
  title_th: string;
  title_en: string;
  description_th?: string;
  description_en?: string;
  questions_count: number;
  questions: Question[];
}

interface QuizResult {
  score: number;
  total: number;
  percentage: number;
  questions: Question[];
  attempt: {
    answers: Array<{
      question_id: string;
      selected_answer: number;
      is_correct: boolean;
    }>;
  };
}

export default function QuizTakingPage({ params }: { params: Promise<{ locale: string; id: string }> }) {
  const { locale, id } = use(params);
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<QuizResult | null>(null);
  const [showExplanation, setShowExplanation] = useState<string | null>(null);

  const t = {
    th: {
      loading: 'กำลังโหลด...',
      notFound: 'ไม่พบควิซ',
      question: 'คำถาม',
      of: 'จาก',
      previous: 'ก่อนหน้า',
      next: 'ถัดไป',
      submit: 'ส่งคำตอบ',
      submitting: 'กำลังส่ง...',
      result: 'ผลลัพธ์',
      score: 'คะแนน',
      correct: 'ถูกต้อง',
      wrong: 'ผิด',
      yourAnswer: 'คำตอบของคุณ',
      correctAnswer: 'คำตอบที่ถูก',
      explanation: 'คำอธิบาย',
      tryAgain: 'ทำอีกครั้ง',
      backToQuizzes: 'กลับไปหน้าควิซ',
      excellent: 'ยอดเยี่ยม!',
      good: 'ดีมาก!',
      average: 'พอใช้',
      needImprovement: 'ต้องปรับปรุง',
      selectAnswer: 'กรุณาเลือกคำตอบ',
    },
    en: {
      loading: 'Loading...',
      notFound: 'Quiz not found',
      question: 'Question',
      of: 'of',
      previous: 'Previous',
      next: 'Next',
      submit: 'Submit',
      submitting: 'Submitting...',
      result: 'Result',
      score: 'Score',
      correct: 'Correct',
      wrong: 'Wrong',
      yourAnswer: 'Your answer',
      correctAnswer: 'Correct answer',
      explanation: 'Explanation',
      tryAgain: 'Try Again',
      backToQuizzes: 'Back to Quizzes',
      excellent: 'Excellent!',
      good: 'Good Job!',
      average: 'Average',
      needImprovement: 'Needs Improvement',
      selectAnswer: 'Please select an answer',
    },
  };

  const text = t[locale as keyof typeof t] || t.en;

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const res = await fetch(`/api/quiz/${id}`);
        if (!res.ok) throw new Error('Quiz not found');
        const data = await res.json();
        setQuiz(data);
      } catch (error) {
        console.error('Error fetching quiz:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchQuiz();
  }, [id]);

  const handleAnswer = (questionId: string, answer: number) => {
    setAnswers((prev) => ({ ...prev, [questionId]: answer }));
  };

  const handleSubmit = useCallback(async () => {
    if (!quiz) return;

    // Check if all questions are answered
    const unanswered = quiz.questions.filter((q) => !answers[q.id]);
    if (unanswered.length > 0) {
      alert(text.selectAnswer);
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch(`/api/quiz/${id}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          answers,
          session_id: `session_${Date.now()}`,
        }),
      });

      const data = await res.json();
      setResult(data);
    } catch (error) {
      console.error('Error submitting quiz:', error);
    } finally {
      setIsSubmitting(false);
    }
  }, [quiz, answers, id, text.selectAnswer]);

  const getResultMessage = (percentage: number) => {
    if (percentage >= 90) return text.excellent;
    if (percentage >= 70) return text.good;
    if (percentage >= 50) return text.average;
    return text.needImprovement;
  };

  const getResultColor = (percentage: number) => {
    if (percentage >= 90) return 'text-green-600';
    if (percentage >= 70) return 'text-blue-600';
    if (percentage >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  const resetQuiz = () => {
    setCurrentQuestion(0);
    setAnswers({});
    setResult(null);
    setShowExplanation(null);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500">{text.loading}</p>
        </div>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="text-center">
          <span className="text-6xl mb-4 block">😢</span>
          <p className="text-gray-500 text-lg">{text.notFound}</p>
          <Link href={`/${locale}/quiz`} className="text-primary mt-4 inline-block">
            {text.backToQuizzes}
          </Link>
        </div>
      </div>
    );
  }

  // Show result page
  if (result) {
    return (
      <div className="min-h-screen bg-cream py-12">
        <div className="max-w-3xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-lg overflow-hidden"
          >
            {/* Result Header */}
            <div className="bg-gradient-to-r from-primary to-primary-dark p-8 text-white text-center">
              <h1 className="text-2xl font-bold mb-2">{text.result}</h1>
              <div className={`text-6xl font-bold my-4 ${getResultColor(result.percentage)}`}>
                <span className="bg-white/20 rounded-full px-8 py-4 inline-block">
                  {result.percentage}%
                </span>
              </div>
              <p className="text-xl">{getResultMessage(result.percentage)}</p>
              <p className="mt-2 text-white/80">
                {text.score}: {result.score} / {result.total}
              </p>
            </div>

            {/* Questions Review */}
            <div className="p-6">
              <h2 className="font-bold text-lg mb-4 text-gray-800">
                {locale === 'th' ? 'ตรวจสอบคำตอบ' : 'Review Answers'}
              </h2>

              <div className="space-y-4">
                {result.questions.map((question, index) => {
                  const userAnswerRecord = result.attempt.answers.find(
                    (a) => a.question_id === question.id
                  );
                  const userAnswer = userAnswerRecord?.selected_answer;
                  const isCorrect = userAnswerRecord?.is_correct;

                  return (
                    <div
                      key={question.id}
                      className={`p-4 rounded-xl border-2 ${
                        isCorrect ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <span
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                            isCorrect ? 'bg-green-500' : 'bg-red-500'
                          }`}
                        >
                          {isCorrect ? '✓' : '✗'}
                        </span>
                        <div className="flex-1">
                          <p className="font-medium text-gray-800 mb-2">
                            {index + 1}. {locale === 'th' ? question.question_th : question.question_en}
                          </p>

                          <div className="text-sm space-y-1">
                            <p className={isCorrect ? 'text-green-700' : 'text-red-700'}>
                              {text.yourAnswer}:{' '}
                              {userAnswer
                                ? locale === 'th'
                                  ? question[`option_${userAnswer}_th` as keyof Question]
                                  : question[`option_${userAnswer}_en` as keyof Question]
                                : '-'}
                            </p>
                            {!isCorrect && (
                              <p className="text-green-700">
                                {text.correctAnswer}:{' '}
                                {locale === 'th'
                                  ? question[`option_${question.correct_answer}_th` as keyof Question]
                                  : question[`option_${question.correct_answer}_en` as keyof Question]}
                              </p>
                            )}
                          </div>

                          {/* Explanation Toggle */}
                          {(question.explanation_th || question.explanation_en) && (
                            <button
                              onClick={() =>
                                setShowExplanation(
                                  showExplanation === question.id ? null : question.id
                                )
                              }
                              className="text-primary text-sm mt-2 hover:underline"
                            >
                              {showExplanation === question.id
                                ? locale === 'th'
                                  ? 'ซ่อนคำอธิบาย'
                                  : 'Hide explanation'
                                : text.explanation}
                            </button>
                          )}

                          <AnimatePresence>
                            {showExplanation === question.id && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="mt-2 p-3 bg-white rounded-lg text-sm text-gray-600"
                              >
                                {locale === 'th' ? question.explanation_th : question.explanation_en}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Actions */}
              <div className="flex gap-4 mt-8">
                <button
                  onClick={resetQuiz}
                  className="flex-1 py-3 bg-primary text-white rounded-xl font-medium hover:bg-primary-dark transition-colors"
                >
                  {text.tryAgain}
                </button>
                <Link
                  href={`/${locale}/quiz`}
                  className="flex-1 py-3 border-2 border-primary text-primary rounded-xl font-medium hover:bg-primary/5 transition-colors text-center"
                >
                  {text.backToQuizzes}
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  const question = quiz.questions[currentQuestion];
  const progress = ((currentQuestion + 1) / quiz.questions.length) * 100;

  return (
    <div className="min-h-screen bg-cream py-8">
      <div className="max-w-3xl mx-auto px-4">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-xl font-bold text-primary mb-2">
            {locale === 'th' ? quiz.title_th : quiz.title_en}
          </h1>
          <div className="flex items-center justify-between text-sm text-gray-500 mb-2">
            <span>
              {text.question} {currentQuestion + 1} {text.of} {quiz.questions.length}
            </span>
            <span>{Math.round(progress)}%</span>
          </div>
          {/* Progress Bar */}
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-primary"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>

        {/* Question Card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={question.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="bg-white rounded-2xl shadow-lg p-6 md:p-8"
          >
            <p className="text-lg md:text-xl font-medium text-gray-800 mb-6">
              {locale === 'th' ? question.question_th : question.question_en}
            </p>

            {/* Options */}
            <div className="space-y-3">
              {[1, 2, 3, 4].map((num) => {
                const optionText =
                  locale === 'th'
                    ? question[`option_${num}_th` as keyof Question]
                    : question[`option_${num}_en` as keyof Question];
                const isSelected = answers[question.id] === num;

                return (
                  <button
                    key={num}
                    onClick={() => handleAnswer(question.id, num)}
                    className={`w-full p-4 rounded-xl text-left transition-all border-2 ${
                      isSelected
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-gray-200 hover:border-primary/50 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`w-8 h-8 rounded-full flex items-center justify-center font-medium text-sm ${
                          isSelected
                            ? 'bg-primary text-white'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {num}
                      </span>
                      <span className="flex-1">{optionText}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex gap-4 mt-6">
          <button
            onClick={() => setCurrentQuestion((prev) => prev - 1)}
            disabled={currentQuestion === 0}
            className="flex-1 py-3 border-2 border-gray-200 rounded-xl font-medium text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {text.previous}
          </button>

          {currentQuestion === quiz.questions.length - 1 ? (
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex-1 py-3 bg-gold text-dark rounded-xl font-medium hover:bg-gold-dark transition-colors disabled:opacity-50"
            >
              {isSubmitting ? text.submitting : text.submit}
            </button>
          ) : (
            <button
              onClick={() => setCurrentQuestion((prev) => prev + 1)}
              className="flex-1 py-3 bg-primary text-white rounded-xl font-medium hover:bg-primary-dark transition-colors"
            >
              {text.next}
            </button>
          )}
        </div>

        {/* Question Navigator */}
        <div className="mt-8 flex flex-wrap justify-center gap-2">
          {quiz.questions.map((q, index) => {
            const isAnswered = !!answers[q.id];
            const isCurrent = index === currentQuestion;

            return (
              <button
                key={q.id}
                onClick={() => setCurrentQuestion(index)}
                className={`w-10 h-10 rounded-lg font-medium text-sm transition-all ${
                  isCurrent
                    ? 'bg-primary text-white'
                    : isAnswered
                    ? 'bg-green-100 text-green-700 border-2 border-green-300'
                    : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                }`}
              >
                {index + 1}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
