import { Brain, TrendingUp, Target } from "lucide-react";
import heroBg from "@/assets/hero-bg.jpg";

export const HeroSection = () => {
  return (
    <section className="relative overflow-hidden">
      <div 
        className="absolute inset-0 opacity-20"
        style={{ 
          backgroundImage: `url(${heroBg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      />
      <div 
        className="absolute inset-0 opacity-60"
        style={{ background: 'var(--gradient-hero)' }}
      />
      <div className="container relative mx-auto px-4 py-12 sm:py-24">
        <div className="max-w-4xl mx-auto text-center space-y-4 sm:space-y-6">
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent animate-in fade-in slide-in-from-bottom-4 duration-1000">
            Founder Lessons Database
          </h1>
          <p className="text-base sm:text-xl text-muted-foreground max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-5 duration-1000 delay-150">
            Extract tactical insights from top founder podcasts. Learn from their crucible moments before making the same mistakes.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 pt-4 sm:pt-8 animate-in fade-in slide-in-from-bottom-6 duration-1000 delay-300">
            <FeatureCard 
              icon={<Brain className="w-6 h-6 sm:w-8 sm:h-8" />}
              title="AI-Powered Analysis"
              description="Automatically extract lessons from podcast episodes"
            />
            <FeatureCard 
              icon={<TrendingUp className="w-6 h-6 sm:w-8 sm:h-8" />}
              title="Actionable Insights"
              description="Ranked by impact and actionability"
            />
            <FeatureCard 
              icon={<Target className="w-6 h-6 sm:w-8 sm:h-8" />}
              title="Tailored to You"
              description="Relevant callouts for your startup"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

const FeatureCard = ({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) => {
  return (
    <div className="group p-4 sm:p-6 rounded-xl bg-card border border-border hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
      <div className="text-primary mb-3 sm:mb-4 group-hover:scale-110 transition-transform duration-300">
        {icon}
      </div>
      <h3 className="font-semibold text-base sm:text-lg mb-1 sm:mb-2">{title}</h3>
      <p className="text-xs sm:text-sm text-muted-foreground">{description}</p>
    </div>
  );
};
