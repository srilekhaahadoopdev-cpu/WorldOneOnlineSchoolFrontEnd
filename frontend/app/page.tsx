
import { Hero } from "@/components/landing/Hero";
import { Stats } from "@/components/landing/Stats";
import { Programs } from "@/components/landing/Programs";
import { FeaturedCourses } from "@/components/landing/FeaturedCourses";
import { Pricing } from "@/components/landing/Pricing";

export default function Home() {
  return (
    <>
      <Hero />
      <Stats />
      <Programs />
      <FeaturedCourses />
      <Pricing />
    </>
  );
}
