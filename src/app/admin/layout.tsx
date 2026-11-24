import RoleRouteGuard from "@/components/shared/RoleRouteGuard";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RoleRouteGuard
      allowedRole="PLATFORM_ADMIN"
      portalLabel="platform admin"
      fallbackPath="/verifications/queue"
    >
      {children}
    </RoleRouteGuard>
  );
}
