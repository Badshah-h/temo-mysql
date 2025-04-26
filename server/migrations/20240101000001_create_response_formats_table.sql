CREATE TABLE IF NOT EXISTS response_formats (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  structure JSON NOT NULL,
  category VARCHAR(100),
  tags JSON,
  is_global BOOLEAN DEFAULT FALSE,
  usage_count INT DEFAULT 0,
  created_by INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Add indexes for common queries
CREATE INDEX idx_response_formats_name ON response_formats(name);
CREATE INDEX idx_response_formats_category ON response_formats(category);
CREATE INDEX idx_response_formats_created_by ON response_formats(created_by);
