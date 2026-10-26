import HeroImageSection from "./components/hero-image-section";
import Navbar from "./components/navbar";
import { hero1m, heroCustom } from "./jsonFiles/heroContent";

export default function Home() {
  return (
    <div className="flex h-dvh flex-col overflow-hidden">
      <Navbar navFix={false} />
      <main className="flex min-h-0 flex-1 flex-col">
        <HeroImageSection slide={hero1m} className="min-h-0 flex-1" compact />
        <HeroImageSection slide={heroCustom} className="min-h-0 flex-1" compact />
      </main>
    </div>
  );
}
