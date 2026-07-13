"use client";

import { motion } from "framer-motion";
import { Layers, Upload, Palette, FileDown, Users, Zap } from "lucide-react";

const features = [
  {
    icon: Upload,
    title: "Import facile",
    description:
      "Importez vos participants depuis un fichier CSV ou Excel. Mapping automatique des colonnes.",
  },
  {
    icon: Palette,
    title: "Design personnalisable",
    description:
      "Créez vos templates de badges avec un éditeur visuel. Texte, photos, logos, QR codes.",
  },
  {
    icon: FileDown,
    title: "PDF en un clic",
    description:
      "Générez un PDF prêt à imprimer avec tous vos badges en grille. Pas de stockage, tout est à la volée.",
  },
  {
    icon: Users,
    title: "Gestion des participants",
    description:
      "Ajoutez, modifiez et supprimez des participants. Chaque événement a ses propres champs.",
  },
  {
    icon: Layers,
    title: "Templates réutilisables",
    description:
      "Créez un template et réutilisez-le pour tous vos événements. Les champs se synchronisent automatiquement.",
  },
  {
    icon: Zap,
    title: "Instantané",
    description:
      "Pas d'attente. Tout est généré en temps réel depuis votre navigateur.",
  },
];

export function Features() {
  return (
    <section className="relative py-24">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `
              radial-gradient(circle at 1px 1px, rgba(99,102,241,0.4) 1px, transparent 0)
            `,
            backgroundSize: "40px 40px",
          }}
        />
        <motion.div
          className="absolute -top-20 right-[10%] w-40 h-40 border border-indigo-200/20 rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
        />
        <motion.div
          className="absolute bottom-10 left-[5%] w-24 h-24 border border-purple-200/15 rounded-xl rotate-45"
          animate={{ rotate: [45, 90, 45] }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <div className="relative max-w-7xl mx-auto px-6">
        <motion.div
          className="text-center max-w-2xl mx-auto mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
        >
          <p className="text-sm font-semibold text-indigo-600 uppercase tracking-wider mb-3">
            Fonctionnalités
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight">
            Tout ce dont vous avez besoin
          </h2>
          <p className="mt-4 text-gray-500">
            De l&apos;import des données à la génération du PDF, tout se passe
            en quelques étapes simples.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              className="group p-6 rounded-2xl bg-white/80 backdrop-blur-sm border border-gray-100 hover:border-indigo-200/60 hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-300"
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              whileHover={{ y: -4 }}
            >
              <div className="w-11 h-11 rounded-xl bg-indigo-50/80 flex items-center justify-center mb-4 group-hover:bg-indigo-100/80 group-hover:scale-110 transition-all duration-300">
                <f.icon className="w-5 h-5 text-indigo-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {f.title}
              </h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                {f.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
