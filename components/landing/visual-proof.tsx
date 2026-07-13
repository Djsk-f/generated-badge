/**
 * Section "Preuves visuelles" pour la landing page.
 *
 * Galerie de badges, comparaison avant/après, cas d'usage, mockup produit.
 *
 * @module components/landing/visual-proof
 */

"use client";

import { motion } from "framer-motion";
import {
  Mic,
  Users,
  Church,
  Building2,
  GraduationCap,
  Trophy,
  Check,
  X,
  ArrowRight,
  Upload,
  Palette,
  FileDown,
  Sparkles,
} from "lucide-react";

// ─── Badge Examples ─────────────────────────────────────────────────

interface BadgeExample {
  title: string;
  category: string;
  colors: { bg: string; accent: string; text: string };
  name: string;
  subtitle: string;
  badge?: string;
  features: string[];
}

const badgeExamples: BadgeExample[] = [
  {
    title: "Conférence",
    category: "Professionnel",
    colors: {
      bg: "linear-gradient(135deg, #1e3a5f 0%, #2563eb 100%)",
      accent: "#60a5fa",
      text: "#ffffff",
    },
    name: "Marie Laurent",
    subtitle: "Directrice Marketing",
    badge: "SPEAKER",
    features: ["Logo", "Nom", "Fonction", "QR Code"],
  },
  {
    title: "Camp de jeunes",
    category: "Événement religieux",
    colors: {
      bg: "linear-gradient(135deg, #065f46 0%, #10b981 100%)",
      accent: "#6ee7b7",
      text: "#ffffff",
    },
    name: "Jean-Paul Ndiaye",
    subtitle: "Groupe Alpha",
    features: ["Photo", "Nom", "Groupe", "QR Code"],
  },
  {
    title: "VIP",
    category: "Accès spécial",
    colors: {
      bg: "linear-gradient(135deg, #1a1a2e 0%, #fbbf24 50%, #f59e0b 100%)",
      accent: "#fbbf24",
      text: "#ffffff",
    },
    name: "Dr. Amadou Diallo",
    subtitle: "Invité d'honneur",
    badge: "VIP",
    features: ["Mention VIP", "Couleur élégante", "Accès VIP"],
  },
  {
    title: "Staff",
    category: "Organisation",
    colors: {
      bg: "linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)",
      accent: "#c4b5fd",
      text: "#ffffff",
    },
    name: "Fatou Sow",
    subtitle: "Responsable logistique",
    badge: "STAFF",
    features: ["Rôle", "Couleur Staff", "Accès backstage"],
  },
  {
    title: "Formation",
    category: "Université",
    colors: {
      bg: "linear-gradient(135deg, #0f766e 0%, #14b8a6 100%)",
      accent: "#5eead4",
      text: "#ffffff",
    },
    name: "Ousmane Fall",
    subtitle: "Master Informatique",
    features: ["Étudiant", "Formation", "Établissement"],
  },
];

// ─── Use Cases ──────────────────────────────────────────────────────

const useCases = [
  { icon: Mic, label: "Conférences", color: "text-blue-600", bg: "bg-blue-50" },
  { icon: Users, label: "Associations", color: "text-purple-600", bg: "bg-purple-50" },
  { icon: Church, label: "Églises & Camps", color: "text-green-600", bg: "bg-green-50" },
  { icon: Building2, label: "Entreprises", color: "text-indigo-600", bg: "bg-indigo-50" },
  { icon: GraduationCap, label: "Formations", color: "text-orange-600", bg: "bg-orange-50" },
  { icon: Trophy, label: "Événements sportifs", color: "text-red-600", bg: "bg-red-50" },
];

// ─── Before/After ───────────────────────────────────────────────────

const beforeItems = [
  "Fichier Excel compliqué",
  "Création manuelle un par un",
  "Erreurs de saisie fréquentes",
  "Heures de travail perdues",
];

const afterItems = [
  "Import CSV/Excel en 1 clic",
  "Génération automatique",
  "Badges personnalisés",
  "PDF prêt à imprimer",
];

// ─── Sub-components ─────────────────────────────────────────────────

