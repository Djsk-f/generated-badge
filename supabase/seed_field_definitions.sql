-- =============================================================
-- Insertion des FieldDefinitions pour l'événement Camp des jeunes
-- Remplacer EVENT_ID par l'ID réel de l'événement
-- =============================================================

-- Trouver l'ID de l'événement (exécuter d'abord pour vérifier)
-- SELECT id, name FROM events WHERE name LIKE '%Camp%';

-- Insérer les champs (remplacer <EVENT_ID> par l'UUID réel)
INSERT INTO field_definitions (event_id, key, label, field_type, "order", visible_on_badge, visible_in_form, is_display_name)
VALUES
  ('<EVENT_ID>', 'nom', 'Nom', 'TEXT', 0, true, true, true),
  ('<EVENT_ID>', 'photo', 'Photo', 'IMAGE', 1, true, false, false),
  ('<EVENT_ID>', 'circonscription', 'Circonscription', 'TEXT', 2, true, true, false),
  ('<EVENT_ID>', 'ville', 'Ville', 'TEXT', 3, true, true, false)
ON CONFLICT (event_id, key) DO UPDATE SET
  label = EXCLUDED.label,
  field_type = EXCLUDED.field_type,
  "order" = EXCLUDED."order",
  visible_on_badge = EXCLUDED.visible_on_badge,
  visible_in_form = EXCLUDED.visible_in_form,
  is_display_name = EXCLUDED.is_display_name,
  updated_at = now();
