import Link from "next/link";
import RMproductionMaterialreturnReport from "@/components/reports/rep-rm-production-material-return";
import { ContentLayout } from "@/components/admin-panel/content-layout";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
} from "@/components/ui/breadcrumb";

export default function DashboardPage() {
  return (
    <ContentLayout title="RM Production Material Return Report">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>  
            <BreadcrumbLink asChild>
              <Link href="/">Home</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <RMproductionMaterialreturnReport /> 
    </ContentLayout>
  );
}