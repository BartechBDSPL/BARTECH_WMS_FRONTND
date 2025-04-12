import Link from "next/link";
import { ContentLayout } from "@/components/admin-panel/content-layout";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
} from "@/components/ui/breadcrumb";
import Softwaretracking from "@/components/transaction/software-tracking";


export default function DashboardPage() {
  return (
    <ContentLayout title="Software Tracking">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>  
            <BreadcrumbLink asChild>
              <Link href="/dashboard">Home</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <Softwaretracking /> 
    </ContentLayout>
  );
}