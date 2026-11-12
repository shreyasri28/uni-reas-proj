CREATE DATABASE IF NOT EXISTS uni_reas
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE uni_reas;

CREATE TABLE IF NOT EXISTS users (
  id CHAR(36) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(254) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('student', 'faculty', 'researcher', 'admin') NOT NULL DEFAULT 'student',
  department VARCHAR(150) NOT NULL DEFAULT '',
  verified BOOLEAN NOT NULL DEFAULT FALSE,
  profile_complete BOOLEAN NOT NULL DEFAULT FALSE,
  profile_picture VARCHAR(500) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_users_role (role),
  INDEX idx_users_department (department)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS pending_verifications (
  id CHAR(36) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(254) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('student', 'faculty', 'researcher', 'admin') NOT NULL DEFAULT 'student',
  department VARCHAR(150) NOT NULL DEFAULT '',
  code_hash CHAR(64) NOT NULL,
  expires_at DATETIME NOT NULL,
  attempts TINYINT UNSIGNED NOT NULL DEFAULT 0,
  last_sent_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_pending_expiry (expires_at)
) ENGINE=InnoDB;
