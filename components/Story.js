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
          <span className="eyebrow">The Concept</span>
          <h2>One thing. Done relentlessly well.</h2>
          <p>
            House of Chops is a delivery-only premium lamb chop brand, operating exclusively
            on Talabat. We serve bold, fire-grilled lamb chops in signature black packaging
            — designed to stand out on the app and on the doorstep.
          </p>
          <p className="story__rule">No dine-in. No distractions. Just one product, done perfectly.</p>

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
