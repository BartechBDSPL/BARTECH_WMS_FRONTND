"use client";
import React, { useState, useRef, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MultiSelect } from "@/components/multi-select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";
import axios from "axios";
import getUserID, { BACKEND_URL, getHeaderToken } from "@/lib/constants";
import { formatDateToDDMMYY } from "@/utills/dateUtils";
import { lastDayOfDecade } from "date-fns";

interface UserRole {
  U_ID: number;
  UserType: string;
  Web_MenuAccess: string;
  HHT_MenuAccess: string;
  Desktop_MenuAccess: string;
  CreatedBy: string;
  CreatedDate: string;
  UpdatedBy: string | null;
  UpdatedDate: string | null;
}

interface ApiResponse {
  RES: string;
}

const webAccessOptions = [
  { label: "1) - Dashboard", value: "1" },
  { label: "2) - Customer Master", value: "2_1" },
  { label: "3) - Label Type Master", value: "2_2" },
  { label: "4) - Machine Master", value: "2_3" },
  { label: "5) - Raw Material Master", value: "2_4" },
  { label: "6) - Die Master", value: "2_5" },
  { label: "7) - Cylinder Master", value: "2_6" },
  { label: "8) - Job Control Master", value: "2_7" },
  { label: "9) - Edit Job Control Master", value: "2_8" },
  { label: "10) - Job Card", value: "2_9" },
  { label: "11) - Printer Master", value: "2_10" },
  { label: "12) - WH Category Master", value: "2_13" },
  { label: "13) - Warehouse Master", value: "2_14" },
  { label: "14) - WH Location Master", value: "2_15" },

  { label: "15) - Approve Job Control", value: "3_1" },
  { label: "16) - GRN Excel Upload", value: "3_2" },
  { label: "17) - RM Label Printing", value: "3_3" },
  { label: "18) - Job Card", value: "3_4" },

  { label: "19) - Hardware Tracking", value: "4_1" },
  { label: "20) - Hardware Tracking Reprint", value: "4_2" },
  { label: "21) - Software Tracking", value: "4_3" },
  { label: "22) - Software Tracking Reprint", value: "4_4" },
  { label: "23) - JC Report", value: "5_1" },
  { label: "24) - QC Report", value: "5_2" },
  { label: "25) - RM Inward Report", value: "5_3" },
  { label: "26) - RM Put Away Report", value: "5_4" },
  { label: "27) - RM Internal Movement Report", value: "5_5" },
  { label: "28) - Hardware Tracking Report", value: "5_6" },
  { label: "29) - Hardware RePrint Report", value: "5_7" },
  { label: "30) - Software Tracking Report", value: "5_8" },
  { label: "31) - Software Reprint Report", value: "5_9" },
  { label: "32) - Customer Feedback Report", value: "5_10" },
  { label: "33) - Customer Complaint Report", value: "5_11" },
  { label: "33) - Job Card Report", value: "5_12" },

  
  { label: "33) - User Master", value: "6_1" },
  { label: "34) - User Role Master", value: "6_2" },
  { label: "35) - Change Password", value: "6_3" },
  { label: "36) - Material Stock Take", value: "6_4" }
];

const hhtAccessOptions = [
  { label: "1) Link Barcode and RFID", value: "1_1" },
  { label: "2) Material Find", value: "1_2" },
  { label: "3) Reports", value: "1_3" },
  { label: "4) Change Password", value: "1_4" },
  { label: "5) Material Stock Take", value: "1_5"},
]

// const desktopAccessOptions = [
//   { label: "1) - Dashboard", value: "1" },
//   { label: "2) - Company Master", value: "2_1" },
//   { label: "3) - Plant Master", value: "2_2" },
//   { label: "4) - Zone Master", value: "2_3" },
// ]

