import { Hero } from "@/components/home/Hero";
import { Manifesto } from "@/components/home/Manifesto";
import { Ritual } from "@/components/home/Ritual";
import { CutsRail } from "@/components/home/CutsRail";
import { Experiences } from "@/components/home/Experiences";
import { StoryTeaser } from "@/components/home/StoryTeaser";
import { Visit } from "@/components/Visit";

export default function Home() {
  return (
    <>
      <Hero />
      <Manifesto />
      <Ritual />
      <CutsRail />
      <Experiences />
      <StoryTeaser />
      <Visit />
    </>
  );
}
