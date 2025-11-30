-- Fix variant_id sequence to sync with actual data
-- First, find the maximum variant_id
-- Then, reset the sequence to that value + 1

-- Get the current max variant_id and set the sequence
SELECT setval('variants_variant_id_seq', (SELECT GREATEST(COALESCE(MAX(variant_id), 1), 1) FROM variants), true);

-- Verify the sequence is set correctly
SELECT nextval('variants_variant_id_seq') as next_variant_id;