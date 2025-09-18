-- Yuni App Database Schema
-- สร้างตารางสำหรับเก็บโพสต์และข้อมูลผู้ใช้

CREATE TABLE IF NOT EXISTS posts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT NOT NULL,
  content TEXT NOT NULL,
  image_uri TEXT,
  latitude REAL NOT NULL,
  longitude REAL NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  expires_at DATETIME NOT NULL
);

-- สร้าง index สำหรับการค้นหาตามตำแหน่ง
CREATE INDEX IF NOT EXISTS idx_posts_location ON posts(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_posts_expires ON posts(expires_at);

-- สร้างตารางสำหรับเก็บข้อมูลผู้ใช้
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  device_id TEXT UNIQUE NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- สร้าง index สำหรับการค้นหาตาม device_id
CREATE INDEX IF NOT EXISTS idx_users_device ON users(device_id);
