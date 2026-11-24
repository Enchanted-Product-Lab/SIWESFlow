import RoleRouteGuard from "@/components/shared/RoleRouteGuard";

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RoleRouteGuard
      allowedRole="STUDENT"
      portalLabel="student"
      fallbackPath="/students/me"
    >
      {children}
    </RoleRouteGuard>
  );
}
