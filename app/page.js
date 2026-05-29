import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import Pillars from '@/components/Pillars';
import Menu from '@/components/Menu';
import Story from '@/components/Story';
import Contact from '@/components/Contact';

export default function Home() {
  return (
    <main>
      <Navbar />
      <Hero />
      <Menu />
      <Pillars />
      <Story />
      <Contact />
    </main>
  );
}
