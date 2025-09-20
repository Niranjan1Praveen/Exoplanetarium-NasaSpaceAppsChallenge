import GlobeWithLabels from "@/components/reusableComponents/globeWithLabels";
import ScrollAnimation from "@/components/reusableComponents/scrollAnimation";

export default function Page() {
  return (
    <ScrollAnimation
      verticalMovement={600}
      horizontalMovement={250}
      scaleRange={[1, 0.95, 0.85]}
      horizontalStart={1}
    >
      <GlobeWithLabels />
    </ScrollAnimation>
  );
}
