/**
 * Service de génération PDF avec @react-pdf/renderer.
 *
 * Génère un PDF contenant plusieurs badges par page en grille,
 * prêt pour l'impression.
 *
 * @module services/pdf
 */

import { renderToBuffer, Document, Page, View, Text, Image, StyleSheet } from "@react-pdf/renderer";
import React from "react";
import type { Template, Participant, Event as BadgeEvent } from "@/lib/types";
import type { RenderContext } from "@/lib/templates/types";
import { mmToPoints, resolveField } from "@/lib/templates/engine";
import { FONT_FAMILIES } from "@/lib/types";

// ─── Styles PDF ─────────────────────────────────────────────────────

const createBadgeStyles = (template: Template) =>
  StyleSheet.create({
    badge: {
      width: mmToPoints(template.width_mm),
      height: mmToPoints(template.height_mm),
      position: "relative",
      overflow: "hidden",
    },
    element: {
      position: "absolute",
    },
  });

// ─── Composant badge PDF ────────────────────────────────────────────

function BadgePDFInner({
  template,
  context,
}: {
  template: Template;
  context: RenderContext;
}) {
  const styles = createBadgeStyles(template);

  return React.createElement(
    View,
    { style: styles.badge },
    // Fond d'image si présent
    template.background_url
      ? React.createElement(Image, {
          src: template.background_url,
          style: {
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
          },
        })
      : null,
    // Éléments dynamiques
    ...template.elements.map((el, i) => {
      const x = mmToPoints(el.x_mm);
      const y = mmToPoints(el.y_mm);
      const w = mmToPoints(el.width_mm);
      const h = mmToPoints(el.height_mm);

      // Texte
      if (el.type === "text") {
        const fieldPath = el.field || (el.name ? `participant.${el.name}` : "");
        const value = fieldPath ? resolveField(fieldPath, context) : "";
        const fontDef = FONT_FAMILIES.find((f) => f.value === (el.style?.fontFamily ?? "Helvetica"));
        const pdfFont = fontDef?.pdfFamily ?? "Helvetica";

        let displayValue = value;
        if (el.style?.textTransform === "uppercase") displayValue = value.toUpperCase();
        else if (el.style?.textTransform === "lowercase") displayValue = value.toLowerCase();
        else if (el.style?.textTransform === "capitalize") displayValue = value.replace(/\b\w/g, (c) => c.toUpperCase());

        return React.createElement(
          Text,
          {
            key: i,
            style: {
              position: "absolute",
              left: x,
              top: y,
              width: w,
              height: h,
              fontSize: el.style?.fontSize || 10,
              fontWeight: el.style?.fontWeight === "bold" ? "bold" : "normal",
              fontStyle: el.style?.fontStyle || "normal",
              color: el.style?.color || "#000000",
              textAlign: el.style?.textAlign || "left",
              fontFamily: pdfFont,
              letterSpacing: el.style?.letterSpacing || 0,
            },
          },
          displayValue
        );
      }

      // Photo participant
      if (el.type === "photo") {
        const fieldPath = el.field || (el.name ? `participant.${el.name}` : "");
        const photoUrl = fieldPath ? resolveField(fieldPath, context) : "";
        if (!photoUrl) return null;

        return React.createElement(Image, {
          key: i,
          src: photoUrl,
          style: {
            position: "absolute",
            left: x,
            top: y,
            width: w,
            height: h,
            borderRadius: el.shape === "circle" ? w / 2 : 0,
            objectFit: "cover",
          },
        });
      }

      // QR Code (placeholder)
      if (el.type === "qr") {
        return React.createElement(View, {
          key: i,
          style: {
            position: "absolute",
            left: x,
            top: y,
            width: w,
            height: h,
            backgroundColor: "#f0f0f0",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          },
        },
          React.createElement(Text, { style: { fontSize: 8, color: "#999" } }, "QR")
        );
      }

      // Logo
      if (el.type === "logo") {
        const fieldPath = el.field || (el.name ? `event.${el.name}` : "");
        const logoUrl = fieldPath ? resolveField(fieldPath, context) : context.event?.logo_url || "";
        if (!logoUrl) return null;

        return React.createElement(Image, {
          key: i,
          src: logoUrl,
          style: {
            position: "absolute",
            left: x,
            top: y,
            width: w,
            height: h,
            objectFit: "contain",
          },
        });
      }

      // Rectangle / Cercle
      if (el.type === "rect" || el.type === "circle") {
        return React.createElement(View, {
          key: i,
          style: {
            position: "absolute",
            left: x,
            top: y,
            width: w,
            height: h,
            backgroundColor: el.backgroundColor || "transparent",
            borderRadius: el.type === "circle" ? w / 2 : (el.borderRadius || 0),
          },
        });
      }

      // Ligne
      if (el.type === "line") {
        return React.createElement(View, {
          key: i,
          style: {
            position: "absolute",
            left: x,
            top: y,
            width: w,
            height: el.strokeWidth ? el.strokeWidth * 2.834645669 : 1,
            backgroundColor: el.strokeColor || "#000000",
          },
        });
      }

      return null;
    })
  );
}

// ─── Fonction publique ──────────────────────────────────────────────

/**
 * Génère un PDF contenant les badges en grille (2 colonnes si ça tient).
 */
export async function generateBadgePdf(
  template: Template,
  badges: Array<{ context: RenderContext; code: string }>,
  pageSize: { width: number; height: number } = { width: 595.28, height: 841.89 } // A4
): Promise<Buffer> {
  const badgeW = mmToPoints(template.width_mm);
  const badgeH = mmToPoints(template.height_mm);
  const gap = 15; // espacement entre badges
  const margin = 20; // marge page

  const usableWidth = pageSize.width - margin * 2;
  const usableHeight = pageSize.height - margin * 2;

  // Calculer le nombre de colonnes dynamiquement
  const cols = Math.max(1, Math.floor((usableWidth + gap) / (badgeW + gap)));
  const rows = Math.floor((usableHeight + gap) / (badgeH + gap));
  const badgesPerPage = cols * rows;

  // Centrer la grille horizontalement
  const gridWidth = cols * badgeW + (cols - 1) * gap;
  const offsetX = (pageSize.width - gridWidth) / 2;

  // Découper en pages
  const pages: Array<{ context: RenderContext; code: string }[]> = [];
  for (let i = 0; i < badges.length; i += badgesPerPage) {
    pages.push(badges.slice(i, i + badgesPerPage));
  }

  const doc = React.createElement(
    Document,
    null,
    ...pages.map((pageBadges, pageIndex) =>
      React.createElement(
        Page,
        { key: pageIndex, size: "A4" },
        ...pageBadges.map((badge, i) => {
          const col = i % cols;
          const row = Math.floor(i / cols);
          const x = offsetX + col * (badgeW + gap);
          const y = margin + row * (badgeH + gap);

          return React.createElement(
            "view" as any,
            {
              key: badge.code,
              style: {
                position: "absolute",
                left: x,
                top: y,
              },
            },
            React.createElement(BadgePDFInner, {
              template,
              context: badge.context,
            })
          );
        })
      )
    )
  );

  const buffer = await renderToBuffer(doc);
  return buffer;
}
