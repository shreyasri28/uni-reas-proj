-- Run this ONCE on an existing Uni-Reas database if the users table
-- was created before the profile fields were added to schema.sql.
USE uni_reas;

ALTER TABLE users
  ADD COLUMN bio TEXT NULL,
  ADD COLUMN research_interests JSON NULL,
  ADD COLUMN skills JSON NULL,
  ADD COLUMN years_experience INT UNSIGNED NOT NULL DEFAULT 0;
