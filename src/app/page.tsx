import Hero from "@/components/Hero";
import BuiltWithAI from "@/components/BuiltWithAI";
import Experience from "@/components/Experience";
import SelectedWork from "@/components/SelectedWork";
import About from "@/components/About";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Hero />
      <SelectedWork />
      <BuiltWithAI />
      <Experience />
      <About />
      <Footer />
    </>
  );
}
