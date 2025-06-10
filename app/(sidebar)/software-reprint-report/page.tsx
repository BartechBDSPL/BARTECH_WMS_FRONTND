import Link from "next/link";
import { ContentLayout } from "@/components/admin-panel/content-layout";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
} from "@/components/ui/breadcrumb";
import SoftwareReprintReport from "@/components/reports/software-reprint-report";


export default function DashboardPage() {
  return (
    <ContentLayout title="Software RePrint Report">
      <Breadcrumb>
        <BreadcrumbList>  
          <BreadcrumbItem>  
            <BreadcrumbLink asChild>
              <Link href="/dashboard">Home</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <SoftwareReprintReport/>
    </ContentLayout>
  );
}