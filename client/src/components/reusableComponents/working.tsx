import {
  BellIcon,
  CalendarIcon,
  FileTextIcon,
  GlobeIcon,
  InputIcon,
} from "@radix-ui/react-icons";
import { BentoCard, BentoGrid } from "../ui/bento-grid";
import { Badge } from "../ui/badge";

const features = [
  {
    Icon: FileTextIcon,
    name: "Automated Light Curve Pipeline",
    description:
      "Detrending, folding, and feature extraction from raw telescope data, fully automated.",
    href: "/",
    cta: "Learn more",
    background: <img className="absolute -top-20 -right-20 opacity-20" />,
    className: "lg:row-start-1 lg:row-end-2 lg:col-start-1 lg:col-end-2",
  },
  {
    Icon: InputIcon,
    name: "AI/ML Classification",
    description:
      "LightGBM + XGBoost ensemble models classify candidate exoplanets quickly and accurately.",
    href: "/",
    cta: "Learn more",
    background: <img className="absolute -top-20 -right-20 opacity-20" />,
    className: "lg:row-start-1 lg:row-end-2 lg:col-start-2 lg:col-end-4",
  },
  {
    Icon: GlobeIcon,
    name: "Habitability & Ranking Tools",
    description:
      "Predict atmospheric detectability, climate zones, and prioritize targets for telescope follow-up.",
    href: "/",
    cta: "Learn more",
    background: <img className="absolute -top-20 -right-20 opacity-20" />,
    className: "lg:row-start-2 lg:row-end-4 lg:col-start-1 lg:col-end-2",
  },
  {
    Icon: CalendarIcon,
    name: "Research Dashboard",
    description:
      "Interactive visualization of classification accuracy, injection-recovery tests, and downloadable vetting reports.",
    href: "/",
    cta: "Learn more",
    background: <img className="absolute -top-20 -right-20 opacity-20" />,
    className: "lg:row-start-2 lg:row-end-4 lg:col-start-2 lg:col-end-3",
  },
  {
    Icon: BellIcon,
    name: "Immersive 3D Learning",
    description:
      "Students explore exoplanets, detection techniques, and simulations in a fun, interactive environment.",
    href: "/",
    cta: "Learn more",
    background: <img className="absolute -top-20 -right-20 opacity-20" />,
    className: "lg:row-start-2 lg:row-end-4 lg:col-start-3 lg:col-end-4",
  },
];

export function Working() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="text-center mb-12">
        <Badge variant={"secondary"} className="mb-2">Working</Badge>
        <h2 className="text-4xl md:text-5xl font-bold sm:text-4xl">
          How We Solve It?
        </h2>
      </div>
      <BentoGrid className="lg:grid-rows-3">
        {features.map((feature) => (
          <BentoCard key={feature.name} {...feature} />
        ))}
      </BentoGrid>
    </section>
  );
}
