// utils/exportToExcel.ts

import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

export const exportToExcel = <T extends Record<string, any>>(data: T[], fileName: string): void => {
  const columns = [
    'RowNo',
    'PlantCode',
    'AppType',
    'Activity',
    'Action',
    'OldData',
    'NewData',
    'Remark',
    'UserId',
    'ActivityDate'
  ];
  
  // Create a worksheet
  const ws = XLSX.utils.json_to_sheet(data, { header: columns });

  // Set column widths
  const colWidths = columns.map(col => ({ wch: Math.max(col.length, 15) }));
  ws['!cols'] = colWidths;

  // Create a workbook
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Audit Trail Report');

  // Generate the Excel file
  const excelBuffer = XLSX.write(wb, { bookType: 'xls', type: 'array' });
  const data_blob = new Blob([excelBuffer], { type: 'application/vnd.ms-excel' });

  // Save the file
  saveAs(data_blob, `${fileName}.xls`);
};