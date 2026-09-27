import { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, ShieldCheck, ArrowLeft } from 'lucide-react';
import InteractiveStars from './InteractiveStars';
import KidsEntryModal from './KidsEntryModal';
import { Link } from 'react-router-dom';

export default function Hero() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="relative min-h-[calc(100vh-4rem)] flex items-center justify-center overflow-hidden">
      {/* Interactive Background */}
      <InteractiveStars />

      {/* Background Decor */}
      <div className="absolute top-1/4 -right-20 w-72 h-72 bg-blue-400 rounded-full mix-blend-multiply filter blur-[100px] opacity-40 animate-blob" />
      <div className="absolute top-1/3 -left-20 w-72 h-72 bg-purple-400 rounded-full mix-blend-multiply filter blur-[100px] opacity-40 animate-blob animation-delay-2000" />
      <div className="absolute -bottom-8 left-1/3 w-72 h-72 bg-pink-400 rounded-full mix-blend-multiply filter blur-[100px] opacity-40 animate-blob animation-delay-4000" />

      {/* Content */}
      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="space-y-8"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/60 backdrop-blur-md border border-gray-100 shadow-sm text-sm font-medium text-gray-700">
            <ShieldCheck size={18} className="text-green-500" />
            تواصل عائلي آمن ومحمي 100%
          </div>

          <h1 className="text-5xl md:text-7xl font-black text-slate-900 tracking-tight leading-tight">
            المكان الأفضل لتواصل <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-500 to-pink-500">
              أطفالك وعائلتك
            </span>
          </h1>

          <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            تطبيق مراسلة مصمم خصيصاً ليمنح الأطفال بيئة آمنة للتواصل مع أفراد العائلة بدون الحاجة لرقم هاتف أو بريد إلكتروني.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
            {/* Primary Action (Kids) */}
            <button
              onClick={() => setIsModalOpen(true)}
              className="group relative inline-flex items-center justify-center gap-3 w-full sm:w-auto px-8 py-5 text-xl font-bold text-white transition-all duration-300 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-[2rem] hover:from-blue-600 hover:to-indigo-600 hover:scale-105 shadow-[0_0_40px_rgba(59,130,246,0.4)]"
            >
              <Sparkles className="group-hover:animate-spin" />
              <span>أدخل رمز الغرفة</span>
              <div className="absolute inset-0 rounded-[2rem] border-2 border-white/20" />
            </button>

            {/* Secondary Action (Adults) */}
            <Link
              to="/auth?mode=signup"
              className="group inline-flex items-center justify-center gap-2 w-full sm:w-auto px-8 py-5 text-lg font-bold text-gray-700 transition-all duration-300 bg-white rounded-[2rem] hover:bg-gray-50 border-2 border-gray-200 hover:border-gray-300 hover:shadow-sm"
            >
              <span>إنشاء غرفة جديدة</span>
              <ArrowLeft size={20} className="text-gray-400 group-hover:-translate-x-1 transition-transform" />
            </Link>
          </div>
        </motion.div>
      </div>

      <KidsEntryModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}
