import Link from "next/link";
import { ContentLayout } from "@/components/admin-panel/content-layout";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
} from "@/components/ui/breadcrumb";
import SoftwareTrackingReport from "@/components/reports/software-warrenty-report";


export default function DashboardPage() {
  return (
    <ContentLayout title="Software Tracking Report">
      <Breadcrumb>
        <BreadcrumbList>  
          <BreadcrumbItem>  
            <BreadcrumbLink asChild>
              <Link href="/dashboard">Home</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <SoftwareTrackingReport/>
    </ContentLayout>
  );
}