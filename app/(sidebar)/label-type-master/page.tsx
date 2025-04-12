import Link from "next/link";

// import Dashboard from "@/components/tab/dashboard-final";
import { ContentLayout } from "@/components/admin-panel/content-layout";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
} from "@/components/ui/breadcrumb";
import LabelTypeMasterForm from "@/components/masters/label-type-master";

export default function DashboardPage() {
  return (
    <ContentLayout title="Label Type Master">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>  
            <BreadcrumbLink asChild>
              <Link href="/label-type-master">Home</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <LabelTypeMasterForm />
    </ContentLayout>
  );
}