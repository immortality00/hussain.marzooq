export interface ContactFormData {
  name: string;
  email: string;
  phone?: string;
  message: string;
  danceStyle?: string;
  createdAt: number;
}

export interface ContactFormResponse {
  success: boolean;
  message: string;
  inquiryId?: string;
} 