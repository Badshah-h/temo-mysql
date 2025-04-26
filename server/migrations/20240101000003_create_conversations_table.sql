CREATE TABLE IF NOT EXISTS conversations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  template_id INT NOT NULL,
  response_format_id INT,
  query TEXT NOT NULL,
  response TEXT NOT NULL,
  raw_response TEXT,
  variables JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (template_id) REFERENCES templates(id) ON DELETE CASCADE,
  FOREIGN KEY (response_format_id) REFERENCES response_formats(id) ON DELETE SET NULL
);

CREATE INDEX idx_conversations_user_id ON conversations(user_id);
CREATE INDEX idx_conversations_template_id ON conversations(template_id);
CREATE INDEX idx_conversations_created_at ON conversations(created_at);
