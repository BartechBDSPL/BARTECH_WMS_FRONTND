import Link from "next/link";

// import Dashboard from "@/components/tab/dashboard-final";
import { ContentLayout } from "@/components/admin-panel/content-layout";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
} from "@/components/ui/breadcrumb";
import JobControlMaster from "@/components/masters/job-card-master";

export default function DashboardPage() {
  return (
    <ContentLayout title="Job Control Master">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>  
            <BreadcrumbLink asChild>
              <Link href="/dashboard">Home</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <JobControlMaster />
    </ContentLayout>
  );
}