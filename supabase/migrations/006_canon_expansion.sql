-- Migration 006: canon_expansion
-- Expands canon list from 7 to 11 values in waitlist_signups.
-- New primary: ahs_coven, chilling_adventures
-- New secondary: motherland_fort_salem, discovery_of_witches, sabrina_90s
-- 'angel' excluded from waitlist (combined with 'buffy' as "Buffy & Angel" in UI).
-- Other canon_source tables (board_threads, characters, etc.) don't exist yet —
-- their constraints will use this full list when created.

ALTER TABLE waitlist_signups
  DROP CONSTRAINT waitlist_signups_canon_check;

ALTER TABLE waitlist_signups
  ADD CONSTRAINT waitlist_signups_canon_check
  CHECK (canon IN (
    'charmed', 'buffy', 'the_craft', 'practical_magic',
    'ahs_coven', 'chilling_adventures', 'secret_circle',
    'witches_of_east_end', 'motherland_fort_salem',
    'discovery_of_witches', 'sabrina_90s'
  ));
