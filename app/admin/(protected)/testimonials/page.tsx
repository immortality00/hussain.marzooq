import TestimonialsAdminClient from "./TestimonialsAdminClient";
import { AdminScreen } from "@/components/admin/AdminScreen";
import { TESTIMONIAL_PARAMS } from "@/lib/admin-links";

export default function Page() {
  return (
    <AdminScreen reads={["testimonials"]} stable={TESTIMONIAL_PARAMS}>
      <TestimonialsAdminClient />
    </AdminScreen>
  );
}
