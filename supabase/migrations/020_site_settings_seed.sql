INSERT INTO site_settings (key, value) VALUES
  ('essence_per_rp_post',     '5'),
  ('offering_cost',           '50'),
  ('offering_refund_amount',  '25'),
  ('offering_cooldown_hours', '24'),
  ('rp_idle_days',            '7'),
  ('discord_webhook_url',     ''),
  ('site_description',        'A fan community and roleplay hub for witch-focused television.'),
  ('max_characters_per_user', '5'),
  ('xp_per_rp_post',          '10'),
  ('registration_open',       'true'),
  ('maintenance_mode',        'false'),
  ('launch_date',             '')
ON CONFLICT (key) DO NOTHING;
