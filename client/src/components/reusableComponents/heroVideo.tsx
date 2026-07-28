import { HeroVideoDialog } from "../ui/hero-video-dialog";

export function HeroVideo() {
  return (
    <section className="relative flex items-center justify-center">
      <div className="container max-w-7xl">
        {/* The site is dark-only, so the light-mode duplicate that used to sit
            here was fetched but never shown. Only the dark variant renders. */}
        <HeroVideoDialog
          animationStyle="top-in-bottom-out"
          videoSrc="https://www.youtube.com/embed/qh3NGpYRG3I?si=4rb-zSdDkVK9qxxb"
          thumbnailSrc="https://startup-template-sage.vercel.app/hero-dark.png"
          thumbnailAlt="Exoplanetarium introduction video"
        />
      </div>
          <div className="pointer-events-none absolute bottom-0 h-200 w-full bg-gradient-to-b from-transparent to-background" />

    </section>
  );
}
