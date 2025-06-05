import {
  Tag,
  BarChart,
  ArrowLeftRight,
  ClipboardMinus,
  SquarePen,
  Printer,
  Shield,
  LayoutGrid,
  
} from "lucide-react";

type Submenu = {
  href: string;
  label: string;
  active: boolean;
  value: string;
};

type Menu = {
  href: string;
  label: string;
  active: boolean;
  icon: any;
  submenus: Submenu[];
  value: string;
};

type Group = {
  groupLabel: string;
  menus: Menu[];
};

export function getMenuList(pathname: string): Group[] {
  return [
    {
      groupLabel: "",
      menus: [
        {
          href: "/dashboard",
          label: "Dashboard",
          active: pathname.includes("/dashboard"),
          icon: LayoutGrid,
          submenus: [],
          value: "1",
        },
      ],
    },
    {
      groupLabel: "",
      menus: [
        {
          href: "",
          label: "Master",
          active: pathname.includes("/heloj"),
          icon: SquarePen,
          value: "2",
          submenus: [
            {
              href:"/customer-master",
              label: "Customer Master",
              active: pathname === "/customer-master",
              value: "2_1",
            },
            {
              href: "/label-type-master",
              label: "Label Type Master",
              active: pathname === "/label-type-master",
              value: "2_2",
            },
            // {
            //   href: "/label-paper-type-master",
            //   label: "Label Paper Type Master",
            //   active: pathname === "/label-paper-type-master",
            //   value: "2_2",
            // },
            {
              href: "/machine-master",
              label: "Machine Master",
              active: pathname === "/machine-master",
              value: "2_3",
            },
            {
              href: "/raw-material-master",
              label: "Raw Material Master",
              active: pathname === "/raw-material-master",
              value: "2_4",
            },
       
            {
              href: "/die-master",
              label: "Die Master",
              active: pathname === "/die-master",
              value: "2_5",
            },
            {
              href: "/cylinder-master",
              label: "Cylinder Master",
              active: pathname === "/cylinder-master",
              value: "2_6",
            },
            {
              href: "/job-card-master",
              label: "Job Control Master",
              active: pathname === "/job-card-master",
              value: "2_7",
            },
            // edit-job-control-master
            {
              href: "/edit-job-control-master",
              label: "Edit Job Control Master",
              active: pathname === "/edit-job-control-master",
              value: "2_8",
            },
            // job-card
            {
              href: "/job-card",
              label: "Job Card",
              active: pathname === "/job-card",
              value: "2_9",
            },
             {
              href: "/printer-master",
              label: "Printer Master",
              active: pathname === "/printer-master",
              value: "2_10",
            },
           
             {
              href: "/warehouse-category-master",
              label: "WH Category Master",
              active: pathname === "/warehouse-category-master",
              value: "2_13",
            },
            {
              href: "/warehouse-master",
              label: "Warehouse Master",
              active: pathname === "/warehouse-master",
              value: "2_14",
            },
            {
              href: "/warehouse-location-master",
              label: "WH Location Master",
              active: pathname === "/warehouse-location-master",
              value: "2_15",
            }


           
          
          ],
        },
       
        {
          href: "",
          label: "Transaction",
          active: pathname.includes("/heloj"),
          icon: ArrowLeftRight,
          value: "3",
          submenus: [{
            href: "/job-card-approval",
            label: "Approve Job Control",
            active: pathname === "/job-card-approval",
            value: "3_1",
          },
            {
              href: "/grn-excel-upload",
              label: "Excel Upload",
              active: pathname === "/grn-excel-upload",
              value: "3_2",
            },
            {
              href: "/rm-label-printing",
              label: "RM-QC Label Printing",
              active: pathname === "/rm-label-printing",
              value: "3_3",
            },
           // software-tracking
          //  {
          //   href: "/software-tracking",
          //   label: "Software Tracking",
          //   active: pathname === "/software-tracking",
          //   value: "3_1",
          // }
        ],
        },
        // {
        //   href: "",
        //   label: "SAP Transactions",
        //   active: pathname.includes("/heloj"),
        //   icon: ArrowLeftRight,
        //   value: "3",
        //   submenus: [{
        //     href: "/qc-sap-transaction",
        //     label: "QC SAP Transaction",
        //     active: pathname === "/qc-sap-transaction",
        //     value: "7_1",
        //   },],
        // },
      
        // {
        //   href: "",
        //   label: "Re-Print",
        //   active: pathname.includes("/heloj"),
        //   icon: Printer,
        //   value: "8",
        //   submenus: [
        //     {
        //       href: "/reprint-fg-label-printing",
        //       label: "Reprint Primary Pack Label",
        //       active: pathname === "/reprint-fg-label-printing",
        //       value: "8_1",
        //     },
        //     {
        //       href: "/reprint-pallet-barcode",
        //       label: "Reprint Pallet Label",
        //       active: pathname === "/reprint-pallet-barcode",
        //       value: "8_2",
        //     },
        //   ],
        // },

         {
          href: "",
          label: "Tracking",
          active: pathname.includes("/heloj"),
          icon: SquarePen,
          value: "4",
          submenus: [
             {
              href: "/hardware-tracking",
              label: "Hardware Tracking",
              active: pathname === "/hardware-tracking",
              value: "4_1",
            },
            {
              href: "/re-print-hardwork",
              label: "Re-Print Hardwork Traking",
              active: pathname === "/re-print-hardwork",
              value: "4_2"
            },
            {
              href: "/software-tracking",
              label: "Software Tracking",
              active: pathname === "/software-tracking",
              value: "4_3",
            },
          ],
        },
        {
          href: "/categories",
          label: "Reports",
          active: pathname.includes("/categories"),
          icon: ClipboardMinus,
          value: "5",
          submenus: [
          {
            href: "/rep-jc-master",
            label: "Job Card Report",
            active: pathname === "/rep-jc-master",
            value: "5_1",
          },
          {
            href: "/qc-report",
            label: "RM-QC Report",
            active: pathname === "/qc-report",
            value: "5_1",
          },
          {
            href: "/inward-report",
            label: "Inward Report",
            active: pathname === "/inward-report",
            value: "5_1",
          },
          {
            href: "/put-away-report",
            label: "Put Away Report",
            active: pathname === "/put-away-report",
            value: "5_1",
          },
          {
            href: "/internal-movement",
            label: "Internal Movement Report",
            active: pathname === "/internal-movement",
            value: "5_1",
          },  //hardware-traking-report
          {
            href: "/hardware-traking-report",
            label: "Hardware Tracking",
            active: pathname === "/hardware-traking-report",
            value: "5_1",
          },
          // software-warrenty-report
          {
            href: "/software-warrenty-report",
            label: "Software Warrenty Report",
            active: pathname === "/software-warrenty-report",
            value: "5_1",
          }
          
         
        ],
        },        {
          href: "/tags",
          label: "Administrator",
          active: pathname.includes("/tags"),
          icon: Shield,
          value: "6",
          submenus: [
            {
              href: "/user-master",
              label: "User Master",
              active: pathname === "/user-master",
              value: "6_1",
            },
            {
              href: "/user-role-master",
              label: "User Role Master",
              active: pathname === "/user-role-master",
              value: "6_2",
            },
            {
              href: "/change-password",
              label: "Change Password",
              active: pathname === "/change-password",
              value: "6_3",
            },
            {
              href: "/android-access",
              label: "Android access",
              active: pathname === "/android-access",
              value: "6_4",
            },

          ],
        },
      ],
    },
  ];
}
