import About from "@/components/reusableComponents/about";
import Features from "@/components/reusableComponents/features";
import Footer from "@/components/reusableComponents/footer";
import { FooterCta } from "@/components/reusableComponents/footerCta";
import { Hero } from "@/components/reusableComponents/hero";
import { HeroVideo } from "@/components/reusableComponents/heroVideo";
import Navbar from "@/components/reusableComponents/navbar";
import Pricing from "@/components/reusableComponents/pricing";
import { Testimonial } from "@/components/reusableComponents/testimonial";
import { Workflow } from "@/components/reusableComponents/workflow";
import { Meteors } from "@/components/ui/meteors";
import { ScrollProgress } from "@/components/ui/scroll-progress";

export default function Home() {
  return (
    <div className="relative">
      <div className="absolute overflow-hidden h-[1000px] w-full">
        <Meteors number={20} minDelay={3}/>
      </div>
      {/* <Navbar /> */}
      <Hero />
      <HeroVideo />
      <Features />
      <Workflow />
      <Pricing />
      <Testimonial />
      <About />
      {/* <FooterCta /> */}
      {/* <Footer /> */}
    </div>
  );
}
