import { isValidEmail } from "./utils";

export type ReviewFormFields = {
  name: string;
  email: string;
  review: string;
  rating: number;
  consent: boolean;
};

export function reviewFormError({ name, email, review, rating, consent }: ReviewFormFields) {
  if (!name.trim()) return "Name is required.";
  if (!email.trim()) return "Email is required.";
  if (!isValidEmail(email.trim())) return "Use a valid email address.";
  if (!review.trim()) return "Review is required.";
  if (rating < 1 || rating > 5) return "Stars are required.";
  if (!consent) return "Publication consent is required.";
  return null;
}