const UserRoleMaster: React.FC = () => {
  const [userRole, setUserRole] = useState("");
  const [webAccess, setWebAccess] = useState<string[]>(["1", "5_3"]);
  const [hhtAccess, setHhtAccess] = useState<string[]>(["1_4"]);
  const [desktopAccess, setDesktopAccess] = useState<string[]>(["1"]);
  const [userRoles, setUserRoles] = useState<UserRole[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const userRoleRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchUserRoles();
  }, []);

  const fetchUserRoles = async () => {
    try {
      const response = await axios.post(
        `${BACKEND_URL}/api/admin/getAllUserTypesData`,getHeaderToken()
      );
      setUserRoles(response.data);
    } catch (error) {
      console.error("Error fetching user roles:", error);
      toast({
        title: "Error",
        description: "Failed to fetch user roles.",
        variant: "destructive",
      });
    }
  };

  const handleSave = async () => {
    if (!userRole) {
      userRoleRef.current?.focus();
      toast({
        title: "Error",
        description: "Please enter user role.",
        variant: "destructive",
      });
      return;
    }
    if (webAccess.length === 0) {
      toast({
        title: "Error",
        description: "Please select at least one WEB Access",
        variant: "destructive",
      });
      return;
    }
    if (hhtAccess.length === 0) {
      toast({
        title: "Error",
        description: "Please select at least one HHT Access",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await axios.post(
        `${BACKEND_URL}/api/admin/insertUserRole`,
        {
          UserRole: userRole.trim(),
          DesktopAccess: desktopAccess.join(","),
          WebAccess: webAccess.join(","),
          HHTAccess: hhtAccess.join(","),
          Createdby: getUserID(), 
        }
      );
      const resValue = response.data.result[0].Status;
      if (resValue === "Save") {
        toast({
          title: "Success",
          description: "User Role inserted successfully",
        });
        fetchUserRoles();
        handleCancel();
      } else if (resValue === "Duplicate") {
        toast({
          title: "Duplicate",
          description: "User Role already exists",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error saving user role:", error);
      toast({
        title: "Error",
        description: "Failed to save user role.",
        variant: "destructive",
      });
    }
  };

  const handleUpdate = async () => {
    if (!editingId) return;

    try {
      const response = await axios.post(
        `${BACKEND_URL}/api/admin/updateUserRole`,
        {
          ID: editingId,
          UserRole: userRole,
          DesktopAccess: desktopAccess.join(","),
          WebAccess: webAccess.join(","),
          HHTAccess: hhtAccess.join(","),
          Updatedby: getUserID(),
        }
      );
      const resValue = response.data.result[0].Status;
      if (resValue === "Update") {
        toast({
          title: "Success",
          description: "User Role updated successfully",
        });
         
      fetchUserRoles();
      handleCancel();
      } else{
        toast({
          title: "Error",
          description: "Failed to update user role.",
          variant: "destructive",
        })
      }
     
    } catch (error) {
      console.error("Error updating user role:", error);
      toast({
        title: "Error",
        description: "Failed to update user role.",
        variant: "destructive",
      });
    }
  };

  const handleCancel = () => {
    setUserRole("");
    setWebAccess([]);
    setHhtAccess([]);
    setDesktopAccess([]);
    setIsEditing(false);
    setEditingId(null);
  };

  const handleEdit = (role: UserRole) => {
    setUserRole(role.UserType);
    setWebAccess(role.Web_MenuAccess.split(","));
     setHhtAccess(role.HHT_MenuAccess.split(','));
    //  setDesktopAccess(role.Desktop_MenuAccess.split(','));
    setIsEditing(true);
    setEditingId(role.U_ID);
  };

  return (
    <div className="space-y-8">
      <Card className="mt-5">
        <CardHeader>
          <CardTitle>User Role Master (* Fields Are Mandatory)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <Label htmlFor="userRole" className="block text-sm font-medium">
                User Role (*)
              </Label>
              <Input
                id="userRole"
                value={userRole}
                ref={userRoleRef}
                onChange={(e) => setUserRole(e.target.value)}
                className="mt-1 w-full sm:w-1/2 md:w-1/2 lg:w-1/4"
                disabled={isEditing}
              />
            </div>

            <div className="grid md:grid-cols-2 grid-cols-1 md:gap-4 gap-6">
              <div>
                <Label className="block text-sm font-medium">
                  Allow Web Access (*)
                </Label>
                <MultiSelect
                  options={webAccessOptions}
                  onValueChange={(value: string[]) => setWebAccess(value)}
                  defaultValue={webAccess}
                  placeholder="Select Web Access options"
                  variant="inverted"
                />
              </div>
              <div>
                <Label className="block text-sm font-medium">Allow HHT Access (*)</Label>
                <MultiSelect
                  options={hhtAccessOptions}
                  onValueChange={(value: string[]) => setHhtAccess(value)}
                  defaultValue={hhtAccess}
                  placeholder="Select HHT Access options"
                  variant="inverted"
                />
              </div>
              {/* <div className="block text-sm font-medium">
                <Label className="block text-sm font-medium">Allow Desktop Access (*)</Label>
                <MultiSelect
                  options={desktopAccessOptions}
                  onValueChange={(value: string[]) => setDesktopAccess(value)}
                  defaultValue={desktopAccess}
                  placeholder="Select Desktop Access options"
                  variant="inverted"
                />
             

              </div> */}
            </div>

            <div className="flex justify-end space-x-4">
              <Button onClick={handleSave} disabled={isEditing}>
                Save
              </Button>
              <Button onClick={handleUpdate} disabled={!isEditing}>
                Update
              </Button>
              <Button onClick={handleCancel} variant="outline">
                Cancel
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>User Roles</CardTitle>
        </CardHeader>
        <CardContent>
          {Array.isArray(userRoles) && userRoles.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead></TableHead>
                  <TableHead>UID</TableHead>
                  <TableHead>User Role</TableHead>
                  <TableHead>Web Menu Access</TableHead>
                  <TableHead>HHT Menu Access</TableHead>
                  {/* <TableHead>Desktop Menu Access</TableHead> */}
                  <TableHead>Created By</TableHead>
                  <TableHead >Created Date</TableHead>
                  <TableHead>Updated By</TableHead>
                  <TableHead>Updated Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {userRoles.map((role) => (
                  <TableRow key={role.U_ID}>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(role)}
                      >
                        Edit
                      </Button>
                    </TableCell>
                    <TableCell>{role.U_ID}</TableCell>
                    <TableCell>{role.UserType}</TableCell>
                    <TableCell>{role.Web_MenuAccess}</TableCell>
                    <TableCell>{role.HHT_MenuAccess}</TableCell>
                    {/* <TableCell>{role.Desktop_MenuAccess}</TableCell> */}
                    <TableCell>{role.CreatedBy}</TableCell>
                    <TableCell className="min-w-[200px]">
                      {formatDateToDDMMYY(role.CreatedDate)}
                    </TableCell>
                    <TableCell>{role.UpdatedBy}</TableCell>
                    <TableCell className="min-w-[200px]">
                      {role.UpdatedDate
                        ? formatDateToDDMMYY(role.UpdatedDate)
                        : "-"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-center">No User Roles created yet</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default UserRoleMaster;
