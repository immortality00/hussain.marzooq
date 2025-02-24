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

export interface Inquiry extends ContactFormData {
  id: string;
  status: 'new' | 'archived' | 'deleted';
  updatedAt: number;
} 