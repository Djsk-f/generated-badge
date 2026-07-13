"use client";

import { useState } from "react";
import { motion, type Variants } from "framer-motion";
import { BadgeDemo } from "@/components/landing/badge-demo";
import { Features } from "@/components/landing/features";
import { VisualProof } from "@/components/landing/visual-proof";
import { Footer } from "@/components/landing/footer";
import { AuthModal } from "@/components/landing/auth-modal";
import { HeroBackground } from "@/components/landing/hero-bg";

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] },
  }),
};

const stagger: Variants = {
  visible: { transition: { staggerChildren: 0.08 } },
};

export function LandingHero() {
  const [authOpen, setAuthOpen] = useState(false);
  const [authTab, setAuthTab] = useState<"login" | "signup">("login");

  const openLogin = () => { setAuthTab("login"); setAuthOpen(true); };
  const openSignup = () => { setAuthTab("signup"); setAuthOpen(true); };

  return (
    <>
      <HeroBackground />

      {/* Nav */}
      <motion.nav
        className="fixed top-0 left-0 right-0 z-40 bg-white/70 backdrop-blur-xl border-b border-gray-100/60"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "var(--gradient-primary)" }}>
              <span className="text-white font-bold text-sm">BG</span>
            </div>
            <span className="text-lg font-bold text-gray-900 tracking-tight">BadgeGen</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={openLogin}
              className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors px-4 py-2 rounded-lg hover:bg-gray-100/60"
            >
              Se connecter
            </button>
            <button
              onClick={openSignup}
              className="text-sm font-medium text-white px-5 py-2 rounded-xl transition-all duration-200 hover:shadow-lg hover:shadow-indigo-500/25 hover:scale-[1.02] active:scale-[0.98]"
              style={{ background: "var(--gradient-primary)" }}
            >
              Commencer
            </button>
          </div>
        </div>
      </motion.nav>

      {/* Hero */}
      <section className="relative pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left: text */}
            <motion.div
              className="max-w-xl"
              variants={stagger}
              initial="hidden"
              animate="visible"
            >
              <motion.div
                variants={fadeUp}
                custom={0}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50/80 text-indigo-600 text-xs font-medium mb-6 border border-indigo-100/50"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                Badges professionnels en quelques clics
              </motion.div>

              <motion.h1
                variants={fadeUp}
                custom={1}
                className="text-4xl sm:text-5xl lg:text-[3.5rem] font-bold text-gray-900 leading-[1.08] tracking-[-0.02em]"
              >
                Créez des badges{" "}
                <span
                  className="bg-clip-text text-transparent"
                  style={{ backgroundImage: "var(--gradient-primary)" }}
                >
                  mémorables
                </span>{" "}
                pour vos événements
              </motion.h1>

              <motion.p
                variants={fadeUp}
                custom={2}
                className="mt-5 text-lg text-gray-500 leading-relaxed max-w-md"
              >
                Importez vos participants, personnalisez le design, et générez
                des badges PDF prêts à imprimer. Simple, rapide, gratuit.
              </motion.p>

              <motion.div
                variants={fadeUp}
                custom={3}
                className="mt-8 flex flex-col sm:flex-row gap-3"
              >
                <button
                  onClick={openSignup}
                  className="inline-flex items-center justify-center gap-2 text-base font-semibold text-white px-7 py-3.5 rounded-xl transition-all duration-200 hover:shadow-xl hover:shadow-indigo-500/25 hover:scale-[1.02] active:scale-[0.98]"
                  style={{ background: "var(--gradient-primary)" }}
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Commencer gratuitement
                </button>
                <button
                  onClick={openLogin}
                  className="inline-flex items-center justify-center gap-2 text-base font-semibold text-gray-700 px-7 py-3.5 rounded-xl border border-gray-200 hover:border-gray-300 hover:bg-gray-50/80 transition-all duration-200 active:scale-[0.98]"
                >
                  J&apos;ai déjà un compte
                </button>
              </motion.div>

              {/* Checkmarks */}
              <motion.ul
                variants={fadeUp}
                custom={4}
                className="mt-10 space-y-3"
              >
                {[
                  "Importez des participants via CSV ou formulaire",
                  "Designs de badges 100% personnalisables",
                  "Génération PDF en une seule clic",
                ].map((item, i) => (
                  <motion.li
                    key={item}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 + i * 0.1 }}
                    className="flex items-start gap-3 text-sm text-gray-600"
                  >
                    <svg className="w-5 h-5 text-indigo-500 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    {item}
                  </motion.li>
                ))}
              </motion.ul>
            </motion.div>

            {/* Right: badge mockup */}
            <motion.div
              className="relative flex justify-center lg:justify-end"
              initial={{ opacity: 0, x: 40, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
            >
              <BadgeDemo />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features */}
      <Features />

      {/* Visual Proof — Galerie de réalisations */}
      <VisualProof />

      {/* CTA */}
      <section className="relative py-24 overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 pointer-events-none">
          <motion.div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-[0.04]"
            style={{ background: "var(--gradient-primary)" }}
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 10, repeat: Infinity }}
          />
        </div>

        <div className="relative max-w-7xl mx-auto px-6 text-center">
          <motion.h2
            className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
          >
            Prêt à créer vos badges&nbsp;?
          </motion.h2>
          <motion.p
            className="mt-4 text-lg text-gray-500"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            Rejoignez les organisateurs d&apos;événements qui font confiance à BadgeGen.
          </motion.p>
          <motion.button
            onClick={openSignup}
            className="mt-8 inline-flex items-center gap-2 text-base font-semibold text-white px-8 py-4 rounded-xl transition-all duration-200 hover:shadow-xl hover:shadow-indigo-500/25 hover:scale-[1.02] active:scale-[0.98]"
            style={{ background: "var(--gradient-primary)" }}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Créer mon compte gratuit
          </motion.button>
        </div>
      </section>

      <Footer />

      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} defaultTab={authTab} />
    </>
  );
}
