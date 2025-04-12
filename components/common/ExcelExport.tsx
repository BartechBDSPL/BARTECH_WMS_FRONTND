import { Button } from "@/components/ui/button";
import { FaFileExcel } from "react-icons/fa";
import * as XLSX from 'xlsx';

interface ExcelExportProps {
  data: Array<Record<string, any>>;
  headers: Record<string, string>;
  filename: string;
}

const ExcelExport: React.FC<ExcelExportProps> = ({ data, headers, filename }) => {
  const exportToExcel = () => {
    const exportData = data.map(item => {
      const row: Record<string, any> = {};
      Object.entries(headers).forEach(([key, header]) => {
        row[header] = item[key];
      });
      return row;
    });

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(exportData);
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
    XLSX.writeFile(wb, `${filename}.xlsx`);
  };

  return (
    <Button onClick={exportToExcel} variant="outline">
      Export to Excel <FaFileExcel size={17} className='ml-2 text-green-500' />
    </Button>
  );
};

export default ExcelExport;
