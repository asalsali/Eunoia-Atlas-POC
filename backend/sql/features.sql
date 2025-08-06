-- one view per charity; join on ph hash look-up table
CREATE OR REPLACE VIEW meda_features AS
SELECT
  data->>'ph'   AS donor_hash,
  (data->>'amt')::numeric   AS rl_amt,
  EXTRACT(EPOCH FROM (now() - (data->>'ts')::timestamptz))/86400 AS days_since,
  COUNT(*) OVER (PARTITION BY data->>'ph') AS gift_count
FROM donations
WHERE data->>'chr' = 'MEDA';

CREATE OR REPLACE VIEW tara_features AS
SELECT
  data->>'ph' AS donor_hash,
  (data->>'amt')::numeric   AS rl_amt,
  EXTRACT(EPOCH FROM (now() - (data->>'ts')::timestamptz))/86400 AS days_since,
  COUNT(*) OVER (PARTITION BY data->>'ph') AS gift_count
FROM donations
WHERE data->>'chr' = 'TARA'; 