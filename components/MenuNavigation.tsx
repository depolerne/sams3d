'use client'

import { ChevronLeft, ChevronRight } from 'lucide-react'
import { motion } from 'framer-motion'

interface MenuItem {
  id: string
  name: string
  description: string
  price: string
  modelPath: string
  texturePath?: string
  category: string
}

interface MenuNavigationProps {
  items: MenuItem[]
  currentIndex: number
  onPrevious: () => void
  onNext: () => void
  onItemSelect: (index: number) => void
}

export default function MenuNavigation({
  items,
  currentIndex,
  onPrevious,
  onNext,
  onItemSelect
}: MenuNavigationProps) {
  const currentItem = items[currentIndex]

  return (
    <div className="absolute bottom-0 left-0 right-0 p-6 z-10">
      {/* Информация о текущем блюде */}
      <motion.div
        key={currentItem.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
        className="glass rounded-2xl p-6 mb-4 backdrop-blur-md"
      >
        <div className="text-center">
          <h2 className="text-3xl font-bold neon-text mb-2">
            {currentItem.name}
          </h2>
          <p className="text-gray-300 mb-3 text-lg">
            {currentItem.description}
          </p>
          <div className="text-2xl font-bold text-neon-green">
            {currentItem.price}
          </div>
        </div>
      </motion.div>

      {/* Навигационные кнопки */}
      <div className="flex items-center justify-between">
        <button
          onClick={onPrevious}
          className="glass rounded-full p-4 hover:neon-glow transition-all duration-300 group"
          disabled={currentIndex === 0}
        >
          <ChevronLeft 
            className={`w-6 h-6 transition-colors ${
              currentIndex === 0 
                ? 'text-gray-600' 
                : 'text-neon-blue group-hover:text-white'
            }`} 
          />
        </button>

        {/* Индикаторы */}
        <div className="flex space-x-2">
          {items.map((_, index) => (
            <button
              key={index}
              onClick={() => onItemSelect(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === currentIndex
                  ? 'bg-neon-blue neon-glow scale-125'
                  : 'bg-gray-600 hover:bg-gray-400'
              }`}
            />
          ))}
        </div>

        <button
          onClick={onNext}
          className="glass rounded-full p-4 hover:neon-glow transition-all duration-300 group"
          disabled={currentIndex === items.length - 1}
        >
          <ChevronRight 
            className={`w-6 h-6 transition-colors ${
              currentIndex === items.length - 1
                ? 'text-gray-600' 
                : 'text-neon-blue group-hover:text-white'
            }`} 
          />
        </button>
      </div>

      {/* Свайп индикатор для мобильных */}
      <div className="mt-4 text-center">
        <p className="text-gray-500 text-sm">
          Свайпните или используйте стрелки для навигации
        </p>
      </div>
    </div>
  )
}