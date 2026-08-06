import React from 'react';
import { Instagram, ArrowUpRight, Sparkles, Heart, Quote } from 'lucide-react';
import { motion } from 'motion/react';

interface AboutSectionProps {
  curatorNote?: string;
  instagramHandle?: string;
}

export const AboutSection: React.FC<AboutSectionProps> = ({
  curatorNote = 'Music is the language of quiet moments. Here are the tracks that accompany my thoughts, coffee, and late night drives.',
  instagramHandle = 'pranayo6',
}) => {
  return (
    <section id="about" className="py-20 sm:py-32 bg-[#F7F7F5] border-t border-[#ECECEC] relative overflow-hidden">
      
      {/* Background Dotted Matrix */}
      <div className="absolute top-1/2 left-8 w-48 h-48 dotted-pattern opacity-25 pointer-events-none rounded-full transform -translate-y-1/2" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* Left Column: Aesthetic Editorial Portrait */}
          <div className="lg:col-span-5 relative">
            <div className="relative aspect-[4/5] rounded-[32px] overflow-hidden bg-white p-3 shadow-float border border-[#ECECEC] group cursor-pointer">
              <motion.img
                src="/assets/mypic.png"
                alt="Slow life mood"
                referrerPolicy="no-referrer"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.9, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
                className="w-full h-full object-cover rounded-[24px] filter grayscale contrast-110 group-hover:scale-[1.02] transition-transform duration-700 ease-out"
              />

              {/* Premium Gradient Shine / Reflection Overlay */}
              <div className="absolute inset-3 rounded-[24px] overflow-hidden pointer-events-none z-10">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-20 translate-x-[-150%] group-hover:translate-x-[150%] transition-transform duration-1000 ease-out" />
                <div className="absolute inset-0 bg-gradient-to-tr from-white/10 via-transparent to-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
              </div>

              <div className="absolute bottom-6 left-6 right-6 bg-white/90 backdrop-blur-md p-4 rounded-2xl border border-white/40 shadow-sm">
                <p className="font-heading text-xs font-bold text-[#111111] uppercase tracking-wider">
                  SLOW LIFE PHILOSOPHY
                </p>
                <p className="text-xs text-[#7A7A7A] mt-0.5">
                  Hand-curated melodies designed for patience & feeling.
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Narrative Content */}
          <div className="lg:col-span-7 space-y-8">
            
            <div className="space-y-3">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white border border-[#ECECEC] text-xs font-semibold uppercase tracking-widest text-[#DCC6A0] font-heading">
                <Sparkles size={14} className="fill-[#DCC6A0]" />
                <span>About This Collection</span>
              </div>

              <h2 className="font-heading text-3xl sm:text-5xl font-extrabold text-[#111111] leading-tight">
                Why SLOW LIFE exists.
              </h2>
            </div>

            {/* Quote Block */}
            <div className="relative pl-6 border-l-2 border-[#DCC6A0] space-y-2">
              <Quote size={28} className="text-[#DCC6A0] opacity-50 absolute -top-3 -left-3 -z-10" />
              <p className="text-lg sm:text-xl font-heading text-[#111111] font-medium leading-relaxed italic">
                "In a world dominated by 15-second algorithms and constant noise, these songs demand you slow down, breathe, and truly listen."
              </p>
            </div>

            <p className="text-sm sm:text-base text-[#7A7A7A] leading-relaxed">
              {curatorNote}
            </p>

            <p className="text-sm sm:text-base text-[#7A7A7A] leading-relaxed">
              Every track listed here is a personal artifact. From golden-age ghazals that calm the mind to haunting acoustic Bollywood ballads that remind us of forgotten afternoons. Thank you for taking a moment to step into this music diary.
            </p>

            {/* Instagram Callout */}
            <div className="pt-4 flex items-center space-x-4">
              <a
                href={`https://instagram.com/${instagramHandle}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-3 px-8 py-4 rounded-full bg-[#111111] text-white font-medium text-sm hover:bg-black transition-all shadow-md"
              >
                <Instagram size={18} />
                <span>Follow on Instagram (@{instagramHandle})</span>
                <ArrowUpRight size={16} />
              </a>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
};
