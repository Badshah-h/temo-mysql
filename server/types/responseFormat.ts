export interface ResponseFormat {
  id: number;
  name: string;
  description?: string;
  structure: string; // JSON string
  category?: string;
  tags?: string; // JSON string
  is_global: boolean;
  usage_count: number;
  created_by?: number;
  created_at: Date;
  updated_at: Date;
}

export interface ResponseFormatStructure {
  title?: string;
  intro?: string;
  content_blocks?: Array<{
    type: "text" | "list" | "code" | "quote" | "image" | "table" | "custom";
    heading?: string;
    content: any;
  }>;
  faq?: Array<{
    question: string;
    answer: string;
  }>;
  actions?: Array<{
    label: string;
    url?: string;
    type: "link" | "button" | "download" | "copy";
    style?: "primary" | "secondary" | "outline" | "ghost";
  }>;
  disclaimer?: string;
  metadata?: Record<string, any>;
}
