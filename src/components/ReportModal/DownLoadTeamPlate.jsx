import React, { useState } from 'react';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import PropTypes from 'prop-types';

import api from "@/config";
import { confirmAlert } from 'react-confirm-alert';
import 'react-confirm-alert/src/react-confirm-alert.css';
import { Button } from "@mui/material";
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import allowSheet from "../../utils/AllowSheet.json";
import allowSheetWeek from "../../utils/AllowSheetWeek.json";
import formularjson from "../../utils/formular.json";
import formularweek from "../../utils/formularweek.json";

const getExcelAlpha = (n) => {
    let result = '';
    while (n > 0) {
        const mod = (n - 1) % 26;
        result = String.fromCharCode(65 + mod) + result;
        n = Math.floor((n - mod) / 26);
    }
    return result;
};

const ExcelDownloader = ({year, idLoai, id_xa,username,quarter,week,number,month,templatePath,outputFileName,apiEndpoint
                         }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const EDITABLE_RANGES=allowSheet;
    const EDITABLE_RANGESWEEK=allowSheetWeek;
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
                cell.font ={
                    name: 'Times New Roman',
                    size: 12,
                }
            }
        }
    }
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
    const replaceColumnLetter = (formula, fromCol, toCol) => {
        const regex = new RegExp(`\\b${fromCol}(\\d+)`, 'g');
        return formula.replace(regex, `${toCol}$1`);
    };
    const handleDownload = () => {
        const isInvalid =
            !idLoai || !year ||
            (idLoai === 1 && (!year || !month ||!week)) ||
            (idLoai === 2 && (!year || !month)) ||
            (idLoai === 3 && (!year||!quarter)) ||
            (idLoai === 4 && (!year||!number));

        if (isInvalid) {
            confirmAlert({
                title: 'Thiếu thông tin',
                message: '⚠️ Vui lòng chọn đầy đủ loại báo cáo, đơn vị, thời gian trước khi tải mẫu Excel.',
                buttons: [{ label: 'OK', onClick: () => {} }]
            });
            return;
        }
        if (idLoai === 3 || idLoai === 4) {
            processAndDownloadExcelYearQuaterly();
        } else {
            processAndDownloadExcelWeekMonth();
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
    const unlockEditableRanges = (worksheet,id_loai) => {
        if(id_loai===1)
        {
            EDITABLE_RANGESWEEK.forEach(range => {
                try {
                    if (range.includes(':')) {
                        const [start, end] = range.split(':');
                        const startColLetter = start.replace(/\d+/g, '');
                        const startRow = parseInt(start.replace(/\D+/g, ''));
                        const endColLetter = end.replace(/\d+/g, '');
                        const endRow = parseInt(end.replace(/\D+/g, ''));

                        const startCol = columnLetterToNumber(startColLetter);
                        const endCol = columnLetterToNumber(endColLetter);

                        for (let row = startRow; row <= endRow; row++) {
                            for (let col = startCol; col <= endCol; col++) {
                                const colLetter = columnNumberToLetter(col);
                                const cellAddress = `${colLetter}${row}`;
                                try {
                                    const cell = worksheet.getCell(cellAddress);
                                    cell.protection = { locked: false };
                                } catch (e) {
                                    console.warn(`Không tìm thấy ô ${cellAddress}`);
                                }
                            }
                        }
                    } else {
                        const cell = worksheet.getCell(range);
                        cell.protection = { locked: false };
                    }
                } catch (e) {
                    console.error(`Lỗi khi xử lý range ${range}:`, e);
                }
            });
        }else{
            EDITABLE_RANGES.forEach(range => {
                try {
                    if (range.includes(':')) {
                        const [start, end] = range.split(':');
                        const startColLetter = start.replace(/\d+/g, '');
                        const startRow = parseInt(start.replace(/\D+/g, ''));
                        const endColLetter = end.replace(/\d+/g, '');
                        const endRow = parseInt(end.replace(/\D+/g, ''));

                        const startCol = columnLetterToNumber(startColLetter);
                        const endCol = columnLetterToNumber(endColLetter);

                        for (let row = startRow; row <= endRow; row++) {
                            for (let col = startCol; col <= endCol; col++) {
                                const colLetter = columnNumberToLetter(col);
                                const cellAddress = `${colLetter}${row}`;
                                try {
                                    const cell = worksheet.getCell(cellAddress);
                                    cell.protection = { locked: false };
                                } catch (e) {
                                    console.warn(`Không tìm thấy ô ${cellAddress}`);
                                }
                            }
                        }
                    } else {
                        const cell = worksheet.getCell(range);
                        cell.protection = { locked: false };
                    }
                } catch (e) {
                    console.error(`Lỗi khi xử lý range ${range}:`, e);
                }
            });
        }

    };
    const processAndDownloadExcelYearQuaterly = async () => {
        setIsLoading(true);
        setError(null);
        let NameFileDownload="";
        try {
            const response = await api.get(`/chitieu`, {});
            const tables = [];
            const rawData = response.data;
            let currentGroup = [];
            for (const chitieu of rawData) {
                currentGroup.push(chitieu);
            }
            if (currentGroup.length > 0) tables.push(currentGroup);
            const preparedData = tables.map((group, idx) => {
                // const xaList = group[0].xa.map((x) => x.ten_xa);
                const data = [];
                const headerRow01 = [""];
                const headerRow02 = [""];
                let headerRow03 = [""];
                let headerRow04 = [""];
                let headerRow05 = [];
                let loaibaocaotext="";
                let headerRow07=[];
                let headerRow06 = [];
                let headerRow08=[''];
                if( idLoai === 1 )
                {
                    loaibaocaotext=`(Tuần ${week}-${month}-${year})`;
                }else if(idLoai=== 2){
                    loaibaocaotext=`(Tháng ${month}-${year})`;
                }else if(idLoai=== 3){
                    if(quarter===1)
                    {
                        headerRow05=[`ƯỚC KẾT QUẢ SẢN XUẤT NÔNG, LÂM, NGƯ NGHIỆP QUÝ ${quarter}` ];
                        headerRow07= ['STT','Chỉ tiêu','DVT', 'Lũy kế thực hiện quý I năm trước','Kế hoạch năm báo cáo','Thực hiện quý 1 năm báo cáo',`Q${quarter}${year}${username.id}`];
                        loaibaocaotext=`(Quý ${quarter}-${year})`;
                    }else if(quarter===2){
                        headerRow05=[`ƯỚC KẾT QUẢ SẢN XUẤT NÔNG, LÂM, NGƯ NGHIỆP QUÝ II VÀ 06 THÁNG` ];
                        headerRow08=['','','', 'Quý II','TH 06 Tháng','Kế hoạch','Ước TH Quý','Ước TH 06 Tháng'];
                        headerRow07= ['STT','Chỉ tiêu','DVT', 'Năm trước','','Năm báo cáo','','',`Q${quarter}${year}${username.id}`];
                        loaibaocaotext=`(6 tháng-${year})`;
                    }else if(quarter===3){
                        headerRow05=[`ƯỚC KẾT QUẢ SẢN XUẤT NÔNG, LÂM, NGƯ NGHIỆP QUÝ III VÀ 09 THÁNG` ];
                        headerRow08=['','','','Quý II','TH 09 Tháng','Kế hoạch','Ước TH Quý','Ước TH 09 Tháng'];
                        headerRow07= ['STT','Chỉ tiêu','DVT', 'Năm trước','','Năm báo cáo','','',`Q${quarter}${year}${username.id}`];
                        loaibaocaotext=`(9 tháng-${year})`;
                    }else {
                        // headerRow06=['','','','Năm trước','','Năm báo cáo','',''];
                        headerRow05=[`ƯỚC KẾT QUẢ SẢN XUẤT NÔNG, LÂM, NGƯ NGHIỆP QUÝ IV VÀ BÁO CÁO NĂM ${year} LẦN 2` ];
                        headerRow08=['','','','Quý IV','Toàn năm','Kế hoạch','Ước TH Quý','Ước Toàn năm'];
                        headerRow07= ['STT','Chỉ tiêu','DVT', 'Năm trước','','Năm báo cáo','','',`Q${quarter}${year}${username.id}`];
                        loaibaocaotext=`(Quý ${quarter}-${year})`;
                    }
                }else if(idLoai=== 4){
                    headerRow05=[`ƯỚC KẾT QUẢ SẢN XUẤT NÔNG, LÂM, NGƯ NGHIỆP LẦN ${number} NĂM ${year}` ];
                    loaibaocaotext= `(Lần ${number}-${year})`;
                    headerRow07= ['STT','Chỉ tiêu','DVT', 'Lũy kế thực hiện năm trước','Kế hoạch năm báo cáo','Thực hiện năm báo cáo',`Y${number}${year}${username.id}`];
                }
                if(idLoai=== 4 || (idLoai=== 3&&quarter===1))
                {
                    NameFileDownload= "Báo cáo "+loaibaocaotext;
                    data.push(headerRow01, headerRow02, headerRow03, headerRow04,headerRow05 ,headerRow06,headerRow07,headerRow08);
                    group.forEach((ct, index) => {
                        const row = [
                            ct.ma_chitieu,
                            ct.ten_chitieu,
                            // ct.dvt,
                            (ct.dvt == "103cây" ? "10³ cây" :(ct.dvt == "m3"? "m³":  ct.dvt)),
                            (formularjson[index ] && formularjson[index].formula) ? `${replaceColumnLetter(evaluateRelativeFormula(formularjson[index].formula,8), "E", getExcelAlpha(4))} ` : null,
                            (formularjson[index ] && formularjson[index].formula) ? `${replaceColumnLetter(evaluateRelativeFormula(formularjson[index].formula,8), "E", getExcelAlpha(5))} ` :null,
                            (formularjson[index ] && formularjson[index].formula) ? `${replaceColumnLetter(evaluateRelativeFormula(formularjson[index].formula,8), "E", getExcelAlpha(6))} ` :null,
                        ];
                        row._id=ct.id;
                        row._active=ct.is_active;
                        data.push(row);
                    });
                    return data;
                }else
                {
                    NameFileDownload= "Báo cáo "+loaibaocaotext;
                    data.push(headerRow01, headerRow02, headerRow03, headerRow04,headerRow05 ,headerRow06,headerRow07,headerRow08);
                    group.forEach((ct, index) => {
                        const row = [
                            ct.ma_chitieu,
                            ct.ten_chitieu,
                            (ct.dvt == "103cây" ? "10³ cây" :(ct.dvt == "m3"? "m³":  ct.dvt)),
                            (formularjson[index ] && formularjson[index].formula) ? `${replaceColumnLetter(evaluateRelativeFormula(formularjson[index].formula,8), "E", getExcelAlpha(4))} ` : null,
                            (formularjson[index ] && formularjson[index].formula) ? `${replaceColumnLetter(evaluateRelativeFormula(formularjson[index].formula,8), "E", getExcelAlpha(5))} ` :null,
                            (formularjson[index ] && formularjson[index].formula) ? `${replaceColumnLetter(evaluateRelativeFormula(formularjson[index].formula,8), "E", getExcelAlpha(6))} ` :null,
                            (formularjson[index ] && formularjson[index].formula) ? `${replaceColumnLetter(evaluateRelativeFormula(formularjson[index].formula,8), "E", getExcelAlpha(7))} ` :null,
                            (formularjson[index ] && formularjson[index].formula) ? `${replaceColumnLetter(evaluateRelativeFormula(formularjson[index].formula,8), "E", getExcelAlpha(8))} ` :null,

                        ];
                        row._id=ct.id;
                        row._active=ct.is_active;
                        data.push(row);
                    });
                    return data;
                }
            });
            if (!preparedData || preparedData.length === 0 || !preparedData[0]) {
                console.error("Table data is not available.");
                return;
            }
            if(idLoai=== 4 || (idLoai=== 3&&quarter===1))
            {
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
                        if (rowIndex >= 8 && colIndex === 0) {
                            const id = row._id;
                            if (id) {
                                const idCell = worksheet.getCell(`G${rowIndex + 1}`);
                                idCell.value = id;
                                const activetrue = worksheet.getCell(`H${rowIndex + 1}`);
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
                worksheet.mergeCells(`${getExcelAlpha(1)}1:${getExcelAlpha(6)}1`);
                worksheet.mergeCells(`${getExcelAlpha(1)}2:${getExcelAlpha(6)}2`);
                worksheet.mergeCells(`${getExcelAlpha(1)}3:${getExcelAlpha(6)}3`);
                worksheet.mergeCells(`${getExcelAlpha(1)}4:${getExcelAlpha(6)}4`);
                worksheet.mergeCells(`${getExcelAlpha(1)}5:${getExcelAlpha(6)}5`);
                worksheet.mergeCells(`${getExcelAlpha(1)}6:${getExcelAlpha(6)}6`);
                worksheet.mergeCells(`${getExcelAlpha(1)}7:${getExcelAlpha(1)}8`);
                worksheet.mergeCells(`${getExcelAlpha(2)}7:${getExcelAlpha(2)}8`);
                worksheet.mergeCells(`${getExcelAlpha(3)}7:${getExcelAlpha(3)}8`);

                worksheet.mergeCells(`${getExcelAlpha(4)}7:${getExcelAlpha(4)}8`);
                worksheet.mergeCells(`${getExcelAlpha(5)}7:${getExcelAlpha(5)}8`);
                worksheet.mergeCells(`${getExcelAlpha(6)}7:${getExcelAlpha(6)}8`);

                colorbackgroundexcel(worksheet, 1, preparedData[0].length, 1, 6);
                setBorderForRange(worksheet, 7,preparedData[0].length, 1, 6);
                aligRightForRange(worksheet,9,rawData.length+8,1,1);
                aligLeftForRange(worksheet,9,rawData.length+8,2,2);
                aligLeftForRange(worksheet,1,4,1,1);
                setColumnWidthsInRange(worksheet, 1,1,10);
                setColumnWidthsInRange(worksheet, 3,4,12);
                setColumnWidthsInRange(worksheet, 2,2,30);
                setColumnWidthsInRange(worksheet, 4,6,17);
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
                // 3. Mở khóa các vùng cho phép chỉnh sửa
                unlockEditableRanges(worksheet);
                worksheet.getCell(`A1`).value="Đơn vị: "+"UBND "+username.xa?.ten_xa;
                worksheet.getCell(`A2`).value="Người nhập báo cáo: "+username?.name;
                worksheet.getCell(`A3`).value="Số ĐT: 0"+username?.phone;
                worksheet.getCell(`A4`).value="Email: "+username?.email;
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
                worksheet.getColumn('G').hidden = true;
                worksheet.getColumn('H').hidden = true;
                // 7. Xuất file
                const buffer = await workbook.xlsx.writeBuffer();
                saveAs(new Blob([buffer]), NameFileDownload+".xlsx" || 'bao-cao.xlsx');
            }else{
                const workbook = new ExcelJS.Workbook();
                const worksheet = workbook.addWorksheet('Sheet 1');
                // console.log(preparedData[0]);
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
                        if (rowIndex >= 8 && colIndex === 0) {
                            const id = row._id;
                            if (id) {
                                const idCell = worksheet.getCell(`I${rowIndex + 1}`);
                                idCell.value = id;
                                const activetrue = worksheet.getCell(`J${rowIndex + 1}`);
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
                worksheet.mergeCells(`${getExcelAlpha(1)}1:${getExcelAlpha(8)}1`);
                worksheet.mergeCells(`${getExcelAlpha(1)}2:${getExcelAlpha(8)}2`);
                worksheet.mergeCells(`${getExcelAlpha(1)}3:${getExcelAlpha(8)}3`);
                worksheet.mergeCells(`${getExcelAlpha(1)}4:${getExcelAlpha(8)}4`);
                worksheet.mergeCells(`${getExcelAlpha(1)}5:${getExcelAlpha(8)}5`);
                worksheet.mergeCells(`${getExcelAlpha(1)}6:${getExcelAlpha(8)}6`);

                worksheet.mergeCells(`${getExcelAlpha(1)}7:${getExcelAlpha(1)}8`);
                worksheet.mergeCells(`${getExcelAlpha(2)}7:${getExcelAlpha(2)}8`);
                worksheet.mergeCells(`${getExcelAlpha(3)}7:${getExcelAlpha(3)}8`);

                worksheet.mergeCells(`${getExcelAlpha(4)}7:${getExcelAlpha(5)}7`);
                worksheet.mergeCells(`${getExcelAlpha(6)}7:${getExcelAlpha(8)}7`);

                colorbackgroundexcel(worksheet, 1, preparedData[0].length, 1, 8);
                setBorderForRange(worksheet, 7,preparedData[0].length, 1, 8);
                aligRightForRange(worksheet,9,rawData.length+8,1,1);
                aligLeftForRange(worksheet,9,rawData.length+8,2,2);
                aligLeftForRange(worksheet,1,4,1,1);
                setColumnWidthsInRange(worksheet, 1,1,10);
                setColumnWidthsInRange(worksheet, 3,4,12);
                setColumnWidthsInRange(worksheet, 2,2,30);
                setColumnWidthsInRange(worksheet, 4,8,17);
                const targetColumns = ["D","H","E", "G"]; // các cột bạn muốn xử lý thêm
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
                // 3. Mở khóa các vùng cho phép chỉnh sửa
                unlockEditableRanges(worksheet);
                worksheet.getCell(`A1`).value="Đơn vị: "+"UBND "+username.xa?.ten_xa;
                worksheet.getCell(`A2`).value="Người nhập báo cáo: "+username?.name;
                worksheet.getCell(`A3`).value="Số ĐT: 0"+username?.phone;
                worksheet.getCell(`A4`).value="Email: "+username?.email;
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
                worksheet.getColumn('I').hidden = true;
                worksheet.getColumn('J').hidden = true;
                // 7. Xuất file
                const buffer = await workbook.xlsx.writeBuffer();
                saveAs(new Blob([buffer]), NameFileDownload+".xlsx" || 'bao-cao.xlsx');
            }
            // 2. Load workbook
        } catch (err) {
            console.error('Error:', err);
            setError(err.message || 'Có lỗi xảy ra khi tạo báo cáo');
        } finally {
            setIsLoading(false);
        }
    };
    const processAndDownloadExcelWeekMonth = async () => {
        setIsLoading(true);
        setError(null);
        let NameFileDownload="";
        try {
            console.log(year,idLoai,month,week,id_xa);
            const response = await api.post('/chitieu/sumtichly', {year: year, id_loaibaocao: idLoai, month: month, id_xa: id_xa,});
            const tables = [];
            const rawData = response.data?.data || [];
            console.log(rawData);
            let currentGroup = [];
            for (const chitieu of rawData) {currentGroup.push(chitieu);}
            if (currentGroup.length > 0) tables.push(currentGroup);
            const preparedData = tables.map((group, idx) => {
                // const xaList = group[0].xa.map((x) => x.ten_xa);
                const data = [];

                const headerRow01 = [""];
                const headerRow02 = [""];
                let headerRow03 = [""];
                let headerRow04 = [""];
                let headerRow05 = [];
                let loaibaocaotext="";
                let headerRow07=[];
                let headerRow08=[];
                if( idLoai === 1 )
                {
                    headerRow08=['','','','','','Trong tuần','Luỹ kế'];
                    headerRow07= ['STT','Chỉ tiêu','DVT', 'Lũy kế thực hiện cùng kỳ năm trước','Kế hoạch năm báo cáo','Thực hiện tuần của năm báo cáo','',`W${week}${month}${year}${username.id}`];
                    loaibaocaotext=`(Tuần ${week}-${year})`;
                    headerRow05=[`ƯỚC KẾT QUẢ SẢN XUẤT NÔNG, LÂM, NGƯ NGHIỆP TUẦN ${week}` ];
                }else if(idLoai=== 2){
                    loaibaocaotext=`(Tháng ${month}-${year})`;
                    headerRow05=[`ƯỚC KẾT QUẢ SẢN XUẤT NÔNG, LÂM, NGƯ NGHIỆP THÁNG ${month}` ];
                    headerRow07= ['STT','Chỉ tiêu','DVT', 'Lũy kế thực hiện cùng kỳ năm trước ','Kế hoạch năm','Thực hiện tháng của năm báo cáo','',`M${month}${year}${username.id}`];
                    headerRow08=['','','','','','Trong tháng','Luỹ kế'];
                }else if(idLoai=== 3){

                }else if(idLoai=== 4){

                }
                NameFileDownload= "Báo cáo "+loaibaocaotext;
                let headerRow06 = [''];
                data.push(headerRow01, headerRow02, headerRow03, headerRow04,headerRow05 ,headerRow06,headerRow07,headerRow08);
                group.forEach((ct, index) => {
                    let row=[];
                    if(idLoai===1)
                    {
                         row = [
                            ct.ma_chitieu,
                            ct.ten_chitieu,
                            // ct.dvt,
                            (ct.dvt == "103cây" ? "10³ cây" :(ct.dvt == "m3"? "m³":  ct.dvt)),
                            (formularweek[index] && formularweek[index].formula) ? `${replaceColumnLetter(evaluateRelativeFormula(formularweek[index].formula,8), "E", getExcelAlpha(4))} ` : null,
                            (formularweek[index] && formularweek[index].formula) ? `${replaceColumnLetter(evaluateRelativeFormula(formularweek[index].formula,8), "E", getExcelAlpha(5))} ` : null,
                            (formularweek[index] && formularweek[index].formula) ? `${replaceColumnLetter(evaluateRelativeFormula(formularweek[index].formula,8), "E", getExcelAlpha(6))} ` :null,
                            (formularweek[index] && formularweek[index].formula) ? `${replaceColumnLetter(evaluateRelativeFormula(formularweek[index].formula,8), "E", getExcelAlpha(7))} ` :
                            (ct.is_active)?`=${getExcelAlpha(6)}${index + 9}+`+ ct.total_value2:null,
                        ];
                    }else{
                         row = [
                            ct.ma_chitieu,
                            ct.ten_chitieu,
                            // ct.dvt,
                           (ct.dvt == "103cây" ? "10³ cây" :(ct.dvt == "m3"? "m³":  ct.dvt)),
                            (formularjson[index] && formularjson[index].formula) ? `${replaceColumnLetter(evaluateRelativeFormula(formularjson[index].formula,8), "E", getExcelAlpha(4))} ` : null,
                            (formularjson[index] && formularjson[index].formula) ? `${replaceColumnLetter(evaluateRelativeFormula(formularjson[index].formula,8), "E", getExcelAlpha(5))} ` : null,
                            (formularjson[index] && formularjson[index].formula) ? `${replaceColumnLetter(evaluateRelativeFormula(formularjson[index].formula,8), "E", getExcelAlpha(6))} ` :null,
                            (formularjson[index] && formularjson[index].formula) ? `${replaceColumnLetter(evaluateRelativeFormula(formularjson[index].formula,8), "E", getExcelAlpha(7))} ` :
                                ( ct.is_active)?`=${getExcelAlpha(6)}${index+9}+`+ ct.total_value2:null,
                        ];
                    }
                    row._id=ct.id;
                    row._active=ct.is_active;
                    data.push(row);
                });
                return data;
            });
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

                    if (rowIndex >= 8 && colIndex === 0) {

                        const id = row._id;
                        if (id) {
                            const idCell = worksheet.getCell(`H${rowIndex + 1}`);
                            idCell.value = id;
                            const activetrue = worksheet.getCell(`I${rowIndex + 1}`);
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
            worksheet.mergeCells(`${getExcelAlpha(1)}1:${getExcelAlpha(7)}1`);
            worksheet.mergeCells(`${getExcelAlpha(1)}2:${getExcelAlpha(7)}2`);
            worksheet.mergeCells(`${getExcelAlpha(1)}3:${getExcelAlpha(7)}3`);
            worksheet.mergeCells(`${getExcelAlpha(1)}4:${getExcelAlpha(7)}4`);
            worksheet.mergeCells(`${getExcelAlpha(1)}5:${getExcelAlpha(7)}5`);
            worksheet.mergeCells(`${getExcelAlpha(1)}6:${getExcelAlpha(7)}6`);

            worksheet.mergeCells(`${getExcelAlpha(1)}7:${getExcelAlpha(1)}8`);
            worksheet.mergeCells(`${getExcelAlpha(2)}7:${getExcelAlpha(2)}8`);
            worksheet.mergeCells(`${getExcelAlpha(3)}7:${getExcelAlpha(3)}8`);
            worksheet.mergeCells(`${getExcelAlpha(4)}7:${getExcelAlpha(4)}8`);
            worksheet.mergeCells(`${getExcelAlpha(5)}7:${getExcelAlpha(5)}8`);
            worksheet.mergeCells(`${getExcelAlpha(6)}7:${getExcelAlpha(7)}7`);

            colorbackgroundexcel(worksheet, 1, preparedData[0].length, 1, 7);
            setBorderForRange(worksheet, 7,preparedData[0].length, 1, 7);
            aligRightForRange(worksheet,9,rawData.length+8,1,1);
            aligLeftForRange(worksheet,9,rawData.length+8,2,2);
            aligLeftForRange(worksheet,1,4,1,1);

            setColumnWidthsInRange(worksheet, 1,1,10);
            setColumnWidthsInRange(worksheet, 3,4,12);
            setColumnWidthsInRange(worksheet, 2,2,30);
            setColumnWidthsInRange(worksheet, 4,7,17);
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
            // 3. Mở khóa các vùng cho phép chỉnh sửa
            worksheet.getCell(`A1`).value="Đơn vị: "+"UBND "+username.xa?.ten_xa;
            worksheet.getCell(`A2`).value="Người nhập báo cáo: "+username?.name;
            worksheet.getCell(`A3`).value="Số ĐT: 0"+username?.phone;
            worksheet.getCell(`A4`).value="Email: "+username?.email;

            // console.log(worksheet);
            // 3. Mở khóa các vùng cho phép chỉnh sửa
            unlockEditableRanges(worksheet,idLoai);

            worksheet.getColumn('H').hidden = true;
            worksheet.getColumn('I').hidden = true;
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

            // 7. Xuất file
            const buffer = await workbook.xlsx.writeBuffer();
            saveAs(new Blob([buffer]), NameFileDownload+".xlsx" || 'bao-cao.xlsx');

        } catch (err) {
            console.error('Error:', err);
            setError(err.message || 'Có lỗi xảy ra khi tạo báo cáo');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div >
            <Button
                onClick={handleDownload}
                variant="contained"
                color="primary"
                className={`download-button ${isLoading ? 'loading' : ''}`}
                startIcon={<FileDownloadIcon />}
                // sx={{ mt: 2 }}
            >
                {isLoading ? (
                    <span>Đang tạo file...</span>
                ) : (
                    <span>Tải báo cáo Excel</span>
                )}
            </Button>
            {error && (
                <div className="error-message">
                    {error}
                </div>
            )}

            <style jsx>{`
                .excel-downloader {
                    display: inline-block;
                }
                .download-button {
                    //padding: 10px 20px;
                    background-color: #4CAF50;
                    color: white;
                    border: none;
                    //border-radius: 4px;
                    cursor: pointer;
                    //font-size: 14px;
                    transition: background-color 0.3s;
                }
                .download-button:hover:not(:disabled) {
                    background-color: #45a049;
                }
                .download-button:disabled {
                    background-color: #cccccc;
                    cursor: not-allowed;
                }
                .error-message {
                    color: #d32f2f;
                    margin-top: 8px;
                    font-size: 14px;
                }
            `}</style>
        </div>
    );
};

ExcelDownloader.propTypes = {
    year: PropTypes.number.isRequired,
    idLoai: PropTypes.number.isRequired,
    id_xa: PropTypes.number,
    month: PropTypes.number,
    templatePath: PropTypes.string.isRequired,
    outputFileName: PropTypes.string,
    apiEndpoint: PropTypes.string.isRequired
};

ExcelDownloader.defaultProps = {
    templatePath: '/templates/mau-bao-cao-tuan.xlsx',
    apiEndpoint: '/chitieu/sumtichly'
};

export default ExcelDownloader;