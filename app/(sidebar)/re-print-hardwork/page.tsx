import Link from "next/link";
import { ContentLayout } from "@/components/admin-panel/content-layout";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
} from "@/components/ui/breadcrumb";
import RePrintHardWareTraking from "@/components/masters/re-printhard-ware";

export default function DashboardPage() {
  return (
    <ContentLayout title="Re-Print Hardwork Traking">
      <Breadcrumb>
        <BreadcrumbList>  
          <BreadcrumbItem>  
            <BreadcrumbLink asChild>
              <Link href="/dashboard">Home</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <RePrintHardWareTraking/>
    </ContentLayout>
  );
}