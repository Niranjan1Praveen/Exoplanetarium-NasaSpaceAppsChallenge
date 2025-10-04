// app/page.tsx
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import TTVAnimation from "@/components/reusableComponents/animations/ttvAnimation";
import MicrolensingAnimation from "@/components/reusableComponents/animations/microlensing";
import DirectImagingAnimation from "@/components/reusableComponents/animations/directImaging";
import AstrometryAnimation from "@/components/reusableComponents/animations/astrometry";
import RadialVelocityAnimation from "@/components/reusableComponents/animations/radialVelocity";
import { AnimatedThemeToggler } from "@/components/ui/animated-theme-toggler";
import Link from "next/link";

const discoveryMethods = [
  {
    id: "ttv",
    title: "Transit Timing Variation",
    description: "Detecting planets through gravitational interactions",
    component: TTVAnimation,
    color: "from-blue-500 to-blue-700",
  },
  {
    id: "radial-velocity",
    title: "Radial Velocity",
    description: "Measuring stellar wobble from planetary gravity",
    component: RadialVelocityAnimation,
    color: "from-purple-500 to-purple-700",
  },
  {
    id: "microlensing",
    title: "Gravitational Microlensing",
    description: "Using gravitational lensing effects to find planets",
    component: MicrolensingAnimation,
    color: "from-orange-500 to-orange-700",
  },
  {
    id: "direct-imaging",
    title: "Direct Imaging",
    description: "Directly capturing images of exoplanets",
    component: DirectImagingAnimation,
    color: "from-red-500 to-red-700",
  },
  {
    id: "astrometry",
    title: "Astrometry",
    description: "Measuring precise stellar positions and motions",
    component: AstrometryAnimation,
    color: "from-indigo-500 to-indigo-700",
  },
];

export default function Home() {
  return (
    <main className="min-h-screen ">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text">
            Exoplanet Discovery Methods
          </h1>
          <div className="flex items-center justify-center gap-4 mb-4">
            <AnimatedThemeToggler />
            <Link href={"/play"} className="hover:underline">Go Back</Link>
          </div>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Explore the different techniques astronomers use to detect planets
            beyond our solar system
          </p>
        </div>

        {/* Methods Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {discoveryMethods.map((method) => (
            <Card
              key={method.id}
              className="transition-all duration-300 hover:scale-105 cursor-pointer"
            >
              <CardHeader className={`bg-gradient-to-r ${method.color} p-6`}>
                <CardTitle className="text-white text-xl">
                  {method.title}
                </CardTitle>
                <CardDescription className="text-gray-200">
                  {method.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0 ">
                <method.component />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Info Section */}
        <div className="mt-12 grid md:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle>About Exoplanet Discovery</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Astronomers use multiple methods to detect exoplanets, each with
                unique strengths and limitations. These techniques have revealed
                thousands of planets orbiting other stars, expanding our
                understanding of planetary systems throughout the galaxy.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Detection Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="text-muted-foreground space-y-2">
                <li>• Over 5,000 confirmed exoplanets</li>
                <li>• Transit method: Most productive technique</li>
                <li>• Radial velocity: Best for mass measurements</li>
                <li>• Multiple methods often used for confirmation</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
