import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import {
  TransitMethod,
  RadialVelocityMethod,
  AstrometryMethod,
  MicrolensingMethod,
  DirectImagingMethod,
} from "./methods";

const methods = [
  {
    id: "transit",
    title: "Transit Photometry",
    description: "Watching a star dim as a planet crosses in front of it",
    Component: TransitMethod,
    idea:
      "If a planet's orbit is lined up edge-on to us, it blocks a sliver of its star once per orbit. The star does not move, it just gets very slightly fainter, and the size of that dip tells you the size of the planet.",
    tryIt:
      "Shrink the planet and watch the depth collapse — an Earth around a Sun-like star blocks under 100 ppm. Then drop the inclination a fraction of a degree and the transit disappears entirely, which is why this method only ever finds the small share of systems aligned with our line of sight.",
    found: "Most known exoplanets — the method behind Kepler and TESS.",
  },
  {
    id: "radial-velocity",
    title: "Radial Velocity",
    description: "Measuring the star's wobble towards and away from us",
    Component: RadialVelocityMethod,
    idea:
      "A planet does not orbit its star so much as both orbit their shared centre of mass. The star traces a small circle, and as it moves towards and away from us its light is Doppler shifted blue then red.",
    tryIt:
      "Jupiter tugs the Sun at about 12 m/s; Earth manages roughly 0.09 m/s. Slide the mass down and watch the signal sink below what a spectrograph can pick out. Then swing the inclination towards 0° — face-on, the wobble is sideways and the Doppler signal all but vanishes, which is why this method really measures mass × sin i.",
    found: "The first planet around a Sun-like star, 51 Pegasi b, in 1995.",
  },
  {
    id: "astrometry",
    title: "Astrometry",
    description: "Tracking the star's tiny loop against the background sky",
    Component: AstrometryMethod,
    idea:
      "The same barycentric wobble that radial velocity hears as a Doppler shift can instead be seen as a change in position. The star traces a small loop on the sky, superimposed on its straight-line drift between the stars.",
    tryIt:
      "This is the one method that gets better with wider orbits, not tighter ones — push the orbital distance up and the wobble grows. Then push the star further away and it shrinks again, since what you actually measure is an angle.",
    found: "Complements the others by pinning down true mass, not mass × sin i.",
  },
  {
    id: "microlensing",
    title: "Gravitational Microlensing",
    description: "Using a foreground star's gravity as a lens",
    Component: MicrolensingMethod,
    idea:
      "When one star drifts almost exactly in front of another, its gravity bends and focuses the background star's light, brightening it for weeks. A planet orbiting the foreground star adds its own brief, sharp spike on top.",
    tryIt:
      "Tighten the alignment and the whole event brightens dramatically. Move the planet's position within the event and its spike slides along the curve — that short blip, sometimes only hours long, is the entire detection.",
    found: "Cold, distant planets the other methods cannot reach — but each event happens only once.",
  },
  {
    id: "direct-imaging",
    title: "Direct Imaging",
    description: "Blocking the starlight and photographing the planet itself",
    Component: DirectImagingMethod,
    idea:
      "Every other method here is indirect. Direct imaging actually photographs the planet, which means suppressing a star that can be a billion times brighter and sitting a hair's breadth away on the sky.",
    tryIt:
      "Drag the orbit inside the coronagraph mask and the planet is lost in glare no matter how bright it is. This is why the method finds young, hot giants on wide orbits around nearby stars, and almost nothing else.",
    found: "Planets whose light can be split into a spectrum and studied directly.",
  },
];

export default function DiscoveryMethodsPage() {
  return (
    <main className="min-h-screen overflow-x-clip">
      <div className="container mx-auto px-4 py-8 sm:px-6">
        <div className="mb-10 text-center">
          <h1 className="mb-3 text-3xl font-bold sm:text-4xl lg:text-5xl">
            Exoplanet Discovery Methods
          </h1>
          <p className="mx-auto max-w-2xl text-base text-muted-foreground sm:text-lg">
            Five ways to find a world you cannot see. Move the sliders — every
            number updates from the same relations astronomers use, so you can
            watch a detection succeed or fail in real time.
          </p>
          <div className="mt-4 flex items-center justify-center gap-4">
            <Link
              href="/play"
              className="inline-flex items-center gap-1 text-sm hover:underline"
            >
              <ArrowLeft className="size-4" />
              Back to Play
            </Link>
          </div>
        </div>

        <div className="flex flex-col gap-8">
          {methods.map((method) => (
            <Card key={method.id} id={method.id} className="overflow-hidden">
              <CardHeader>
                <CardTitle className="text-xl sm:text-2xl">
                  {method.title}
                </CardTitle>
                <CardDescription>{method.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <method.Component />

                <div className="grid gap-4 border-t pt-5 sm:grid-cols-2">
                  <div>
                    <h3 className="mb-1 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                      The idea
                    </h3>
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      {method.idea}
                    </p>
                  </div>
                  <div>
                    <h3 className="mb-1 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                      Try this
                    </h3>
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      {method.tryIt}
                    </p>
                  </div>
                </div>

                <p className="rounded-md bg-muted/40 px-3 py-2 text-sm text-muted-foreground">
                  <span className="font-medium text-foreground">
                    What it finds:{" "}
                  </span>
                  {method.found}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </main>
  );
}
