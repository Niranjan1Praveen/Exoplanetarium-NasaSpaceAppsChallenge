import { HeroVideoDialog } from "../ui/hero-video-dialog";

export function HeroVideo() {
  return (
    <section className="relative flex items-center justify-center px-4 sm:px-6">
      <div className="container max-w-7xl">
        <HeroVideoDialog
          animationStyle="top-in-bottom-out"
          videoSrc="https://www.youtube.com/embed/LjKNpcIZw1M"
          thumbnailSrc="/hero-thumbnail.png"
          thumbnailAlt="The Exoplanetarium landing page"
        />
      </div>
      <div className="pointer-events-none absolute bottom-0 h-200 w-full bg-gradient-to-b from-transparent to-background" />
    </section>
  );
}
