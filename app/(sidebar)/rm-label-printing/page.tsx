import Link from "next/link";
import JobCardReport from "@/components/reports/rep-jc-master";
import { ContentLayout } from "@/components/admin-panel/content-layout";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
} from "@/components/ui/breadcrumb";
import RMLabelPrinting from "@/components/transaction/rm-label-printing";

export default function DashboardPage() {
  return (
    <ContentLayout title="RM Label Printing">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>  
            <BreadcrumbLink asChild>
              <Link href="/dashboard">Home</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      < RMLabelPrinting/> 
    </ContentLayout>
  );
}