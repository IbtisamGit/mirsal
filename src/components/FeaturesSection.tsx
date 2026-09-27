import { motion } from 'framer-motion';
import { ShieldCheck, Moon, Heart, Palette, Sparkles } from 'lucide-react';

export default function FeaturesSection() {
  return (
    <section id="features" dir="rtl" className="py-24 bg-[#050810] relative z-10 overflow-hidden text-white">
      {/* خلفية جمالية للقسم */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[20%] right-0 w-[30%] h-[30%] bg-blue-600/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[10%] left-[10%] w-[20%] h-[20%] bg-pink-600/10 rounded-full blur-[100px]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <motion.div 
            whileHover={{ scale: 1.05 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-blue-300 text-sm font-bold mb-6 cursor-default transition-colors hover:bg-white/15"
          >
            <Sparkles size={16} className="text-blue-400 animate-pulse" />
            تجربة لا مثيل لها
          </motion.div>
          <h2 className="text-3xl md:text-5xl font-black text-white mb-6 tracking-tight">
            لماذا مرسال هو الخيار الأفضل لعائلتك؟
          </h2>
          <p className="text-lg text-slate-400 font-medium leading-relaxed">
            تخلينا عن التصاميم التقليدية لبناء تجربة تجمع بين أقصى درجات الأمان لراحة بالك، وأقصى درجات المرح لأطفالك.
          </p>
        </motion.div>
        
        {/* Bento Grid Layout - Dark Premium Theme */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[minmax(250px,auto)]">
          
          {/* Card 1: Security (Spans 2 columns) - Blue Glow */}
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            whileHover={{ y: -10 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="md:col-span-2 bg-[#0a0f1c] rounded-[2rem] p-8 md:p-10 shadow-2xl border border-white/10 relative overflow-hidden group flex flex-col justify-center hover:shadow-[0_20px_40px_-15px_rgba(59,130,246,0.3)] hover:border-blue-500/30 transition-all duration-300"
          >
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-blue-600 to-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -z-10 group-hover:bg-blue-500/20 group-hover:scale-125 transition-all duration-700 ease-out" />
            
            <div className="flex flex-col md:flex-row items-start md:items-center gap-8 z-10">
              <div className="flex-shrink-0 w-20 h-20 bg-blue-500/10 border border-blue-500/30 text-blue-400 rounded-3xl flex items-center justify-center shadow-[0_0_30px_rgba(59,130,246,0.2)] rotate-3 group-hover:-rotate-3 group-hover:scale-110 transition-all duration-500 ease-out">
                <ShieldCheck size={40} />
              </div>
              <div>
                <h3 className="text-2xl font-black text-white mb-3">حماية تامة (Zero Guessing)</h3>
                <p className="text-slate-400 text-lg leading-relaxed font-medium">
                  دخول آمن ومحكم عبر <span className="text-blue-400 font-bold group-hover:text-blue-300 transition-colors">رمز الغرفة</span>، و <span className="text-blue-400 font-bold group-hover:text-blue-300 transition-colors">الاسم الدقيق</span>، و <span className="text-blue-400 font-bold group-hover:text-blue-300 transition-colors">رمز PIN السري</span> لكل طفل. بيئة مغلقة تماماً لا يوجد فيها أي مجال لدخول الغرباء.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Card 2: Quiet Hours (Dark Mode Card) - Purple Glow */}
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1, duration: 0.4, ease: "easeOut" }}
            whileHover={{ y: -10 }}
            className="bg-[#0a0f1c] rounded-[2rem] p-8 shadow-2xl border border-white/10 relative overflow-hidden group flex flex-col justify-between hover:shadow-[0_20px_40px_-15px_rgba(168,85,247,0.3)] hover:border-purple-500/30 transition-all duration-300"
          >
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-purple-600 to-indigo-400 opacity-50 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl group-hover:bg-purple-500/20 group-hover:scale-150 transition-all duration-700 ease-out" />
            
            <div className="w-16 h-16 bg-purple-500/10 border border-purple-500/30 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-purple-500/20 transition-all duration-500 z-10 shadow-[0_0_30px_rgba(168,85,247,0.1)]">
              <Moon size={32} className="text-purple-400 group-hover:text-purple-300" />
            </div>
            <div className="relative z-10">
              <h3 className="text-xl font-bold mb-3 text-white">أوقات الهدوء والنوم</h3>
              <p className="text-slate-400 font-medium leading-relaxed group-hover:text-slate-300 transition-colors">
                إمكانية تحديد أوقات لإغلاق الدردشة تلقائياً لضمان عدم تشتيت انتباه الأطفال وقت النوم أو المدرسة.
              </p>
            </div>
          </motion.div>

          {/* Card 3: Ping Button - Pink Glow */}
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.4, ease: "easeOut" }}
            whileHover={{ y: -10 }}
            className="bg-[#0a0f1c] rounded-[2rem] p-8 border border-white/10 shadow-2xl relative overflow-hidden group flex flex-col justify-between hover:shadow-[0_20px_40px_-15px_rgba(236,72,153,0.3)] hover:border-pink-500/30 transition-all duration-300"
          >
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-pink-600 to-rose-400 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-pink-500/10 rounded-full blur-3xl -z-10 group-hover:bg-pink-500/20 transition-all duration-700" />

            <div className="w-16 h-16 bg-pink-500/10 border border-pink-500/30 text-pink-400 rounded-2xl flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(236,72,153,0.15)] group-hover:scale-110 group-hover:bg-pink-500/20 transition-all duration-300 z-10">
              <Heart size={32} fill="currentColor" className="group-hover:scale-110 transition-transform" />
            </div>
            <div className="relative z-10">
              <h3 className="text-xl font-bold text-white mb-3">زر الاطمئنان السريع</h3>
              <p className="text-slate-400 font-medium leading-relaxed group-hover:text-slate-300 transition-colors">
                بضغطة زر واحدة يمكن للطفل إرسال إشعار فوري لطمأنة العائلة دون الحاجة لكتابة رسالة.
              </p>
            </div>
          </motion.div>

          {/* Card 4: Drawing (Spans 2 columns) - Orange/Amber Glow */}
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3, duration: 0.4, ease: "easeOut" }}
            whileHover={{ y: -10 }}
            className="md:col-span-2 bg-[#0a0f1c] rounded-[2rem] p-8 md:p-10 border border-white/10 shadow-2xl relative overflow-hidden group flex flex-col justify-center hover:shadow-[0_20px_40px_-15px_rgba(249,115,22,0.3)] hover:border-orange-500/30 transition-all duration-300"
          >
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-orange-600 to-amber-400 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-orange-500/10 rounded-full blur-3xl -z-10 group-hover:scale-[1.5] group-hover:bg-orange-500/20 transition-all duration-700 ease-out" />
            <div className="absolute top-10 right-10 w-24 h-24 bg-amber-500/10 rounded-full blur-2xl group-hover:scale-150 transition-all duration-500" />
            
            <div className="flex flex-col md:flex-row-reverse items-start md:items-center gap-8 relative z-10">
              <div className="flex-shrink-0 w-20 h-20 bg-orange-500/10 border border-orange-500/30 text-orange-400 rounded-3xl flex items-center justify-center shadow-[0_0_30px_rgba(249,115,22,0.2)] -rotate-3 group-hover:rotate-12 group-hover:scale-110 group-hover:bg-orange-500/20 transition-all duration-500 ease-out">
                <Palette size={40} className="group-hover:animate-spin-slow" />
              </div>
              <div className="text-right">
                <h3 className="text-2xl font-black text-white mb-3">لوحة الرسم التفاعلية</h3>
                <p className="text-slate-400 text-lg leading-relaxed font-medium group-hover:text-slate-300 transition-colors">
                  تجربة ممتعة للأطفال تتيح لهم التعبير عن أنفسهم برسم وإرسال اللوحات الفنية للعائلة مباشرة من داخل المحادثة، لكسر حاجز الملل وتشجيع الإبداع.
                </p>
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}