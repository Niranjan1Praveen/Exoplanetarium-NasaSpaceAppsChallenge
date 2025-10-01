import About from "@/components/reusableComponents/about";
import ExoplanetSection from "@/components/reusableComponents/exoplanetSection";
import Faqs from "@/components/reusableComponents/faqs";
import Features from "@/components/reusableComponents/features";
import { Hero } from "@/components/reusableComponents/hero";
import { HeroVideo } from "@/components/reusableComponents/heroVideo";
import { Testimonial } from "@/components/reusableComponents/testimonial";
import { Meteors } from "@/components/ui/meteors";
import ExoplanetProblem from "@/components/reusableComponents/exoplanetProblem";
import { ScrollProgress } from "@/components/ui/scroll-progress";
import Navbar from "@/components/reusableComponents/navbar";
import Footer from "@/components/reusableComponents/footer";

export default function Home() {
  return (
    <div className="relative">
      <Navbar/>
      <ScrollProgress className="lg:top-[68px] md:top-[68px] top-[56px] z-100" />
      <div className="absolute overflow-hidden h-[1000px] w-full">
        <Meteors number={20} minDelay={3} />
      </div>
      <Hero />
      <HeroVideo />
      <Features />
      <ExoplanetSection />
      <ExoplanetProblem />
      <Testimonial />
      <Faqs />
      <About />
      <Footer/>
    </div>
  );
}
