import React, { useState } from 'react';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import api from '@/config';
import formularjson from '/src/utils/formular.json';
import khjson from '/src/utils/kh.json';
import CKNNjson from '/src/utils/CKNN.json';
import { Button } from "@mui/material";
import FileDownloadIcon from '@mui/icons-material/FileDownload';

const getExcelAlpha = (n) => {
    let result = '';
    while (n > 0) {
        const mod = (n - 1) % 26;
        result = String.fromCharCode(65 + mod) + result;
        n = Math.floor((n - mod) / 26);
    }
    return result;
};
const replaceColumnLetter = (formula, fromCol, toCol) => {
    const regex = new RegExp(`\\b${fromCol}(\\d+)`, 'g');
    return formula.replace(regex, `${toCol}$1`);
};
const setBorderForRange = (sheet, startRow, endRow, startCol, endCol) => {
    for (let row = startRow; row <= endRow; row++) {
        for (let col = startCol; col <= endCol; col++) {
            const cell = sheet.getCell(row, col);
            cell.border = {
                top: { style: 'thin' },
                left: { style: 'thin' },
                bottom: { style: 'thin' },
                right: { style: 'thin' },
            };
        }
    }
};
const rgbToARGB = (r, g, b, a = 255) => {
    const toHex = (v) => v.toString(16).padStart(2, '0').toUpperCase();
    return `${toHex(a)}${toHex(r)}${toHex(g)}${toHex(b)}`;
};
const aligRightForRange = (sheet, startRow, endRow, startCol, endCol) => {
    for (let row = startRow; row <= endRow; row++) {
        for (let col = startCol; col <= endCol; col++) {
            sheet.getCell(row, col).alignment = {
                horizontal: 'right',
                vertical: 'middle',
                wrapText: true
            };
        }
    }
};
const colorbackgroundexcel=(worksheet, startRow, endRow, startCol, endCol) => {
    for (let row = startRow; row <= endRow; row++) {
        for (let col = startCol; col <= endCol; col++) { // A=1, Z=26
            const cell = worksheet.getCell(row, col);
            cell.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: rgbToARGB(218,238,243) } // xám nhạt = giả lập bị khóa
            };
        }
    }
}
const aligLeftForRange = (sheet, startRow, endRow, startCol, endCol) => {
    for (let row = startRow; row <= endRow; row++) {
        for (let col = startCol; col <= endCol; col++) {
            sheet.getCell(row, col).alignment = {
                horizontal: 'left',
                vertical: 'middle',
                wrapText: true
            };
        }
    }
};
const evaluateRelativeFormula = (formula, number) => {
    return formula.replace(/([A-Z]+)(\d+)/g, (match, col, row) => {
        const newRow = parseInt(row, 10) + number;
        return `${col}${newRow}`;
    });
};
const setColumnWidthsInRange = (sheet, startCol, endCol, width) => {
    for (let col = startCol; col <= endCol; col++) {
        sheet.getColumn(col).width = width;
    }
};
const columnLetterToNumber = (letter) => {
    let col = 0;
    for (let i = 0; i < letter.length; i++) {
        col *= 26;
        col += letter.charCodeAt(i) - 64; // A = 1
    }
    return col;
};
const columnNumberToLetter = (num) => {
    let letters = '';
    while (num > 0) {
        let rem = (num - 1) % 26;
        letters = String.fromCharCode(65 + rem) + letters;
        num = Math.floor((num - 1) / 26);
    }
    return letters;
};
const MainPage = ({ loaibaocaoId, year, month, quarter, week, number }) => {
    // const [tableData, setTableData] = useState([]);

    // Fetch data from API and export to Excel
    const exportToExcelFile = async () => {
        try {
            const response = await api.post(`/kehoach-current`, {year,id_xa:JSON.parse(localStorage.getItem("username")).id_xa });
            const tables = [];
            const rawData = response.data.data;
            // console.log(rawData);
            let currentGroup = [];
            for (const chitieu of rawData) {
                currentGroup.push(chitieu);
            }
            if (currentGroup.length > 0) tables.push(currentGroup);
            // Prepare data for export
            const preparedData = tables.map((group, idx) => {
                // const xaList = group[0].xa.map((x) => x.ten_xa);
                const data = [];
                const headerRow01 = [];
                const headerRow02 = ['KẾ HOẠCH BÁO CÁO', '', ''];
                const headerRow03 = ['Đơn vị '+JSON.parse(localStorage.getItem("username")).xa?.ten_xa, '', ''];
                let headerRow04 = [`(Năm ${year})`];
                let headerRow05 = [];
                let headerRow06 = [];
                headerRow05=[1, 2, 3, 4];
                headerRow06=['STT', 'Tên chỉ tiêu', 'Đơn vị', 'Lũy kế cùng kỳ năm trước'];
                data.push(headerRow01, headerRow02, headerRow03, headerRow04, headerRow05,headerRow06);
                group.forEach((ct, index) => {
                    const row = [
                        ct.ma_chitieu,
                        ct.ten_chitieu,
                        ct.dvt,
                        (formularjson[index ] && formularjson[index ].formula) ? `${replaceColumnLetter(evaluateRelativeFormula(formularjson[index ].formula,6), "E", getExcelAlpha(4))} ` :
                            ct.kehoachs[0]?.kehoach??null,
                    ];
                    row._id=ct.id;
                    row._id_kehoach=ct.kehoachs[0]?.id??"";
                    row._active=ct.is_active;
                    data.push(row);
                });
                return data;
            });
            // setTableData(preparedData);  // Update tableData with the prepared data

            // Now that the data is ready, export it to Excel
            if (!preparedData || preparedData.length === 0 || !preparedData[0]) {
                console.error("Table data is not available.");
                return;
            }
            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet('Sheet 1');
            preparedData[0].forEach((row, rowIndex) => {
                row.forEach((cell, colIndex) => {
                    // console.log(rowIndex, colIndex);
                    const excelCell = worksheet.getCell(rowIndex+1, colIndex+1);  // Get the specific cell
                    // Check if the cell is a formula (starts with '='), assign it to .formula property
                    if (typeof cell === 'string' && cell.startsWith('=')) {
                        // console.log(excelCell.formula);
                        excelCell.value={ formula: cell};
                        // excelCell.formula = cell; // Set formula directly if it's a valid formula string
                    } else if (typeof cell !== 'object') {
                        // If the cell is not an object (i.e., a normal value), assign the value
                        excelCell.value = cell  ;// Otherwise, set the regular value
                    }
                    if (rowIndex >= 5 && colIndex === 0) {

                        const id = row._id;
                        if (id) {
                            const idCell = worksheet.getCell(`E${rowIndex + 1}`);
                            idCell.value = id;
                            const activetrue = worksheet.getCell(`F${rowIndex + 1}`);
                            activetrue.value = row._active;
                            const id_kehoach = worksheet.getCell(`G${rowIndex + 1}`);
                            id_kehoach.value = row._id_kehoach;
                        }

                    }
                });
            });

            worksheet.columns.forEach((column) => {
                column.alignment = {
                    vertical: 'middle',
                    horizontal: 'center',
                    wrapText: true,
                };
                column.width = 15;
            });
            // merger rows
            worksheet.mergeCells(`${getExcelAlpha(1)}2:${getExcelAlpha(4)}2`);
            worksheet.mergeCells(`${getExcelAlpha(1)}3:${getExcelAlpha(4)}3`);
            worksheet.mergeCells(`${getExcelAlpha(1)}4:${getExcelAlpha(4)}4`);
            colorbackgroundexcel(worksheet, 5, 265, 1, 4);
            setBorderForRange(worksheet, 5, 265, 1, 4);
            aligRightForRange(worksheet,7,265,4,4);
            aligLeftForRange(worksheet,7,265,2,2);
            aligRightForRange(worksheet,7,265,1,1);
            setColumnWidthsInRange(worksheet, 1,1,7);
            setColumnWidthsInRange(worksheet, 3,4,20);
            setColumnWidthsInRange(worksheet, 2,2,30);
            setColumnWidthsInRange(worksheet, 4,4,20);

            const targetColumns = ["D","F"]; // các cột bạn muốn xử lý thêm
            targetColumns.forEach(colLetter => {
                // Lấy số thứ tự cột
                const startCol = columnLetterToNumber(colLetter);
                const endCol = startCol; // chỉ 1 cột mỗi lần (nếu bạn muốn range, có thể thay đổi)
                for (let rowIndex = 0; rowIndex < preparedData[0].length; rowIndex++) {
                    const excelRow = rowIndex + 1;
                    const rowData = preparedData[0][rowIndex];
                    for (let col = startCol; col <= endCol; col++) {
                        const cellLetter = columnNumberToLetter(col);
                        const cell = worksheet.getCell(`${cellLetter}${excelRow}`);
                        if (rowData.is_active === true || rowData._active === true) {
                            // ✅ Cho phép chỉnh sửa
                            cell.fill = null; // xoá màu cũ
                            cell.protection = { locked: false }; // cho phép edit
                        } else {
                            // ❌ Không active: khoá lại
                            cell.protection = { locked: true };
                        }
                    }
                }
            });
            worksheet.getColumn('E').hidden = true;
            worksheet.getColumn('F').hidden = true;
            worksheet.getColumn('G').hidden = true;
            worksheet.protect('password123', {
                selectLockedCells: true,
                selectUnlockedCells: true,
                formatCells: false,
                formatColumns: false,
                formatRows: false,
                insertColumns: false,
                insertRows: false,
                insertHyperlinks: false,
                deleteColumns: false,
                deleteRows: false,
                sort: false,
                autoFilter: false,
                pivotTables: false
            });
            // Save the file as a blob and prompt download
            const buffer = await workbook.xlsx.writeBuffer();
            saveAs(new Blob([buffer]), 'report.xlsx');
        } catch (error) {
            console.error("Error fetching data for report:", error);
        }
    };
    return (
        <Button
            onClick={exportToExcelFile}
            variant="contained"
            color="primary"
            startIcon={<FileDownloadIcon />}
            // sx={{ mt: 2 }}
        >
            Tải file Báo cáo
        </Button>
    );
};

export default MainPage;
