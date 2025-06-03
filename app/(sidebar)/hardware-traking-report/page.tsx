import Link from "next/link";

import { ContentLayout } from "@/components/admin-panel/content-layout";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
} from "@/components/ui/breadcrumb";
import HardWareReport from "@/components/reports/hardware-report";


export default function DashboardPage() {
  return (
    <ContentLayout title="Report : Hardware Tracking">
      <Breadcrumb>
        <BreadcrumbList>  
          <BreadcrumbItem>  
            <BreadcrumbLink asChild>
              <Link href="/dashboard">Home</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <HardWareReport/>
    </ContentLayout>
  );
}