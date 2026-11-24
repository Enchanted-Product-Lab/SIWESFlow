import RoleRouteGuard from "@/components/shared/RoleRouteGuard";

export default function CompanyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RoleRouteGuard
      allowedRole="COMPANY_ADMIN"
      portalLabel="company admin"
      fallbackPath="/companies/me"
    >
      {children}
    </RoleRouteGuard>
  );
}
