import React from "react";
import { Button } from "@mui/material";
import { Download } from "lucide-react";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";

export default function ExportExcelButton({ data, fileName = "exported-data" }) {
    const exportToExcel = async () => {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet("Users");

        // Add custom headers (2 rows)
        worksheet.addRow(["Danh sách người dùng"]).font = { bold: true, size: 16 };
        worksheet.addRow(["Export Date: " + new Date().toLocaleString()]);

        // Add table headers
        worksheet.addRow(["Xã","Họ tên", "Email", "Điện thoại", "Chức vụ", "Username"]);

        // Add data
        data.forEach((user) => {
            worksheet.addRow([
                user.xa?.ten_xa || "",
                user.name || "",
                user.email || "",
                user.phone || "",
                user.position || "",
                user.username || "",
            ]);
        });

        // Apply border and styling to all cells
        worksheet.eachRow((row, rowNumber) => {
            row.eachCell((cell) => {
                cell.border = {
                    top: { style: "thin" },
                    left: { style: "thin" },
                    bottom: { style: "thin" },
                    right: { style: "thin" },
                };
                if (rowNumber <= 3) {
                    cell.font = { bold: true }; // Header rows
                }
                cell.alignment = { vertical: "middle", horizontal: "center" };
            });
        });

        // Auto width columns
        worksheet.columns.forEach((column) => {
            let maxLength = 0;
            column.eachCell({ includeEmpty: true }, (cell) => {
                const length = cell.value ? cell.value.toString().length : 10;
                if (length > maxLength) maxLength = length;
            });
            column.width = maxLength + 6;
        });

        // Export file
        const buffer = await workbook.xlsx.writeBuffer();
        const blob = new Blob([buffer], { type: "application/octet-stream" });
        saveAs(blob, `${fileName}.xlsx`);
    };

    return (
        <Button variant="outlined" startIcon={<Download />} onClick={exportToExcel}>
            Xuất Excel
        </Button>
    );
}
