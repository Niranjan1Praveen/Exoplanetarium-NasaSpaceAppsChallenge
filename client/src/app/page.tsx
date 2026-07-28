import About from "@/components/reusableComponents/about";
import ExoplanetSection from "@/components/reusableComponents/exoplanetSection";
import Faqs from "@/components/reusableComponents/faqs";
import Features from "@/components/reusableComponents/features";
import { Hero } from "@/components/reusableComponents/hero";
import { HeroVideo } from "@/components/reusableComponents/heroVideo";
import { Testimonial } from "@/components/reusableComponents/testimonial";
import ExoplanetProblem from "@/components/reusableComponents/exoplanetProblem";
import { ScrollProgress } from "@/components/ui/scroll-progress";
import Navbar from "@/components/reusableComponents/navbar";
import Footer from "@/components/reusableComponents/footer";
import { Working } from "@/components/reusableComponents/working";
import { ScrollGlobe, Meteors } from "@/components/reusableComponents/homeVisuals";

export default function Home() {
  return (
    <div className="relative">
      <ScrollGlobe/>
      <Navbar/>
      <ScrollProgress className="lg:top-[81px] md:top-[81px] top-[81px] z-100" />
      <div className="absolute overflow-hidden h-[1000px] w-full">
        <Meteors number={20} minDelay={3} />
      </div>
      <Hero />
      <HeroVideo />
      <Features />
      <ExoplanetSection />
      <ExoplanetProblem />
      <Working/>
      <Testimonial />
      <Faqs />
      <About />
      <Footer/>
    </div>
  );
}
