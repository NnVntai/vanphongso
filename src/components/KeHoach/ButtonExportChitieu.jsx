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
// const EDITABLE_RANGES = [
//     'D8:D9','D11:D14','D16:D19','D21:D24','D26:D29','D31:D39','D41:D44',
//     'D46:D49','D51:D54','D56:D59','D61:D64','D66:D69','D71:D74','D76:D79',
//     'D81:D84', 'D86:D89', 'D91:D94', 'D96:D99', 'D101:D104', 'D106:D109',
//     'D111:D114', 'D116:D119', 'D121:D124', 'D126:D129', 'D131:D134', 'D136:D139',
//     'D141:D144', 'D146:D149', 'D151:D154', 'D156:D159', 'D161:D164', 'D166:D169', 'D171:D173', 'D175:D206',
//     'D208:D209'
// ];
const EDITABLE_RANGES = [
    "D16:D19", "D21:D24", "D26:D29", "D31:D39", "D46:D49", "D51:D54",
    "D56:D59", "D61:D64", "D71:D74", "D76:D79", "D86:D89", "D91:D94", "D96:D99",
    "D106:D109", "D116:D119", "D121:D124","D126:D129", "D131:D134", "D136:D139",
    "D141:D144", "D146:D149", "D151:D154", "D156:D159", "D161:D164", "D166:D169",
    "D171:D173", "D177:D180", "D182", "D184:D185", "D189:D192", "D194:D197", "D200:D202",
    "D204:D206", "D208:D209"
];


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
// const setMergeCell = (sheet, startRow, endRow, startCol, endCol) => {
//     for (let row = startRow; row <= endRow; row++) {
//         for (let col = startCol; col <= endCol; col++) {
//
//             sheet.mergeCells(`${colStart}5:${colStart}6`);
//         }
//     }
// };
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
const unlockEditableRanges = (worksheet) => {
    EDITABLE_RANGES.forEach(range => {
        try {
            if (range.includes(':')) {
                // Xử lý vùng nhiều ô
                const [start, end] = range.split(':');
                const startCol = start.replace(/\d+/g, '');
                const startRow = parseInt(start.replace(/\D+/g, ''));
                const endCol = end.replace(/\d+/g, '');
                const endRow = parseInt(end.replace(/\D+/g, ''));

                // Kiểm tra tính hợp lệ của dải ô
                if (isNaN(startRow) || isNaN(endRow)) {
                    console.warn(`Invalid range format: ${range}`);
                    return;
                }

                for (let row = startRow; row <= endRow; row++) {
                    const cellAddress = `${startCol}${row}`;
                    try {
                        const cell = worksheet.getCell(cellAddress);
                        cell.protection = { locked: false };
                    } catch (e) {
                        console.warn(`Không tìm thấy ô ${cellAddress}`);
                    }
                }
            } else {
                // Xử lý ô đơn lẻ
                try {
                    const cell = worksheet.getCell(range);
                    cell.protection = { locked: false };
                } catch (e) {
                    console.warn(`Không tìm thấy ô ${range}`);
                }
            }
        } catch (e) {
            console.error(`Lỗi khi xử lý range ${range}:`, e);
        }
    });
};
const MainPage = ({ loaibaocaoId, year, month, quarter, week, number }) => {
    // const [tableData, setTableData] = useState([]);

    // Fetch data from API and export to Excel
    const exportToExcelFile = async () => {
        try {
            const response = await api.get(`/kehoach2/${year}`, {

            });

            const tables = [];
            const rawData = response.data.data;
            // console.log(rawData);
            let currentGroup = [];
            // console.log(rawData);
            // Group data based on 'xa' names
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
                let headerRow03 = [`(Năm ${year})`];
                let headerRow04 = [];
                let headerRow05 = [];
                headerRow04=[1, 2, 3, 4];
                headerRow05=['STT', 'Tên chỉ tiêu', 'Đơn vị', 'Lũy kế cùng kỳ năm trước'];
                data.push(headerRow01, headerRow02, headerRow03, headerRow04, headerRow05);
                group.forEach((ct, index) => {
                    const row = [
                        ct.ma_chitieu,
                        ct.ten_chitieu,
                        ct.dvt,

                        (formularjson[index + 3] && formularjson[index + 3].formula) ? `${replaceColumnLetter(evaluateRelativeFormula(formularjson[index + 3].formula,2), "E", getExcelAlpha(4))} ` :
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
            colorbackgroundexcel(worksheet, 4, 209, 1, 4);
            setBorderForRange(worksheet, 4, 209, 1, 4);
            aligRightForRange(worksheet,7,209,4,4);
            aligLeftForRange(worksheet,7,209,2,2);
            aligRightForRange(worksheet,7,209,1,1);
            setColumnWidthsInRange(worksheet, 1,1,5);
            setColumnWidthsInRange(worksheet, 3,4,10);
            setColumnWidthsInRange(worksheet, 2,2,20);
            setColumnWidthsInRange(worksheet, 4,4,10);
            EDITABLE_RANGES.forEach(range => {
                const parts = range.split(':');
                const start = parts[0];
                const end = parts[1] || parts[0]; // Nếu không có phần sau thì gán bằng start

                const startRow = parseInt(start.replace(/[^0-9]/g, ''), 10);
                const endRow = parseInt(end.replace(/[^0-9]/g, ''), 10);

                for (let row = startRow; row <= endRow; row++) {
                    worksheet.getCell(`D${row}`).fill = null;
                }
            });

            unlockEditableRanges(worksheet);
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
