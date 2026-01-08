'use client';

import { motion } from 'framer-motion';
import type { QuestionCategory } from '@/lib/qna-types';

interface CategoryFilterProps {
  categories: QuestionCategory[];
  selectedCategory: string | null;
  onSelect: (slug: string | null) => void;
  locale: string;
  allLabel: string;
}

export default function CategoryFilter({
  categories,
  selectedCategory,
  onSelect,
  locale,
  allLabel,
}: CategoryFilterProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {/* All */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => onSelect(null)}
        className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
          selectedCategory === null
            ? 'bg-primary text-white'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        }`}
      >
        {allLabel}
      </motion.button>

      {/* Categories */}
      {categories.map((category) => (
        <motion.button
          key={category.id}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onSelect(category.slug)}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            selectedCategory === category.slug
              ? 'bg-primary text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          {category.icon} {locale === 'th' ? category.name_th : category.name_en}
        </motion.button>
      ))}
    </div>
  );
}
