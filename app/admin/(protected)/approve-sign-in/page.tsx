import ApproveSignInClient from "./ApproveSignInClient";
import { AdminScreen } from "@/components/admin/AdminScreen";

export default function Page() {
  return (
    <AdminScreen reads={["security"]}>
      <ApproveSignInClient />
    </AdminScreen>
  );
}
