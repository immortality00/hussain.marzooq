import TestimonialsAdminClient from "./TestimonialsAdminClient";
import { AdminScreen } from "@/components/admin/AdminScreen";

export default function Page() {
  return (
    <AdminScreen reads={["testimonials"]}>
      <TestimonialsAdminClient />
    </AdminScreen>
  );
}
