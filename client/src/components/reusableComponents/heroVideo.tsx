import { HeroVideoDialog } from "../ui/hero-video-dialog";

export function HeroVideo() {
  return (
    <section className="relative flex items-center justify-center">
      <div className="container max-w-7xl">
        <HeroVideoDialog
          className="block dark:hidden"
          animationStyle="top-in-bottom-out"
          videoSrc="https://www.youtube.com/embed/qh3NGpYRG3I?si=4rb-zSdDkVK9qxxb"
          thumbnailSrc="https://startup-template-sage.vercel.app/hero-light.png"
          thumbnailAlt="Hero Video"
        />
        <HeroVideoDialog
          className="hidden dark:block"
          animationStyle="top-in-bottom-out"
          videoSrc="https://www.youtube.com/embed/qh3NGpYRG3I?si=4rb-zSdDkVK9qxxb"
          thumbnailSrc="https://startup-template-sage.vercel.app/hero-dark.png"
          thumbnailAlt="Hero Video"
        />

      </div>
          <div className="pointer-events-none absolute bottom-0 h-200 w-full bg-gradient-to-b from-transparent to-background" />

    </section>
  );
}
