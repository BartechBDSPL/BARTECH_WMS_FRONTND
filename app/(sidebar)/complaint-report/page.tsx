import Link from "next/link";

import { ContentLayout } from "@/components/admin-panel/content-layout";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
} from "@/components/ui/breadcrumb";
import CustomerComplaintReport from "@/components/reports/complaint-report";


export default function DashboardPage() {
  return (
    <ContentLayout title="Report : Customer Complaint">
      <Breadcrumb>
        <BreadcrumbList>  
          <BreadcrumbItem>  
            <BreadcrumbLink asChild>
              <Link href="/dashboard">Home</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <CustomerComplaintReport/>
    </ContentLayout>
  );
}