function BadgeCard({ example, index }: { example: BadgeExample; index: number }) {
  return (
    <motion.div
      className="group relative"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ y: -8 }}
    >
      {/* Badge preview */}
      <div
        className="relative w-full aspect-[3/4] rounded-2xl overflow-hidden shadow-lg group-hover:shadow-2xl transition-all duration-500"
        style={{ background: example.colors.bg }}
      >
        {/* Top accent line */}
        <div
          className="absolute top-0 left-0 right-0 h-1"
          style={{ background: example.colors.accent }}
        />

        {/* Badge label */}
        {example.badge && (
          <div
            className="absolute top-4 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full text-[10px] font-bold tracking-wider"
            style={{
              background: example.colors.accent,
              color: example.colors.bg.includes("#1a1a2e") ? "#1a1a2e" : "#ffffff",
            }}
          >
            {example.badge}
          </div>
        )}

        {/* Photo placeholder */}
        <div className="mt-12 mx-auto w-20 h-20 rounded-full border-2 border-white/20 flex items-center justify-center bg-white/10">
          <svg className="w-10 h-10 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
          </svg>
        </div>

        {/* Name */}
        <div className="mt-4 text-center px-4">
          <p className="text-white font-bold text-sm leading-tight">{example.name}</p>
          <p className="text-white/60 text-[10px] mt-1">{example.subtitle}</p>
        </div>

        {/* Divider */}
        <div className="mx-4 mt-3 border-t border-white/10" />

        {/* QR placeholder */}
        <div className="mt-3 mx-auto w-12 h-12 rounded-lg bg-white/10 flex items-center justify-center">
          <div className="grid grid-cols-3 gap-[2px]">
            {Array.from({ length: 9 }).map((_, i) => (
              <div
                key={i}
                className="w-2 h-2 rounded-[1px]"
                style={{
                  backgroundColor: [0, 2, 4, 6, 8].includes(i)
                    ? "rgba(255,255,255,0.5)"
                    : "rgba(255,255,255,0.1)",
                }}
              />
            ))}
          </div>
        </div>

        {/* Code */}
        <p className="mt-2 text-center text-[8px] text-white/30 font-mono tracking-widest">
          BADGE-{String(index + 1).padStart(4, "0")}
        </p>
      </div>

      {/* Category label */}
      <div className="mt-3 text-center">
        <p className="text-sm font-semibold text-gray-900">{example.title}</p>
        <p className="text-xs text-gray-500">{example.category}</p>
      </div>
    </motion.div>
  );
}

