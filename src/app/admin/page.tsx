import { adminConfigured, isAdmin } from "@/lib/admin/auth";
import AdminLogin from "@/components/admin/AdminLogin";
import Inbox from "@/components/admin/Inbox";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  if (!(await isAdmin())) return <AdminLogin configured={adminConfigured()} />;
  return <Inbox />;
}
