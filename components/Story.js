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
            It started with Mom's secret marinade. For over ten years she has been
            marinating lamb chops in a blend she never wrote down, and her son would
            carry them out to the desert to grill over open fire for the whole family.
          </p>
          <p>
            Those nights around the flame became a homegrown business. The recipe never
            changed: hand-trimmed racks, rested a full day in her marinade, seared hot
            for a charred crust and a tender centre. Every box that leaves our kitchen
            carries that story to your door.
          </p>
          <p className="story__rule">No dine-in. No distractions. Just chops, done right.</p>

          <div className="story__stats">
            <div><strong className="display">10+ yrs</strong><span>secret recipe</span></div>
            <div><strong className="display">100%</strong><span>premium cuts</span></div>
            <div><strong className="display">1</strong><span>obsession</span></div>
          </div>
        </motion.div>
      </div>

    </section>
  );
}
