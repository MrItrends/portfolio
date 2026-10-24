import { adminConfigured, isAdmin } from "@/lib/admin/auth";
import AdminLogin from "@/components/admin/AdminLogin";
import ConversationView from "@/components/admin/ConversationView";

export const dynamic = "force-dynamic";

export default async function AdminConversationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!(await isAdmin())) return <AdminLogin configured={adminConfigured()} />;
  return <ConversationView id={id} />;
}
