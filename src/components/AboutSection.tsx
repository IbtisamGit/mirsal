import { motion, Variants } from 'framer-motion';
import { Settings, UserPlus, MessageCircleHeart } from 'lucide-react';

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2
    }
  }
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { type: 'spring', stiffness: 80, damping: 15 }
  }
};

export default function AboutSection() {
  return (
    <section id="about" dir="rtl" className="py-24 bg-[#0a0f1c] text-white relative z-10 overflow-hidden">
      {/* خلفية جمالية (إضاءات خافتة) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-1/4 w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-1/4 w-[40%] h-[40%] bg-purple-600/10 rounded-full blur-[120px]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-20">
        
        {/* الجزء العلوي: النصوص التعريفية (في المنتصف) */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="max-w-3xl mx-auto text-center mb-20"
        >
          <h2 className="text-3xl md:text-5xl font-black mb-6 tracking-tight">
            رؤيتنا في <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">مرسال</span>
          </h2>
          <p className="text-lg text-slate-300 mb-4 leading-relaxed">
            بدأت فكرة مرسال من حاجة حقيقية: كيف يمكننا توفير بيئة مراسلة آمنة لأطفالنا الذين لا يمتلكون أرقام هواتف، دون تعريضهم لمخاطر الإنترنت أو تطبيقات المراسلة المفتوحة؟
          </p>
          <p className="text-lg text-slate-300 leading-relaxed">
            لذلك قمنا ببناء مرسال كقلعة رقمية عائلية. أنظمة الدخول المتعددة، أوقات الهدوء، وإدارة الصلاحيات تعني أن الآباء يمكنهم الاسترخاء بينما يستمتع أطفالهم بتجربة تواصل تفاعلية وآمنة تماماً.
          </p>
        </motion.div>

        {/* الجزء السفلي: الشبكة الأفقية للخطوات الثلاث */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto"
        >
          {/* البطاقة الأولى */}
          <motion.div 
            variants={cardVariants}
            whileHover={{ y: -10 }}
            className="relative bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-3xl text-center group transition-all duration-300 hover:shadow-[0_20px_40px_-15px_rgba(59,130,246,0.2)] hover:bg-white/10"
          >
            {/* خط الإضاءة العلوي */}
            <div className="absolute top-0 inset-x-0 h-1 rounded-t-3xl bg-gradient-to-r from-blue-600 to-blue-400 opacity-50 group-hover:opacity-100 transition-opacity" />
            
            <div className="mx-auto w-16 h-16 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-full flex items-center justify-center mb-6 shadow-inner group-hover:scale-110 transition-transform duration-300">
              <Settings size={28} />
            </div>
            <span className="text-blue-400 font-bold text-sm mb-3 block tracking-wider">الخطوة الأولى</span>
            <p className="text-xl font-bold text-white leading-snug">الآباء ينشئون الغرفة من لوحة التحكم</p>
          </motion.div>

          {/* البطاقة الثانية */}
          <motion.div 
            variants={cardVariants}
            whileHover={{ y: -10 }}
            className="relative bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-3xl text-center group transition-all duration-300 hover:shadow-[0_20px_40px_-15px_rgba(168,85,247,0.2)] hover:bg-white/10"
          >
            <div className="absolute top-0 inset-x-0 h-1 rounded-t-3xl bg-gradient-to-r from-purple-600 to-purple-400 opacity-50 group-hover:opacity-100 transition-opacity" />
            
            <div className="mx-auto w-16 h-16 bg-purple-500/10 border border-purple-500/20 text-purple-400 rounded-full flex items-center justify-center mb-6 shadow-inner group-hover:scale-110 transition-transform duration-300">
              <UserPlus size={28} />
            </div>
            <span className="text-purple-400 font-bold text-sm mb-3 block tracking-wider">الخطوة الثانية</span>
            <p className="text-xl font-bold text-white leading-snug">يتم إضافة حسابات للأطفال وتحديد الرمز السري</p>
          </motion.div>

          {/* البطاقة الثالثة */}
          <motion.div 
            variants={cardVariants}
            whileHover={{ y: -10 }}
            className="relative bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-3xl text-center group transition-all duration-300 hover:shadow-[0_20px_40px_-15px_rgba(236,72,153,0.2)] hover:bg-white/10"
          >
            <div className="absolute top-0 inset-x-0 h-1 rounded-t-3xl bg-gradient-to-r from-pink-600 to-pink-400 opacity-50 group-hover:opacity-100 transition-opacity" />
            
            <div className="mx-auto w-16 h-16 bg-pink-500/10 border border-pink-500/20 text-pink-400 rounded-full flex items-center justify-center mb-6 shadow-inner group-hover:scale-110 transition-transform duration-300">
              <MessageCircleHeart size={28} />
            </div>
            <span className="text-pink-400 font-bold text-sm mb-3 block tracking-wider">الخطوة الثالثة</span>
            <p className="text-xl font-bold text-white leading-snug">يبدأ التواصل العائلي الآمن فوراً!</p>
          </motion.div>

        </motion.div>
      </div>
    </section>
  );
}