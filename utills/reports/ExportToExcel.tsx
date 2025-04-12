import React from 'react';
import * as XLSX from 'xlsx';
import { Button } from '@/components/ui/button';
import { FaFileExcel } from 'react-icons/fa';

interface ExportToExcelProps {
  data: any[];
  fileName: string;
}

const ExportToExcel: React.FC<ExportToExcelProps> = ({ data, fileName }) => {
  const handleExport = () => {
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
    XLSX.writeFile(wb, `${fileName}.xlsx`);
  };

  return (
    <Button disabled={data.length===0} variant="outline" onClick={handleExport}>
      Export To Excel <FaFileExcel size={17} className='ml-2 text-green-500' />
    </Button>
  );
};

export default ExportToExcel;
