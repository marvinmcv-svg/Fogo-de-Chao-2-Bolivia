import type { Metadata } from "next";
import { JsonLd, pageMeta, restaurantSchema } from "@/lib/seo";
import { Hero } from "@/components/home/Hero";
import { Manifesto } from "@/components/home/Manifesto";
import { Ritual } from "@/components/home/Ritual";
import { CutsRail } from "@/components/home/CutsRail";
import { Experiences } from "@/components/home/Experiences";
import { StoryTeaser } from "@/components/home/StoryTeaser";
import { Visit } from "@/components/Visit";

export const metadata: Metadata = pageMeta({
  title: "Rodizio brasileño en Santa Cruz de la Sierra",
  description: "Cortes tallados a tu mesa sobre brasas vivas, Market Table y Bar Fogo en el Boulevard del Ventura Mall. Reserva tu mesa.",
  path: "/",
});

export default function Home() {
  return (
    <>
      <JsonLd data={restaurantSchema()} />
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
