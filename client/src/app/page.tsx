import About from "@/components/reusableComponents/about";
import ExoplanetSection from "@/components/reusableComponents/exoplanetSection";
import Faqs from "@/components/reusableComponents/faqs";
import Features from "@/components/reusableComponents/features";
import { Hero } from "@/components/reusableComponents/hero";
import { HeroVideo } from "@/components/reusableComponents/heroVideo";
import ExoplanetProblem from "@/components/reusableComponents/exoplanetProblem";
import { ScrollProgress } from "@/components/ui/scroll-progress";
import Footer from "@/components/reusableComponents/footer";
import { Working } from "@/components/reusableComponents/working";
import { ScrollGlobe, Meteors } from "@/components/reusableComponents/homeVisuals";

export default function Home() {
  return (
    // overflow-x-clip stops the decorative, absolutely positioned visuals
    // from creating a horizontal scrollbar on narrow screens.
    <div className="relative overflow-x-clip">
      <ScrollGlobe />
      <ScrollProgress className="top-16 z-50" />
      <div className="pointer-events-none absolute h-[1000px] w-full overflow-hidden">
        <Meteors number={20} minDelay={3} />
      </div>
      <Hero />
      <HeroVideo />
      <Features />
      <ExoplanetSection />
      <ExoplanetProblem />
      <Working />
      <Faqs />
      <About />
      <Footer />
    </div>
  );
}