function ComparisonSection() {
  return (
    <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
      {/* Avant */}
      <motion.div
        className="relative p-6 rounded-2xl bg-gray-50 border border-gray-200"
        initial={{ opacity: 0, x: -30 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
            <X className="w-4 h-4 text-red-600" />
          </div>
          <h4 className="font-semibold text-gray-900">Avant BadgeGen</h4>
        </div>
        <ul className="space-y-3">
          {beforeItems.map((item) => (
            <li key={item} className="flex items-center gap-3 text-sm text-gray-600">
              <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                <X className="w-3 h-3 text-red-500" />
              </div>
              {item}
            </li>
          ))}
        </ul>
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-sm text-red-600 font-medium">⏱️ Des heures de travail</p>
        </div>
      </motion.div>

      {/* Après */}
      <motion.div
        className="relative p-6 rounded-2xl bg-white border border-indigo-200 shadow-lg shadow-indigo-500/5"
        initial={{ opacity: 0, x: 30 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
            <Check className="w-4 h-4 text-green-600" />
          </div>
          <h4 className="font-semibold text-gray-900">Avec BadgeGen</h4>
        </div>
        <ul className="space-y-3">
          {afterItems.map((item) => (
            <li key={item} className="flex items-center gap-3 text-sm text-gray-600">
              <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                <Check className="w-3 h-3 text-green-500" />
              </div>
              {item}
            </li>
          ))}
        </ul>
        <div className="mt-4 pt-4 border-t border-indigo-100">
          <p className="text-sm text-green-600 font-medium">⚡ En quelques minutes</p>
        </div>
      </motion.div>
    </div>
  );
}

function WorkflowMockup() {
  const steps = [
    { icon: Upload, label: "Import participants", desc: "CSV ou Excel" },
    { icon: Palette, label: "Personnalisez", desc: "Éditeur visuel" },
    { icon: FileDown, label: "Générez", desc: "PDF en 1 clic" },
    { icon: Sparkles, label: "Impression", desc: "Prêt à l'emploi" },
  ];

  return (
    <motion.div
      className="relative max-w-4xl mx-auto"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.6 }}
    >
      {/* Background glow */}
      <div
        className="absolute -inset-8 rounded-3xl opacity-10 blur-3xl"
        style={{ background: "var(--gradient-primary)" }}
      />

      <div className="relative bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
        {/* Title bar */}
        <div className="flex items-center gap-1.5 mb-6">
          <div className="w-3 h-3 rounded-full bg-red-400" />
          <div className="w-3 h-3 rounded-full bg-yellow-400" />
          <div className="w-3 h-3 rounded-full bg-green-400" />
          <span className="ml-3 text-xs text-gray-400 font-mono">BadgeGen — Workflow</span>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {steps.map((step, i) => (
            <motion.div
              key={step.label}
              className="text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 + i * 0.15 }}
            >
              <div className="w-14 h-14 mx-auto rounded-2xl flex items-center justify-center mb-3"
                style={{ background: "var(--gradient-primary)" }}>
                <step.icon className="w-6 h-6 text-white" />
              </div>
              <p className="text-sm font-semibold text-gray-900">{step.label}</p>
              <p className="text-xs text-gray-500 mt-1">{step.desc}</p>
              {i < steps.length - 1 && (
                <ArrowRight className="hidden md:block w-4 h-4 text-gray-300 absolute -right-3 top-6" />
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

// ─── Main Component ─────────────────────────────────────────────────

export function VisualProof() {
  return (
    <section className="relative py-24 px-6 overflow-hidden">
      {/* Decorative background */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute inset-0 opacity-[0.015]"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgba(99,102,241,0.5) 1px, transparent 0)`,
            backgroundSize: "48px 48px",
          }}
        />
      </div>

      <div className="relative max-w-7xl mx-auto space-y-24">
        {/* ── Header ──────────────────────────────────────── */}
        <motion.div
          className="text-center max-w-2xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
        >
          <p className="text-sm font-semibold text-indigo-600 uppercase tracking-wider mb-3">
            Galerie
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight">
            Des badges adaptés à chaque{" "}
            <span
              className="bg-clip-text text-transparent"
              style={{ backgroundImage: "var(--gradient-primary)" }}
            >
              type d&apos;événement
            </span>
          </h2>
          <p className="mt-4 text-gray-500 leading-relaxed">
            BadgeGen génère des milliers de badges personnalisés avec vos couleurs,
            votre identité visuelle et les informations de vos participants.
          </p>
        </motion.div>

        {/* ── Badge Gallery ───────────────────────────────── */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {badgeExamples.map((example, i) => (
            <BadgeCard key={example.title} example={example} index={i} />
          ))}
        </div>

        {/* ── Before/After ────────────────────────────────── */}
        <div>
          <motion.div
            className="text-center max-w-xl mx-auto mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
          >
            <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
              Changez votre façon de créer des badges
            </h3>
            <p className="mt-3 text-gray-500">
              Fini les heures passées sur Excel. BadgeGen automatise tout.
            </p>
          </motion.div>
          <ComparisonSection />
        </div>

        {/* ── Use Cases ───────────────────────────────────── */}
        <div>
          <motion.div
            className="text-center max-w-xl mx-auto mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
          >
            <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
              Ils utilisent BadgeGen pour
            </h3>
          </motion.div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 max-w-5xl mx-auto">
            {useCases.map((uc, i) => (
              <motion.div
                key={uc.label}
                className="flex flex-col items-center gap-3 p-5 rounded-2xl bg-white border border-gray-100 hover:border-gray-200 hover:shadow-lg transition-all duration-300"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.4, delay: i * 0.06 }}
                whileHover={{ y: -4 }}
              >
                <div className={`w-12 h-12 rounded-xl ${uc.bg} flex items-center justify-center`}>
                  <uc.icon className={`w-6 h-6 ${uc.color}`} />
                </div>
                <span className="text-sm font-medium text-gray-700 text-center">
                  {uc.label}
                </span>
              </motion.div>
            ))}
          </div>
        </div>

        {/* ── Workflow Mockup ─────────────────────────────── */}
        <div>
          <motion.div
            className="text-center max-w-xl mx-auto mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
          >
            <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
              Du design à l&apos;impression en 4 étapes
            </h3>
            <p className="mt-3 text-gray-500">
              Un workflow simple et rapide, de l&apos;import au PDF final.
            </p>
          </motion.div>
          <WorkflowMockup />
        </div>
      </div>
    </section>
  );
}
