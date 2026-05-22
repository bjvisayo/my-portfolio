import About from "../sections/About.jsx";
import Contact from "../sections/Contact.jsx";
import Hero from "../sections/Hero.jsx";
import Process from "../sections/Process.jsx";
import Projects from "../sections/Projects.jsx";
import Services from "../sections/Services.jsx";
import WhyChooseUs from "../sections/WhyChooseUs.jsx";

export default function HomePage() {
  return (
    <>
      <Hero />
      <WhyChooseUs />
      <Projects />
      <Services />
      <Process />
      <About />
      <Contact />
    </>
  );
}
