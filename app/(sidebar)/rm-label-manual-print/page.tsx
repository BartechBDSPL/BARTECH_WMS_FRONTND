import Link from "next/link";
import { ContentLayout } from "@/components/admin-panel/content-layout";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
} from "@/components/ui/breadcrumb";
import RMLabelManualPrinting from "@/components/transaction/rm-label-manual-printing";

export default function DashboardPage() {
  return (
    <ContentLayout title="RM Label Manual Printing">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>  
            <BreadcrumbLink asChild>
              <Link href="/dashboard">Home</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      < RMLabelManualPrinting/> 
    </ContentLayout>
  );
}