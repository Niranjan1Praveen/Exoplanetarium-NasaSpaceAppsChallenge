import About from "@/components/reusableComponents/about";
import ExoplanetSection from "@/components/reusableComponents/exoplanetSection";
import Faqs from "@/components/reusableComponents/faqs";
import Features from "@/components/reusableComponents/features";
import { Hero } from "@/components/reusableComponents/hero";
import { HeroVideo } from "@/components/reusableComponents/heroVideo";
import { Testimonial } from "@/components/reusableComponents/testimonial";
import { Workflow } from "@/components/reusableComponents/workflow";
import Working from "@/components/reusableComponents/working";
import { Meteors } from "@/components/ui/meteors";
import ExoplanetProblem from "@/components/reusableComponents/exoplanetProblem";

export default function Home() {
  return (
    <div className="relative">
      <div className="absolute overflow-hidden h-[1000px] w-full">
        <Meteors number={20} minDelay={3}/>
      </div>
      <Hero />
      <HeroVideo />
      <Features />
      <ExoplanetSection/>
      <ExoplanetProblem/>
      <Workflow />
      <Working/>
      <Testimonial />
      <Faqs/>
      <About />
    </div>
  );
}
