"use client";
import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import Cookies from 'js-cookie';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import CustomDropdown from '../CustomDropdown';
import getUserID, { BACKEND_URL } from '@/lib/constants';
import { useToast } from "@/components/ui/use-toast";
import { toast as sooner } from "sonner";
import insertAuditTrail from '@/utills/insertAudit';
import { logError } from '@/utills/loggingException';
import { delay } from '@/utills/delay';
import TableSearch from '@/utills/tableSearch';
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination";


interface TableData {
    User_ID: string;
    User_Name: string;
    User_Password: string;
    User_Status: string;
    Locked: string;
    CreatedOn: string;
    Reg_Request: string;
    
}
const AndroidAccess = () => {
    const [userId, setUserId] = useState('');
    const [userName, setUserName] = useState('');
    const [userPassword, setUserPassword] = useState('');
    const [status, setStatus] = useState('Pending');
    const [isUpdateMode, setIsUpdateMode] = useState(false);
    const [data, setData] = useState<TableData[]>([]);
    const { toast } = useToast();


    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const userIdRef = useRef<HTMLInputElement>(null);
    const userNameRef = useRef<HTMLInputElement>(null);
    const userPasswordRef = useRef<HTMLInputElement>(null);
    const statusRef = useRef<HTMLInputElement>(null);


    useEffect(() => {
        const fetchData = async () => {
            fetchTableData();
        }
        fetchData();
    }, [])

    const fetchTableData = async () => {
        try {
            const response = await axios.post(`${BACKEND_URL}/api/admin/android-access-Get-table-data`);
            setData(response.data);

        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message,
                variant: "destructive",
            })
        }
    }


    const handleRowSelect = (row: TableData) => {
        setUserId(row.User_ID);
        setUserName(row.User_Name);
        setUserPassword(row.User_Password);
        setStatus(row.Reg_Request);
        setIsUpdateMode(true);
    }

    const handleCancel = async () => {
        setIsUpdateMode(false);
        setUserId('');
        setUserName('');
        setUserPassword('');
        setStatus('');


    }

    const handleUpdate = async () => {
        try {
            // UserID, UserName, RegRequest, ReqUpdatedBy, ReqUpdateDate
            const data ={
                UserID: userId,
                UserName: userName,
                RegRequest: status,
                ReqUpdatedBy: getUserID(),
                ReqUpdateDate: new Date().toISOString()
            }
            const response = await axios.post(`${BACKEND_URL}/api/admin/android-access-Request-user-upadate`, data)
            const responseData = response.data;
            toast({
                title: "Success",
                description: responseData.Message,
                
            }
            )
            fetchTableData();
            handleCancel();
        } catch (error:any) {
            toast({
                title: "Error",
                description: error.message,
                variant: "destructive",
            }
            )
        }

    }
    // const handleSave = async () => {

    // }


    // Logic for pagination
    const filteredData = useMemo(() => {
        return data.filter(item => {
            const searchableFields: (keyof TableData)[] = ['User_ID', 'User_Name', 'User_Password', 'User_Status', 'Locked', 'CreatedOn', 'Reg_Request'];
            return searchableFields.some(key => {
                const value = item[key];
                return value != null && value.toString().toLowerCase().includes(searchTerm.toLowerCase());
            });
        });
    }, [data, searchTerm]);

    const paginatedData = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return filteredData.slice(startIndex, startIndex + itemsPerPage);
    }, [filteredData, currentPage, itemsPerPage]);

    const totalPages = useMemo(() => Math.ceil(filteredData.length / itemsPerPage), [filteredData, itemsPerPage]);

    const handleSearch = useCallback((term: string) => {
        setSearchTerm(term.trim());
        setCurrentPage(1); // Reset to first page when searching
    }, []);


    const handlePageChange = useCallback((newPage: number) => {
        setCurrentPage(newPage);
    }, []);

    const handleItemsPerPageChange = useCallback((value: string) => {
        setItemsPerPage(Number(value));
        setCurrentPage(1);
    }, [])
    return (
        <>

            <Card className="w-full mx-auto mt-5">
                <CardHeader>
                    <CardTitle>HHT User Access <span className='font-normal text-sm text-muted-foreground'>(* Fields Are Mandatory)</span></CardTitle>
                </CardHeader>
                <CardContent>
                    <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="userId">User ID <span className='text-red-500'>*</span></Label>
                                <Input id="userId" ref={userIdRef} value={userId} onChange={(e) => setUserId(e.target.value)} required disabled={isUpdateMode} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="userName">User Name <span className='text-red-500'>*</span></Label>
                                <Input id="userName" ref={userNameRef} value={userName} onChange={(e) => setUserName(e.target.value)} required disabled={isUpdateMode} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="userPassword">Password <span className='text-red-500'>*</span></Label>
                                <Input type='password' id="userPassword" ref={userPasswordRef} value={userPassword} onChange={(e) => setUserPassword(e.target.value)} required  disabled={isUpdateMode}/>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="status">Status <span className='text-red-500'>*</span></Label>
                                <Select value={status} onValueChange={setStatus}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select status" />
                                    </SelectTrigger>
                                    {/* Approve, Reject, Pending */}
                                    <SelectContent ref={statusRef}>
                                        <SelectItem value="Approve">Approve</SelectItem>
                                        <SelectItem value="Reject">Reject</SelectItem>
                                        <SelectItem value="Pending">Pending</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="flex justify-end space-x-2">
                            {/* <Button onClick={handleSave} >Save</Button> */}
                            <Button  onClick={handleUpdate} disabled={!isUpdateMode}>Update</Button>
                            <Button variant="outline" onClick={handleCancel}>Cancel</Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
            <Card className="w-full mx-auto mt-10">
                <CardContent>
                    <div className="mt-8">
                        <div className="flex justify-between items-center mb-4">
                            <div className="flex items-center space-x-2">
                                <span>Show</span>
                                <Select
                                    defaultValue="10"
                                    value={itemsPerPage.toString()}
                                    onValueChange={handleItemsPerPageChange}
                                >
                                    <SelectTrigger className="w-[70px]">
                                        <SelectValue placeholder={itemsPerPage.toString()} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="5">5</SelectItem>
                                        <SelectItem value="10">10</SelectItem>
                                        <SelectItem value="20">20</SelectItem>
                                    </SelectContent>
                                </Select>
                                <span>entries</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <TableSearch onSearch={handleSearch} />
                            </div>
                        </div>
                        <Table className="text-sm">
                            <TableHeader className="bg-red-50 dark:bg-gray-800">
                                <TableRow>
                                    <TableHead className="text-gray-700 dark:text-gray-300">Select</TableHead>
                                    <TableHead className="text-gray-700 dark:text-gray-300">User ID</TableHead>
                                    <TableHead className="text-gray-700 dark:text-gray-300">User Name</TableHead>
                                    <TableHead className="text-gray-700 dark:text-gray-300">User Password</TableHead>
                                    <TableHead className="text-gray-700 dark:text-gray-300">User Status</TableHead>
                                    <TableHead className="text-gray-700 dark:text-gray-300">Locked</TableHead>
                                    <TableHead className="text-gray-700 dark:text-gray-300">Current Status</TableHead>
                                    <TableHead className="text-gray-700 dark:text-gray-300">Created On</TableHead>
                                    {/* <TableHead className="text-gray-700 dark:text-gray-300">Reg Request</TableHead> */}
                                </TableRow>
                            </TableHeader>
                            <TableBody >
                                {Array.isArray(paginatedData) && paginatedData.length > 0 ? (
                                    paginatedData.map((row, index) => (
                                        <TableRow key={index}>
                                            <TableCell>
                                            <Button size='sm' variant='outline' onClick={() => handleRowSelect(row)}>Select</Button>
                                            </TableCell>
                                            <TableCell>{row.User_ID}</TableCell>
                                            <TableCell>{row.User_Name}</TableCell>
                                            <TableCell>{row.User_Password}</TableCell>
                                            <TableCell>{row.User_Status}</TableCell>
                                            <TableCell>{row.Locked}</TableCell>
                                            <TableCell>{row.Reg_Request}</TableCell>
                                            <TableCell>{row.CreatedOn ? new Date(row.CreatedOn).toLocaleDateString() : 'N/A'}</TableCell>
                                            {/* <TableCell>{row.Reg_Request}</TableCell> */}
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={12} className="text-center">
                                            No data available
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                        {/* Pagination Component */}
                        <div className="flex justify-between items-center text-sm md:text-md mt-4">
                            <div>
                                {filteredData.length > 0
                                    ? `Showing ${((currentPage - 1) * itemsPerPage) + 1} to ${Math.min(currentPage * itemsPerPage, filteredData.length)} of ${filteredData.length} entries`
                                    : 'No entries to show'}
                            </div>
                            {filteredData.length > 0 && (
                                <Pagination>
                                    <PaginationContent>
                                        <PaginationItem>
                                            <PaginationPrevious
                                                onClick={() => handlePageChange(currentPage - 1)}
                                                className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                                            />
                                        </PaginationItem>
                                        {[...Array(totalPages)].map((_, index) => {
                                            const pageNumber = index + 1;
                                            if (
                                                pageNumber === 1 ||
                                                pageNumber === totalPages ||
                                                (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1)
                                            ) {
                                                return (
                                                    <PaginationItem key={pageNumber}>
                                                        <PaginationLink
                                                            isActive={pageNumber === currentPage}
                                                            onClick={() => handlePageChange(pageNumber)}
                                                        >
                                                            {pageNumber}
                                                        </PaginationLink>
                                                    </PaginationItem>
                                                );
                                            } else if (
                                                pageNumber === currentPage - 2 ||
                                                pageNumber === currentPage + 2
                                            ) {
                                                return <PaginationEllipsis key={pageNumber} />;
                                            }
                                            return null;
                                        })}
                                        <PaginationItem>
                                            <PaginationNext
                                                onClick={() => handlePageChange(currentPage + 1)}
                                                className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                                            />
                                        </PaginationItem>
                                    </PaginationContent>
                                </Pagination>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>


        </>
    )
}

export default AndroidAccess