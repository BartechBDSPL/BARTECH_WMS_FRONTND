import AdminPanelLayout from "@/components/admin-panel/admin-panel-layout";
import IdleTimerWrapper from "@/utills/IdleTimerWrapper";
import { SessionProvider } from "@/providers/session-provider";
import { AuthGuard } from "@/components/auth-guard";

export default function DemoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // <SessionProvider>
      // <AuthGuard>
        <AdminPanelLayout>
          <IdleTimerWrapper timeout={20 * 60 * 1000}>
            {children}
          </IdleTimerWrapper>
        </AdminPanelLayout>
      // </AuthGuard>
    // </SessionProvider>
  );
}