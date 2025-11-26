import React, { useState } from 'react';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import api from '@/config';
import formularjson from '/src/utils/formular.json';
import khjson from '/src/utils/kh.json';
import CKNNjson from '/src/utils/CKNN.json';
import { Button ,Box,Typography} from "@mui/material";
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
      const [loadingGlobal, setLoadingGlobal] = useState(false);
    // Fetch data from API and export to Excel
    const exportToExcelFile = async () => {
        try {
            setLoadingGlobal(true);
            const response = await api.get(`/data-targets`);
            // console.log(response)
            const tables = [];
            const rawData = response.data.data;
            // console.log(rawData);
            let currentGroup = [];
            for (const chitieu of rawData) {
                currentGroup.push(chitieu);
            }
            if (currentGroup.length > 0) tables.push(currentGroup);
            // Prepare data for export
            // sheet 1 
              const sheetConfigs = [
                { name: "Công thức năm, tháng, quý", formulaTitle: "Công thức năm, tháng, quý" },
                { name: "Công thức tuần", formulaTitle: "Công thức tuần" },
                { name: "Công thức kế hoạch năm, tháng, quý", formulaTitle: "Công thức kế hoạch năm, tháng, quý" },
                { name: "Công thức kế hoạch tuần", formulaTitle: "Công thức kế hoạch tuần" },
            ]; 
            const workbook = new ExcelJS.Workbook();
    
            for (const [index, config] of sheetConfigs.entries()) {

                const worksheet = workbook.addWorksheet(config.name);
                // if()
                if(index===0)
                {
                   const preparedData = tables.map((group, idx) => {
                        // const xaList = group[0].xa.map((x) => x.ten_xa);
                        const data = [];
                        const headerRow01 = [];
                        const headerRow04 = ['Cập nhật công thức', '', ''];
                        const headerRow05 = ['Người cập nhật '+JSON.parse(localStorage.getItem("username")).name, '', ''];
                        let headerRow06 = ['Cập nhật các công thức vào ô bên dưới của báo cáo tháng, năm, quý, báo cáo 6 tháng, báo cáo 9 tháng'];
                        let headerRow07=[1, 2, 3, 4];
                        let headerRow08=['STT', 'Tên chỉ tiêu', 'Đơn vị', `Công thức`];
                        data.push(headerRow01, headerRow01, headerRow01, headerRow04, headerRow05,headerRow06,headerRow07,headerRow08);
                        group.forEach((ct, index) => {
                            const row = [
                                ct.ma_chitieu,
                                ct.ten_chitieu,
                                ct.dvt,
                                // (formularjson[index ] && formularjson[index ].formula) ? `${replaceColumnLetter(evaluateRelativeFormula(formularjson[index ].formula,6), "E", getExcelAlpha(4))} ` :
                                //     ct.kehoachs[0]?.kehoach??null,
                            ];
                            row._id=ct.id;
                            // row._id_kehoach=ct.kehoachs[0]?.id??"";
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
                    worksheet.mergeCells(`${getExcelAlpha(1)}1:${getExcelAlpha(4)}1`);
                    worksheet.mergeCells(`${getExcelAlpha(1)}5:${getExcelAlpha(4)}5`);
                    worksheet.mergeCells(`${getExcelAlpha(1)}6:${getExcelAlpha(4)}6`);
                    worksheet.mergeCells(`${getExcelAlpha(1)}2:${getExcelAlpha(4)}2`);
                    worksheet.mergeCells(`${getExcelAlpha(1)}3:${getExcelAlpha(4)}3`);
                    worksheet.mergeCells(`${getExcelAlpha(1)}4:${getExcelAlpha(4)}4`);
                    colorbackgroundexcel(worksheet, 1, preparedData[0].length, 1, 4);
                    setBorderForRange(worksheet, 7, preparedData[0].length, 1, 4);
                    aligRightForRange(worksheet,9,preparedData[0].length,4,4);
                    aligLeftForRange(worksheet,7,preparedData[0].length,2,2);
                    aligRightForRange(worksheet,7,preparedData[0].length,1,1);
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
                            // const rowData = preparedData[0][rowIndex];
                            for (let col = startCol; col <= endCol; col++) {
                                const cellLetter = columnNumberToLetter(col);
                                const cell = worksheet.getCell(`${cellLetter}${excelRow}`);
                                // if (rowData.is_active === true || rowData._active === true) {
                                //     // ✅ Cho phép chỉnh sửa
                                //     cell.fill = null; // xoá màu cũ
                                //     cell.protection = { locked: false }; // cho phép edit
                                // } else {
                                //     // ❌ Không active: khoá lại
                                //     cell.protection = { locked: true };
                                // }
                                if(rowIndex>7)
                                {
                                    cell.fill = null; // xoá màu cũ
                                    cell.protection = { locked: false }; // cho phép edit
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
                }else if(index===1){
                     const preparedData = tables.map((group, idx) => {
                        // const xaList = group[0].xa.map((x) => x.ten_xa);
                        const data = [];
                        const headerRow01 = [];
                        const headerRow04 = ['Cập nhật công thức tuần', '', ''];
                        const headerRow05 = ['Người cập nhật '+JSON.parse(localStorage.getItem("username")).name, '', ''];
                        let headerRow06 = ['Cập nhật các công thức vào ô bên dưới của báo cáo tuần'];
                        let headerRow07=[1, 2, 3, 4];
                        let headerRow08=['STT', 'Tên chỉ tiêu', 'Đơn vị', `Công thức`];
                        data.push(headerRow01, headerRow01, headerRow01, headerRow04, headerRow05,headerRow06,headerRow07,headerRow08);
                        group.forEach((ct, index) => {
                            if(ct.is_week===true)
                            {
                                const row = [
                                    ct.ma_chitieu,
                                    ct.ten_chitieu,
                                    ct.dvt,
                                    // (formularjson[index ] && formularjson[index ].formula) ? `${replaceColumnLetter(evaluateRelativeFormula(formularjson[index ].formula,6), "E", getExcelAlpha(4))} ` :
                                    //     ct.kehoachs[0]?.kehoach??null,
                                ];
                                row._id=ct.id;
                                // row._id_kehoach=ct.kehoachs[0]?.id??"";
                                row._active=ct.is_active;
                                data.push(row);
                            }
                        });
                        return data;
                    });
                    // setTableData(preparedData);  // Update tableData with the prepared data
                    // Now that the data is ready, export it to Excel
                    if (!preparedData || preparedData.length === 0 || !preparedData[0]) {
                        console.error("Table data is not available.");
                        return;
                    }
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
                    worksheet.mergeCells(`${getExcelAlpha(1)}1:${getExcelAlpha(4)}1`);
                    worksheet.mergeCells(`${getExcelAlpha(1)}5:${getExcelAlpha(4)}5`);
                    worksheet.mergeCells(`${getExcelAlpha(1)}6:${getExcelAlpha(4)}6`);
                    worksheet.mergeCells(`${getExcelAlpha(1)}2:${getExcelAlpha(4)}2`);
                    worksheet.mergeCells(`${getExcelAlpha(1)}3:${getExcelAlpha(4)}3`);
                    worksheet.mergeCells(`${getExcelAlpha(1)}4:${getExcelAlpha(4)}4`);
                    colorbackgroundexcel(worksheet, 1, preparedData[0].length, 1, 4);
                    setBorderForRange(worksheet, 7, preparedData[0].length, 1, 4);
                    aligRightForRange(worksheet,9,preparedData[0].length,4,4);
                    aligLeftForRange(worksheet,7,preparedData[0].length,2,2);
                    aligRightForRange(worksheet,7,preparedData[0].length,1,1);
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
                            // const rowData = preparedData[0][rowIndex];
                            for (let col = startCol; col <= endCol; col++) {
                                const cellLetter = columnNumberToLetter(col);
                                const cell = worksheet.getCell(`${cellLetter}${excelRow}`);
                                // if (rowData.is_active === true || rowData._active === true) {
                                //     // ✅ Cho phép chỉnh sửa
                                //     cell.fill = null; // xoá màu cũ
                                //     cell.protection = { locked: false }; // cho phép edit
                                // } else {
                                //     // ❌ Không active: khoá lại
                                //     cell.protection = { locked: true };
                                // }
                                if(rowIndex>7)
                                {
                                    cell.fill = null; // xoá màu cũ
                                    cell.protection = { locked: false }; // cho phép edit
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
                }else if(index===2){
                    
                     const preparedData = tables.map((group, idx) => {
                        // const xaList = group[0].xa.map((x) => x.ten_xa);
                        
                        const data = [];
                        const headerRow01 = [];
                        let headerRow02 = [""];
                        let headerRow03 = [];
                        let headerRow04 = [];
                        let headerRow05 = [];
                        let headerRow06=[];
                        headerRow02=[`BÁO CÁO ƯỚC KẾT QUẢ SẢN XUẤT NÔNG, LÂM, NGƯ NGHIỆP Tháng`, '', '']
                        headerRow04=[1, 2, 3, 4, 5, 6, 7, 8, 9];
                        headerRow05=['STT', 'Tên chỉ tiêu', 'Đơn vị', 'Lũy kế cùng kỳ năm trước', 'Năm báo cáo', '', '', 'So sánh (%)', ''];
                        headerRow06 = ['', '', '', '', 'Kế hoạch', 'Thực hiện trong tháng', 'Lũy kế năm báo cáo', 'KH', 'CKNN'];
                        data.push(headerRow01,headerRow01,headerRow01, headerRow02, headerRow03, headerRow04, headerRow05, headerRow06);
                        group.forEach((ct, index) => {
                            const row = [
                                ct.ma_chitieu,
                                ct.ten_chitieu,
                                ct.dvt,
                                // (formularjson[index ] && formularjson[index ].formula) ? `${replaceColumnLetter(evaluateRelativeFormula(formularjson[index ].formula,6), "E", getExcelAlpha(4))} ` :
                                //     ct.kehoachs[0]?.kehoach??null,
                            ];
                            row._id=ct.id;
                            // row._id_kehoach=ct.kehoachs[0]?.id??"";
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
                                    const idCell = worksheet.getCell(`J${rowIndex + 1}`);
                                    idCell.value = id;
                                    const activetrue = worksheet.getCell(`K${rowIndex + 1}`);
                                    activetrue.value = row._active;
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
                    // merger rows\
                 worksheet.mergeCells(`${getExcelAlpha(1)}7:${getExcelAlpha(1)}8`);
                worksheet.mergeCells(`${getExcelAlpha(2)}7:${getExcelAlpha(2)}8`);
                worksheet.mergeCells(`${getExcelAlpha(3)}7:${getExcelAlpha(3)}8`);
                worksheet.mergeCells(`${getExcelAlpha(4)}7:${getExcelAlpha(4)}8`);
                worksheet.mergeCells(`${getExcelAlpha(1)}4:${getExcelAlpha(9)}4`);
                worksheet.mergeCells(`${getExcelAlpha(5)}7:${getExcelAlpha(7)}7`);
                worksheet.mergeCells(`${getExcelAlpha(8)}7:${getExcelAlpha(9)}7`);
                setBorderForRange(worksheet, 4, preparedData[0].length, 1, preparedData[0][6].length);
                aligRightForRange(worksheet,7,preparedData[0].length,4,preparedData[0][6].length);
                aligLeftForRange(worksheet,7,preparedData[0].length,2,2);
                aligRightForRange(worksheet,7,preparedData[0].length,1,1);
                setColumnWidthsInRange(worksheet, 1,1,5);
                setColumnWidthsInRange(worksheet, 3,3,6);
                setColumnWidthsInRange(worksheet, 2,2,18);
                setColumnWidthsInRange(worksheet, 4,111,10);
                colorbackgroundexcel(worksheet,1,preparedData[0].length,1,preparedData[0][6].length)
                    const targetColumns = ["D","E","G","H","I"]; // các cột bạn muốn xử lý thêm
                    targetColumns.forEach(colLetter => {
                        // Lấy số thứ tự cột
                        const startCol = columnLetterToNumber(colLetter);
                        const endCol = startCol; // chỉ 1 cột mỗi lần (nếu bạn muốn range, có thể thay đổi)
                        for (let rowIndex = 0; rowIndex < preparedData[0].length; rowIndex++) {
                            const excelRow = rowIndex + 1;
                            // const rowData = preparedData[0][rowIndex];
                            for (let col = startCol; col <= endCol; col++) {
                                const cellLetter = columnNumberToLetter(col);
                                const cell = worksheet.getCell(`${cellLetter}${excelRow}`);
                                // if (rowData.is_active === true || rowData._active === true) {
                                //     // ✅ Cho phép chỉnh sửa
                                //     cell.fill = null; // xoá màu cũ
                                //     cell.protection = { locked: false }; // cho phép edit
                                // } else {
                                //     // ❌ Không active: khoá lại
                                //     cell.protection = { locked: true };
                                // }
                                if(rowIndex>7)
                                {
                                    cell.fill = null; // xoá màu cũ
                                    cell.protection = { locked: false }; // cho phép edit
                                }
                            }
                        }
                    });
                    worksheet.getColumn('J').hidden = true;
                    worksheet.getColumn('K').hidden = true;
                    // worksheet.getColumn('G').hidden = true;
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
                }else if(index===3){
                     const preparedData = tables.map((group, idx) => {
                        // const xaList = group[0].xa.map((x) => x.ten_xa);
                        
                        const data = [];
                        const headerRow01 = [];
                        let headerRow02 = [""];
                        let headerRow03 = [];
                        let headerRow04 = [];
                        let headerRow05 = [];
                        let headerRow06=[];
                        headerRow02=[`BÁO CÁO ƯỚC KẾT QUẢ SẢN XUẤT NÔNG, LÂM, NGƯ NGHIỆP TUẦN`, '', '']
                        headerRow04=[1, 2, 3, 4, 5, 6, 7, 8, 9];
                        headerRow05=['STT', 'Tên chỉ tiêu', 'Đơn vị', 'Lũy kế cùng kỳ năm trước', 'Năm báo cáo', '', '', 'So sánh (%)', ''];
                        headerRow06 = ['', '', '', '', 'Kế hoạch', 'Thực hiện trong Tuần', 'Lũy kế năm báo cáo', 'KH', 'CKNN'];
                        data.push(headerRow01,headerRow01,headerRow01, headerRow02, headerRow03, headerRow04, headerRow05, headerRow06);
                        group.forEach((ct, index) => {
                            if(ct.is_week)
                            {
                                const row = [
                                    ct.ma_chitieu,
                                    ct.ten_chitieu,
                                    ct.dvt,
                                    // (formularjson[index ] && formularjson[index ].formula) ? `${replaceColumnLetter(evaluateRelativeFormula(formularjson[index ].formula,6), "E", getExcelAlpha(4))} ` :
                                    //     ct.kehoachs[0]?.kehoach??null,
                                ];
                                row._id=ct.id;
                                // row._id_kehoach=ct.kehoachs[0]?.id??"";
                                row._active=ct.is_active;
                                data.push(row);
                            }
                        });
                        return data;
                    });
                    // setTableData(preparedData);  // Update tableData with the prepared data
                    // Now that the data is ready, export it to Excel
                    if (!preparedData || preparedData.length === 0 || !preparedData[0]) {
                        console.error("Table data is not available.");
                        return;
                    }
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
                                    const idCell = worksheet.getCell(`J${rowIndex + 1}`);
                                    idCell.value = id;
                                    const activetrue = worksheet.getCell(`K${rowIndex + 1}`);
                                    activetrue.value = row._active;
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
                    // merger rows\
                    worksheet.mergeCells(`${getExcelAlpha(1)}7:${getExcelAlpha(1)}8`);
                    worksheet.mergeCells(`${getExcelAlpha(2)}7:${getExcelAlpha(2)}8`);
                    worksheet.mergeCells(`${getExcelAlpha(3)}7:${getExcelAlpha(3)}8`);
                    worksheet.mergeCells(`${getExcelAlpha(4)}7:${getExcelAlpha(4)}8`);
                    worksheet.mergeCells(`${getExcelAlpha(1)}4:${getExcelAlpha(9)}4`);
                    worksheet.mergeCells(`${getExcelAlpha(5)}7:${getExcelAlpha(7)}7`);
                    worksheet.mergeCells(`${getExcelAlpha(8)}7:${getExcelAlpha(9)}7`);
                    setBorderForRange(worksheet, 4, preparedData[0].length, 1, preparedData[0][6].length);
                    aligRightForRange(worksheet,7,preparedData[0].length,4,preparedData[0][6].length);
                    aligLeftForRange(worksheet,7,preparedData[0].length,2,2);
                    aligRightForRange(worksheet,7,preparedData[0].length,1,1);
                    setColumnWidthsInRange(worksheet, 1,1,5);
                    setColumnWidthsInRange(worksheet, 3,3,6);
                    setColumnWidthsInRange(worksheet, 2,2,18);
                    colorbackgroundexcel(worksheet,1,preparedData[0].length,1,preparedData[0][6].length)
                    const targetColumns = ["D","E","G","H","I"]; // các cột bạn muốn xử lý thêm
                    targetColumns.forEach(colLetter => {
                        // Lấy số thứ tự cột
                        const startCol = columnLetterToNumber(colLetter);
                        const endCol = startCol; // chỉ 1 cột mỗi lần (nếu bạn muốn range, có thể thay đổi)
                        for (let rowIndex = 0; rowIndex < preparedData[0].length; rowIndex++) {
                            const excelRow = rowIndex + 1;
                            // const rowData = preparedData[0][rowIndex];
                            for (let col = startCol; col <= endCol; col++) {
                                const cellLetter = columnNumberToLetter(col);
                                const cell = worksheet.getCell(`${cellLetter}${excelRow}`);
                                if(rowIndex>7)
                                {
                                    cell.fill = null; // xoá màu cũ
                                    cell.protection = { locked: false }; // cho phép edit
                                }
                            }
                        }
                    });
                    worksheet.getColumn('J').hidden = true;
                    worksheet.getColumn('K').hidden = true;
                    // worksheet.getColumn('G').hidden = true;
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
                }
            }
            // Save the file as a blob and prompt download
            const buffer = await workbook.xlsx.writeBuffer();
            saveAs(new Blob([buffer]), 'Formular.xlsx');
              setLoadingGlobal(false);
        } catch (error) {
            console.error("Error fetching data for report:", error);
              setLoadingGlobal(false);
        }
        finally{
             setLoadingGlobal(false);
        }
    };
    return (
        <>
         {loadingGlobal && (
                    <Box
                        sx={{
                            position: "fixed",
                            top: 0,
                            left: 0,
                            width: "100vw",
                            height: "100vh",
                            backgroundColor: "rgba(0,0,0,0)",
                            zIndex: 2000,
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "#fff"
                        }}
                    >
                        <img
                            src="https://i.gifer.com/ZKZg.gif"
                            alt="loading"
                            width="100"
                            style={{ marginBottom: 10 }}
                        />
                        <Typography variant="h6" sx={{ color: "#fff" }}>
                            Đang xử lý, vui lòng chờ...
                        </Typography>
                    </Box>
                )}
            <Button
                onClick={exportToExcelFile}
                variant="contained"
                color="primary"
                sx={{ height: 56 }}
                startIcon={<FileDownloadIcon />}
                // sx={{ mt: 2 }}
            >
                Tải Xuống file Excel
            </Button>
        </>
    );
};

export default MainPage;
