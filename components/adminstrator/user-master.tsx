"use client";
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/components/ui/use-toast";
import CustomDropdown from "../CustomDropdown";

import Cookies from "js-cookie";
import { BACKEND_URL, getUserDetails } from "@/lib/constants";
import insertAuditTrail from "@/utills/insertAudit";
import { getUserID } from "@/utills/getFromSession";
import { logError } from "@/utills/loggingException";

import axios from "axios";
// import { LineMasterfetchPlantNamesApi } from '@/utills/Master/apiService';

interface PlantOption {
  value: string;
  label: string;
}

interface UserData {
  User_ID: string;
  User_Name: string;
  User_Password: string;
  User_Role: string;
  Status: string;
  Locked: string;
  UpdatedBy: string;
  PassExpDays: number;
  LoginAttempt: number;
  Name: string;
  PlantCode: string;
  EmailId: string;
  MobileNo: string;
}

interface User {
  id: number;
  User_ID: string;
  User_Name: string;
  User_Password: string;
  User_Status: string;
  User_Role: string;
  Web_MenuAccess: string;
  HHT_MenuAccess: string;
  CreatedBy: string;
  CreatedOn: string;
  UpdatedBy: string;
  UpdatedOn: string;
  Locked: string;
  LoginAttempt: number;
  LastPassChange: string;
  PassExpDays: number;
  Expired: string;
  Name: string;
  PlantCode: string;
  CompanyCode: number;
  Department: number;
  ChangePassFlag: string;
  EmailId: string;
  MobileNo: string;
  LastLogin: string | null;
  LoginVia: string | null;
  LoginCode: string | null;
  ImagePath: string | null;
}

