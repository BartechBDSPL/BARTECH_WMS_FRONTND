import Link from "next/link";

import CustomerMaster from "@/components/masters/customer-master";
import { ContentLayout } from "@/components/admin-panel/content-layout";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from "@/components/ui/breadcrumb";

export default function DashboardPage() {
  return (
    <ContentLayout title="Customer Master">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>  
            <BreadcrumbLink asChild>
              <Link href="/customer-master">Home</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <CustomerMaster /> 
    </ContentLayout>
  );
}