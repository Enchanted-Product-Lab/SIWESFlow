
import SchoolRouteGuard from "@/components/shared/SchoolRouteGuard";

export default function SchoolLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <SchoolRouteGuard>{children}</SchoolRouteGuard>;
}
