'use client';
import { motion } from 'framer-motion';

export default function Story() {
  return (
    <section id="story" className="story">
      <div className="container">
        <motion.div
          className="story__copy"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <span className="eyebrow">The Experience</span>
          <h2>One thing. Done relentlessly well.</h2>
          <p>
            Hand-trimmed racks, marinated for a full day in our signature honey BBQ and
            roasted garlic herb blend, then seared hot over open flame. Charred crust,
            tender pink centre — every single time.
          </p>
          <p>
            Each box is packed in our signature matte black to land at your door exactly
            the way it left the grill: hot, juicy, ready to eat the moment you open it.
          </p>
          <p className="story__rule">No dine-in. No distractions. Just chops, done right.</p>

          <div className="story__stats">
            <div><strong className="display">24h</strong><span>marinade</span></div>
            <div><strong className="display">100%</strong><span>premium cuts</span></div>
            <div><strong className="display">1</strong><span>obsession</span></div>
          </div>
        </motion.div>
      </div>

    </section>
  );
}