const UserMaster: React.FC = () => {
  const { toast } = useToast();
  const [plantOptions, setPlantOptions] = useState<PlantOption[]>([]);
  const [userTypeOptions, setUserTypeOptions] = useState<PlantOption[]>([]);
  const [formData, setFormData] = useState<UserData>({
    User_ID: "",
    User_Name: "",
    User_Password: "",
    User_Role: "",
    Status: "active",
    Locked: "No",
    UpdatedBy: "",
    PassExpDays: 90,
    LoginAttempt: 0,
    Name: "",
    PlantCode: "",
    EmailId: "",
    MobileNo: "",
  });
  const [WebMenuAccess, setWebMenuAccess] = useState<string[]>([]);
  const [hhtMenuAccess, setHhtMenuAccess] = useState<string[]>([]);
  const [deskTopAccess, setDeskTopAccess] = useState<string[]>([]);
  const [userID, setUserID] = useState<number>();
  const [users, setUsers] = useState<User[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [confirmPassword, setConfirmPassword] = useState("");
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*])(?!.*\s).{8,}$/;

  useEffect(() => {
    fetchPlantNames();
    fetchUserTypeRoles();
    fetchUsers();
    insertAuditTrail({
      AppType: "Web",
      Activity: "User Master",
      Action: `User Master Opened by ${getUserID()}`,
      NewData: "",
      OldData: "",
      Remarks: "",
      UserId: getUserID(),
      PlantCode: "",
    });
  }, []);

  const fetchPlantNames = async () => {
    try {
      const NewData = {};
      const response = await axios.post(
        `${BACKEND_URL}/api/admin/getPlantNameAll`,
        NewData
      );
      const data: { PlantCode: string }[] = response.data;
      setPlantOptions(
        data.map((item) => ({ value: item.PlantCode, label: item.PlantCode }))
      );
    } catch (error: any) {
      console.error("Error fetching plant names:", error);
      logError(
        "Error fetching plant names",
        error,
        "UserMaster-fetchPlantNames",
        getUserID()
      );
    }
  };

  const fetchUserTypeRoles = async () => {
    try {
      const response = await axios.post(
        `${BACKEND_URL}/api/admin/getUserTypeRole`
      );
      const data: { UserType: string }[] = await response.data;
      setUserTypeOptions(
        data.map((item) => ({ value: item.UserType, label: item.UserType }))
      );
    } catch (error: any) {
      console.error("Error fetching User Types:", error);
      logError(
        "Error fetching User Types",
        error,
        "UserMaster-fetchUserTypeRoles",
        getUserID()
      );
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await axios.post(
        `${BACKEND_URL}/api/admin/getAllUserList`
      );
      const data: User[] = await response.data;
      setUsers(data);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast({
        title: "Error",
        description: "Failed to fetch users",
        variant: "destructive",
      });
    }
  };
  const fatchUserRoleDetails = async (value: string) => {
    if (!value) return;
    try {
      var data = {
        UserType: value,
      };
      const response = await axios.post(
        `${BACKEND_URL}/api/admin/getUserTypeRoleByUserRole`,
        data
      );
      const getvalue = response.data[0];
      /**
      |--------------------------------------------------
      |  {
            "U_ID": 1,
            "UserType": "admin",
            "Web_MenuAccess": "1,2_1,2_2,2_3,2_4,3_2,3_3,3_4,3_5,3_6,3_7,4_1,4_2,4_3,4_4,4_5,4_6,4_7,4_8,4_9,5_1,5_2,5_3",
            "Desktop_MenuAccess": null,
            "HHT_MenuAccess": "1_1,1_2",
            "CreatedBy": null,
            "CreatedDate": "2025-03-16T08:30:53.943Z",
            "UpdatedBy": null,
            "UpdatedDate": null
        }
      |--------------------------------------------------
      */
      //  Convert comma-separated strings to arrays, handling null/undefined cases
      const webAccess = getvalue.Web_MenuAccess
        ? getvalue.Web_MenuAccess.split(",")
        : [];
      const hhtAccess = getvalue.HHT_MenuAccess
        ? getvalue.HHT_MenuAccess.split(",")
        : [];

      setWebMenuAccess(webAccess);
      setHhtMenuAccess(hhtAccess);
    } catch (error) {
      console.error("Error fetching user role details:", error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePlantChange = (value: string) => {
    setFormData((prev) => ({ ...prev, PlantCode: value }));
  };
  const handleLockStatus = (value: string) => {
    setFormData((prev) => ({ ...prev, Locked: value }));
  };
  const handleUserTypeChange = (value: string) => {
    setFormData((prev) => ({ ...prev, User_Role: value }));
    fatchUserRoleDetails(value);
  };

  const handleStatusChange = (value: string) => {
    setFormData((prev) => ({ ...prev, Status: value }));
  };

  const handleSave = async () => {
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*])(?!.*\s).{8,}$/;

    // Validation checks
    try {
      // Check required fields first
      if (!formData.PlantCode || !formData.User_Role || !formData.User_ID) {
        toast({
          title: "Error",
          description: "Please fill all required fields",
          variant: "destructive",
        });
        return;
      }

      // Password validation
      if (!formData.User_Password) {
        toast({
          title: "Error",
          description: "Password is required",
          variant: "destructive",
        });
        return;
      }

      // Password matching check
      if (formData.User_Password !== confirmPassword) {
        toast({
          title: "Error",
          description: "Passwords do not match",
          variant: "destructive",
        });
        return;
      }

      // Password strength check
      if (!passwordRegex.test(formData.User_Password)) {
        toast({
          title: "Error",
          description:
            "Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, and one special character (!@#$%^&*) with no spaces",
          variant: "destructive",
        });
        return;
      }

      // Prepare data for submission
      const dataToSubmit = {
        User_ID: formData.User_ID.trim(),
        User_Name: formData.User_Name.trim(),
        User_Password: formData.User_Password,
        User_Role: formData.User_Role,
        Status: formData.Status || "active",
        Web_MenuAccess: WebMenuAccess.join(","),
        Desktop_MenuAccess: deskTopAccess.join(","),
        HHT_MenuAccess: hhtMenuAccess.join(","),
        Locked: "No",
        CreatedBy: getUserID() || "admin",
        PassExpDays: formData.PassExpDays || 90,
        LoginAttempt: 0,
        Name: formData.User_Name.trim(), // Adjust if needed
        PlantCode: formData.PlantCode.trim(),
        Line: "",
        EmailId: formData.EmailId.trim() || "",
        MobileNo: formData.MobileNo.trim() || "",
        UpdatedBy: getUserID() || "", // Include only if your SQL query supports it
      };

      const response = await axios.post(
        `${BACKEND_URL}/api/admin/insertUserDetails`,
        dataToSubmit
      );

      const responseData = response.data[0];

      if (responseData.Status === "T") {
        toast({
          title: "Success",
          description: responseData.Message,
        });
        fetchUsers();
        resetForm();
      } else if (responseData.Status === "F") {
        toast({
          title: "Error",
          description: responseData.Message,
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error("Error saving user:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to save user",
        variant: "destructive",
      });
    }
  };

  const handleUpdate = async () => {
    if (editingId === null) return;

    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*])(?!.*\s).{8,}$/;

    // Validation checks for required fields
    if (!formData.PlantCode || !formData.User_Role || !formData.User_ID) {
      toast({
        title: "Error",
        description: "Please fill all required fields",
        variant: "destructive",
      });
      return;
    }

    // Password-related validations only if User_Password is provided
    if (formData.User_Password) {
      if (formData.User_Password !== confirmPassword) {
        toast({
          title: "Error",
          description: "Passwords do not match",
          variant: "destructive",
        });
        return;
      }

      if (!passwordRegex.test(formData.User_Password)) {
        toast({
          title: "Error",
          description:
            "Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, and one special character (!@#$%^&*) with no spaces",
          variant: "destructive",
        });
        return;
      }
    }
    // const { ID, User_Password, User_Role, Status, Web_MenuAccess, HHT_MenuAccess, Locked, UpdatedBy, UserName, PlantCode, Line, EmailId, MobileNo, PassExpDays } = req.body;

    try {
      const requestBody = {
        ID: userID,
        UserName: formData.User_Name?.trim() || "",
        User_Role: formData.User_Role,
        Status: formData.Status || "active",
        Web_MenuAccess: WebMenuAccess.join(","),
        HHT_MenuAccess: hhtMenuAccess.join(","),
        User_ID: formData.User_ID?.trim() || "",
        MobileNo: formData.MobileNo?.trim() || "",
        EmailId: formData.EmailId?.trim() || "",
        Locked: formData.Locked || "No",
        PassExpDays: formData.PassExpDays || 90,
        UpdatedBy: getUserID() || "",
        PlantCode: formData.PlantCode?.trim() || "",
        Line: "",
        User_Password: formData.User_Password?.trim() || "",
      };
      console.log(requestBody);

      const response = await axios.post(
        `${BACKEND_URL}/api/admin/updateUserDetails`,
        requestBody,
        {
          headers: { "Content-Type": "application/json" },
        }
      );
      const responseData = response.data[0];
      if (responseData.Status === "T") {
        toast({
          title: "Success",
          description: responseData.Message,
        });
        fetchUsers();
        resetForm();
      } else {
        throw new Error("Failed to update");
      }
    } catch (error) {
      console.error("Error updating user:", error);
      toast({
        title: "Error",
        description: "Failed to update user",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (user: User) => {
    setFormData({
      User_ID: user.User_ID,
      User_Name: user.User_Name,
      // User_Password: user.User_Password,
      User_Password: "",
      User_Role: user.User_Role,
      Status: user.User_Status,
      Locked: user.Locked,
      UpdatedBy: user.UpdatedBy,
      PassExpDays: user.PassExpDays,
      LoginAttempt: user.LoginAttempt,
      Name: user.Name,
      PlantCode: user.PlantCode,
      EmailId: user.EmailId ? user.EmailId : "",
      MobileNo: user.MobileNo,
    });
    handleUserTypeChange(user.User_Role);
    setUserID(user.id);

    setIsEditing(true);
    setEditingId(user.id);

    const updatedFields: string[] = [];
    const oldData = users.find((user) => user.id === editingId);
    if (oldData) {
      if (oldData.User_Name !== formData.User_Name)
        updatedFields.push(
          `User Name: ${oldData.User_Name} -> ${formData.User_Name}`
        );
      if (oldData.EmailId !== formData.EmailId)
        updatedFields.push(
          `Email ID: ${oldData.EmailId} -> ${formData.EmailId}`
        );
      if (oldData.MobileNo !== formData.MobileNo)
        updatedFields.push(
          `Mobile No: ${oldData.MobileNo} -> ${formData.MobileNo}`
        );
      if (oldData.User_Status !== formData.Status)
        updatedFields.push(
          `Status: ${oldData.User_Status} -> ${formData.Status}`
        );
      if (oldData.Locked !== formData.Locked)
        updatedFields.push(`Locked: ${oldData.Locked} -> ${formData.Locked}`);
      if (oldData.PassExpDays !== formData.PassExpDays)
        updatedFields.push(
          `Password Exp Days: ${oldData.PassExpDays} -> ${formData.PassExpDays}`
        );
    }

    insertAuditTrail({
      AppType: "Web",
      Activity: "User Master",
      Action: `User Updated by ${getUserID()}`,
      NewData: updatedFields.join("; "),
      OldData: "",
      Remarks: "",
      UserId: getUserID(),
      PlantCode: formData.PlantCode,
    });

    // Insert audit trail for edit initiation
    insertAuditTrail({
      AppType: "Web",
      Activity: "User Master",
      Action: `Edit Initiated by ${getUserID()} for user id ${
        user.User_ID
      } with userName ${user.User_Name} and role ${user.User_Role}`,
      NewData: "",
      OldData: "",
      Remarks: "",
      UserId: getUserID(),
      PlantCode: "",
    });
  };

  const resetForm = () => {
    setFormData({
      User_ID: "",
      User_Name: "",
      User_Password: "",
      User_Role: "",
      Status: "active",
      Locked: "No",
      UpdatedBy: "",
      PassExpDays: 90,
      LoginAttempt: 0,
      Name: "",
      PlantCode: "",
      EmailId: "",
      MobileNo: "",
    });
    setConfirmPassword("");
    setIsEditing(false);
    setEditingId(null);
    setWebMenuAccess([]);
    setDeskTopAccess([]);
    setHhtMenuAccess([]);
  };

  return (
    <>
      <Card className="w-full mx-auto mt-5">
        <CardHeader>
          <CardTitle>
            User Master{" "}
            <span className="font-normal text-sm text-muted-foreground">
              (* Fields Are Mandatory)
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
            <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-6 gap-4">
              <div className="space-y-2">
                <Label htmlFor="PlantCode">Plant *</Label>
                <CustomDropdown
                  options={plantOptions}
                  value={formData.PlantCode}
                  onValueChange={handlePlantChange}
                  placeholder="Select plant code"
                  searchPlaceholder="Search plant code..."
                  emptyText="No plant code found."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="User_Role">User Type/Role *</Label>
                <CustomDropdown
                  options={userTypeOptions}
                  value={formData.User_Role}
                  onValueChange={handleUserTypeChange}
                  placeholder="Select User Type"
                  searchPlaceholder="Search User Type..."
                  emptyText="No user type found."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="User_Name">User Name *</Label>
                <Input
                  type="text"
                  id="User_Name"
                  name="User_Name"
                  value={formData.User_Name}
                  onChange={handleInputChange}
                  required
                  // disabled={isEditing}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="User_ID">User ID *</Label>
                <Input
                  id="User_ID"
                  name="User_ID"
                  value={formData.User_ID}
                  onChange={handleInputChange}
                  required
                  disabled={isEditing}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="EmailId">Email ID *</Label>
                <Input
                  id="EmailId"
                  name="EmailId"
                  value={formData.EmailId}
                  onChange={handleInputChange}
                  required
                  type="email"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="User_Password">Password *</Label>
                <Input
                  id="User_Password"
                  name="User_Password"
                  value={formData.User_Password}
                  onChange={handleInputChange}
                  required
                  type="password"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password *</Label>
                <Input
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  type="password"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="Locked">Locked</Label>
                <Select
                  value={formData.Locked}
                  onValueChange={handleLockStatus}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Lock Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Yes">Yes</SelectItem>
                    <SelectItem value="No">No</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {/* <div className="space-y-2">
                <Label htmlFor="PassExpDays">Password Exp Days *</Label>
                <Input id="PassExpDays" name="PassExpDays" value={formData.PassExpDays} onChange={handleInputChange} required type="number" />
              </div> */}
              <div className="space-y-2">
                <Label htmlFor="Status">Status</Label>
                <Select
                  value={formData.Status}
                  onValueChange={handleStatusChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="MobileNo">Mobile No</Label>
                <Input
                  id="MobileNo"
                  name="MobileNo"
                  value={formData.MobileNo}
                  onChange={handleInputChange}
                  type="tel"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="PassExpDays">Password Exp Days *</Label>
                <Input
                  id="PassExpDays"
                  name="PassExpDays"
                  value={formData.PassExpDays}
                  onChange={handleInputChange}
                  required
                  type="number"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <Button type="button" onClick={handleSave} disabled={isEditing}>
                Save
              </Button>
              <Button
                type="button"
                onClick={handleUpdate}
                disabled={!isEditing}
              >
                Update
              </Button>
              <Button type="button" variant="outline" onClick={resetForm}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card className="w-full mx-auto mt-10">
        <CardHeader>
          <CardTitle className="text-center">List of all users</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Action</TableHead>
                <TableHead>User ID</TableHead>
                <TableHead>User Name</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Web menu Access</TableHead>
                <TableHead>HHT menu Access</TableHead>
                <TableHead>Locked Status</TableHead>
                <TableHead>Pass Exp Days</TableHead>
                <TableHead>Plant Code</TableHead>
                <TableHead>Email ID</TableHead>
                <TableHead>Mobile No</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.isArray(users) &&
                users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <Button
                        variant="secondary"
                        onClick={() => handleEdit(user)}
                      >
                        Edit
                      </Button>
                    </TableCell>
                    <TableCell>{user.User_ID}</TableCell>
                    <TableCell>{user.User_Name}</TableCell>
                    <TableCell>{user.User_Role}</TableCell>
                    <TableCell>{user.Web_MenuAccess}</TableCell>
                    <TableCell>{user.HHT_MenuAccess}</TableCell>
                    <TableCell>{user.Locked}</TableCell>
                    <TableCell>{user.PassExpDays}</TableCell>
                    <TableCell>{user.PlantCode}</TableCell>
                    <TableCell>{user.EmailId}</TableCell>
                    <TableCell>{user.MobileNo}</TableCell>
                    <TableCell>{user.User_Status}</TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  );
};

export default UserMaster;
