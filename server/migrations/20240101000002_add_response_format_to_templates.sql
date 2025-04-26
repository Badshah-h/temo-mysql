ALTER TABLE templates
ADD COLUMN response_format_id INT,
ADD CONSTRAINT fk_templates_response_format
  FOREIGN KEY (response_format_id)
  REFERENCES response_formats(id)
  ON DELETE SET NULL;

CREATE INDEX idx_templates_response_format_id ON templates(response_format_id);
