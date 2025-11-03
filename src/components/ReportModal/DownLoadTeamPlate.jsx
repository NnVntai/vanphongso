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
    const EditABC=[

    ]
    const EDITABLE_RANGES=allowSheet;
    const EDITABLE_RANGESWEEK=allowSheetWeek;
    // Danh sách các vùng cho phép chỉnh sửa theo yêu cầu
    // const EDITABLE_RANGES =[
    //     "D19:D20", "F19:F20",
    //     "D22", "F22",
    //     "D24:D25", "F24:F25",
    //     "D27", "F27",
    //     "D29:D30", "F29:F30",
    //     "D32", "F32",
    //     "D34:D35", "F34:F35",
    //     "D37", "F37",
    //     "D44:D45", "F44:F45",
    //     "D47", "F47",
    //     "D49:D50", "F49:F50",
    //     "D52", "F52",
    //     "D54:D55", "F54:F55",
    //     "D57", "F57",
    //     "D59:D60", "F59:F60",
    //     "D62", "F62",
    //     "D64:D65", "F64:F65",
    //     "D67", "F67",
    //     "D74:D75", "F74:F75",
    //     "D77", "F77",
    //     "D79:D80", "F79:F80",
    //     "D82", "F82",
    //     "D89:D90", "F89:F90",
    //     "D92", "F92",
    //     "D94:D95", "F94:F95",
    //     "D97", "F97",
    //     "D99:D100", "F99:F100",
    //     "D102", "F102",
    //     "D104:D105", "F104:F105",
    //     "D112:D113", "F112:F113",
    //     "D115", "F115",
    //     "D122:D123", "F122:F123",
    //     "D125", "F125",
    //     "D127:D128", "F127:F128",
    //     "D130", "F130",
    //     "D132:D133", "F132:F133",
    //     "D135", "F135",
    //     "D137:D138", "F137:F138",
    //     "D140", "F140",
    //     "D142:D143", "F142:F143",
    //     "D145", "F145",
    //     "D147:D148", "F147:F148",
    //     "D150", "F150",
    //     "D157:D158", "F157:F158",
    //     "D160", "F160",
    //     "D162:D163", "F162:F163",
    //     "D165", "F165",
    //     "D167:D168", "F167:F168",
    //     "D170", "F170",
    //     "D172:D173", "F172:F173",
    //     "D175", "F175",
    //     "D177:D178", "F177:F178",
    //     "D180", "F180",
    //     "D182:D183", "F182:F183",
    //     "D185", "F185",
    //     "D187:D188", "F187:F188",
    //     "D190", "F190",
    //     "D192:D193", "F192:F193",
    //     "D195", "F195",
    //     "D197:D200", "F197:F200",
    //     "D202:D204", "F202:F204",
    //     "D208:D211", "F208:F211",
    //     "D213:D216", "F213:F216",
    //     "D220:D223", "F220:F223",
    //     "D225:D228", "F225:F228",
    //     "D231:D233", "F231:F233",
    //     "D235:D237", "F235:F237",
    //     "D239:D240", "F239:F240"

    // ]
    // const EDITABLE_RANGESWEEK = [
    //     "D19:D20", "F19:F20",
    //     "D22","F22",
    //     "D24:D25", "F24:F25",
    //     "D27","F27",
    //     "D29:D30", "F29:F30",
    //     "D32","F32",
    //     "D34:D35", "F34:F35",
    //     "D37","F37",
    //     "D44:D45", "F44:F45",
    //     "D47","F47",
    //     "D49:D50", "F49:F50",
    //     "D52","F52",
    //     "D54:D55", "F54:F55",
    //     "D57","F57",
    //     "D59:D60", "F59:F60",
    //     "D62","F62",
    //     "D64:D65", "F64:F65",
    //     "D67","F67",
    //     "D74:D75", "F74:F75",
    //     "D77","F77",
    //     "D79:D80", "F79:F80",
    //     "D82","F82",
    //     "D89:D90", "F89:F90",
    //     "D92","F92",
    //     "D94:D95", "F94:F95",
    //     "D97","F97",
    //     "D99:D100", "F99:F100",
    //     "D102","F102",
    //     "D104:D105", "F104:F105",
    //     "D109:D112", "F109:F112",
    //     "D114:D117", "F114:F117",
    //     "D121:D124", "F121:F124",
    //     "D126:D129", "F126:F129",
    //     "D132:D134", "F132:F134",
    //     "D136:D138", "F136:F138",
    //     "D140:D141", "F140:F141",
    // ];
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
            processAndDownloadExcel();
        }
    };
    const evaluateRelativeFormula = (formula, number) => {
        return formula.replace(/([A-Z]+)(\d+)/g, (match, col, row) => {
            const newRow = parseInt(row, 10) + number;
            return `${col}${newRow}`;
        });
    };
    const downloadTemplateDirectly = async () => {
        setIsLoading(true);
        try {
            const templateResponse = await fetch(templatePath);
            if (!templateResponse.ok) throw new Error('Không tải được file template');
            const blob = await templateResponse.blob();
            // console.log(blob);
            saveAs(blob, outputFileName || 'bao-cao.xlsx');
        } catch (err) {
            console.error('Error:', err);
            setError(err.message || 'Có lỗi xảy ra khi tải template');
        } finally {
            setIsLoading(false);
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
            const response = await api.get(`/chitieu`, {

            });
            const tables = [];
            const rawData = response.data;
            // console.log(rawData);
            let currentGroup = [];
            // console.log(rawData);
            // Group data based on 'xa' names
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
                        headerRow07= ['STT','Chỉ tiêu','DVT', 'Lũy kế thực hiện quý 1 năm trước','Kế hoạch năm báo cáo','Thực hiện quý 1 năm báo cáo',`Q${quarter}${year}${username.id}`];
                        loaibaocaotext=`(Quý ${quarter}-${year})`;
                    }else if(quarter===2){

                        headerRow05=[`ƯỚC KẾT QUẢ SẢN XUẤT NÔNG, LÂM, NGƯ NGHIỆP 6 THÁNG` ];
                        headerRow07= ['STT','Chỉ tiêu','DVT', 'Lũy kế thực hiện 6 tháng năm trước','Kế hoạch năm báo cáo','Thực hiện 6 tháng năm báo cáo',`Q${quarter}${year}${username.id}`];
                        loaibaocaotext=`(6 tháng-${year})`;
                    }else if(quarter===3){
                        headerRow05=[`ƯỚC KẾT QUẢ SẢN XUẤT NÔNG, LÂM, NGƯ NGHIỆP 9 THÁNG` ];
                        headerRow07= ['STT','Chỉ tiêu','DVT', 'Lũy kế thực hiện 9 tháng năm trước','Kế hoạch năm báo cáo','Thực hiện quý 9 tháng báo cáo',`Q${quarter}${year}${username.id}`];
                        loaibaocaotext=`(9 tháng-${year})`;
                    }else {
                        headerRow05=[`ƯỚC KẾT QUẢ SẢN XUẤT NÔNG, LÂM, NGƯ NGHIỆP QUÝ ${quarter}` ];
                        headerRow07= ['STT','Chỉ tiêu','DVT', `Lũy kế thực hiện quý ${quarter} năm trước`,'Kế hoạch năm báo cáo',`Thực hiện quý ${quarter} năm báo cáo`,`Q${quarter}${year}${username.id}`];
                        loaibaocaotext=`(Quý ${quarter}-${year})`;
                    }

                }else if(idLoai=== 4){
                    headerRow05=[`ƯỚC KẾT QUẢ SẢN XUẤT NÔNG, LÂM, NGƯ NGHIỆP LẦN ${number} NĂM ${year}` ];
                    loaibaocaotext= `(Lần ${number}-${year})`;
                    headerRow07= ['STT','Chỉ tiêu','DVT', 'Lũy kế thực hiện năm trước','Kế hoạch năm báo cáo','Thực hiện năm báo cáo',`Y${number}${year}${username.id}`];
                }
                NameFileDownload= "Báo cáo "+loaibaocaotext;
                let headerRow06 = [];

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
            });
            // setTableData(preparedData);  // Update tableData with the prepared data

            // Now that the data is ready, export it to Excel
            if (!preparedData || preparedData.length === 0 || !preparedData[0]) {
                console.error("Table data is not available.");
                return;
            }

            // 2. Load workbook
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

            EDITABLE_RANGES.forEach(range => {
                const parts = range.split(':');
                const start = parts[0];
                const end = parts[1] || parts[0];

                const startColLetter = start.replace(/[0-9]/g, '');
                const endColLetter = end.replace(/[0-9]/g, '');
                const startRow = parseInt(start.replace(/\D+/g, ''), 10);
                const endRow = parseInt(end.replace(/\D+/g, ''), 10);

                const startCol = columnLetterToNumber(startColLetter);
                const endCol = columnLetterToNumber(endColLetter);

                for (let row = startRow; row <= endRow; row++) {
                    for (let col = startCol; col <= endCol; col++) {
                        const colLetter = columnNumberToLetter(col);
                        const cell = worksheet.getCell(`${colLetter}${row}`);
                        cell.fill = null;
                    }
                }
            });
            // 3. Mở khóa các vùng cho phép chỉnh sửa
            unlockEditableRanges(worksheet);

            worksheet.getCell(`A1`).value="Đơn vị: "+"UBND "+username.xa?.ten_xa;
            worksheet.getCell(`A2`).value="Người nhập báo cáo: "+username?.name;
            worksheet.getCell(`A3`).value="Số ĐT: 0"+username?.phone;
            worksheet.getCell(`A4`).value="Email: "+username?.email;

            // let loaibaocaotext="";
            // if( idLoai === 1 )
            // {
            //     loaibaocaotext=`(Tuần ${week}-${month}-${year})`;
            // }else if(idLoai=== 2){
            //     loaibaocaotext=`(Tháng ${month}-${year})`;
            // }else if(idLoai=== 3){
            //     if(quarter===1)
            //     {
            //         loaibaocaotext=`(Quý ${quarter}-${year})`;
            //     }else if(quarter===2){
            //         loaibaocaotext=`(6 tháng-${year})`;
            //     }else if(quarter===3){
            //         loaibaocaotext=`(9 tháng-${year})`;
            //     }else {
            //         loaibaocaotext=`(Quý ${quarter}-${year})`;
            //     }
            // }else if(idLoai=== 4){
            //     loaibaocaotext= `(Lần ${number}-${year})`;
            // }
            // worksheet.getCell(`A6`).value=loaibaocaotext;
            // 6. Thiết lập bảo vệ worksheet
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

        } catch (err) {
            console.error('Error:', err);
            setError(err.message || 'Có lỗi xảy ra khi tạo báo cáo');
        } finally {
            setIsLoading(false);
        }
    };
    const processAndDownloadExcel = async () => {
        setIsLoading(true);
        setError(null);
        let NameFileDownload="";
        try {
            console.log(year,
                idLoai,
                month,
                id_xa,);
            const response = await api.post(apiEndpoint, {
                year: year,
                id_loaibaocao: idLoai,
                month: month,
                id_xa: id_xa,
            });

            const tables = [];
            const rawData = response.data?.data || [];
            // console.log(rawData);
            let currentGroup = [];
            // console.log(rawData);
            // Group data based on 'xa' names
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
                let headerRow08=[];

                if( idLoai === 1 )
                {
                    headerRow08=['','','','','','Trong tuần','Luỹ kế'];
                    headerRow07= ['STT','Chỉ tiêu','DVT', 'Lũy kế thực hiện cùng kỳ năm trước','Kế hoạch năm báo cáo','Thực hiện tuần của năm báo cáo','',`W${week}${month}${year}${username.id}`];
                    loaibaocaotext=`(Tuần ${week}-${year})`;
                    headerRow05=[`ƯỚC KẾT QUẢ SẢN XUẤT NÔNG, LÂM, NGƯ NGHIỆP TUẦN ${week}` ];
                }else if(idLoai=== 2){
                    if(month===3)
                    {
                        loaibaocaotext=`(Quý 1-${year})`;
                        headerRow05=[`ƯỚC KẾT QUẢ SẢN XUẤT NÔNG, LÂM, NGƯ NGHIỆP Quý 1` ];
                        headerRow07= ['STT','Chỉ tiêu','DVT', 'Lũy kế thực hiện cùng kỳ năm trước ','Kế hoạch năm','Thực hiện 3 tháng của năm báo cáo','',`M${month}${year}${username.id}`];
                    }else if(month===6)
                    {
                        loaibaocaotext=`(Tháng ${month}-${year})`;
                        headerRow05=[`ƯỚC KẾT QUẢ SẢN XUẤT NÔNG, LÂM, NGƯ NGHIỆP 6 THÁNG` ];
                        headerRow07= ['STT','Chỉ tiêu','DVT', 'Lũy kế thực hiện cùng kỳ năm trước ','Kế hoạch năm','Thực hiện 6 tháng của năm báo cáo','',`M${month}${year}${username.id}`];
                    }else if(month===9)
                    {
                        loaibaocaotext=`(Tháng ${month}-${year})`;
                        headerRow05=[`ƯỚC KẾT QUẢ SẢN XUẤT NÔNG, LÂM, NGƯ NGHIỆP 9 THÁNG` ];
                        headerRow07= ['STT','Chỉ tiêu','DVT', 'Lũy kế thực hiện cùng kỳ năm trước ','Kế hoạch năm','Thực hiện 9 tháng của năm báo cáo','',`M${month}${year}${username.id}`];
                    }else{
                        loaibaocaotext=`(Tháng ${month}-${year})`;
                        headerRow05=[`ƯỚC KẾT QUẢ SẢN XUẤT NÔNG, LÂM, NGƯ NGHIỆP THÁNG ${month}` ];
                        headerRow07= ['STT','Chỉ tiêu','DVT', 'Lũy kế thực hiện cùng kỳ năm trước ','Kế hoạch năm','Thực hiện tháng của năm báo cáo','',`M${month}${year}${username.id}`];
                    }
                    headerRow08=['','','','','','Trong tháng','Luỹ kế'];
                }else if(idLoai=== 3){
                    if(quarter===1)
                    {
                        headerRow05=[`ƯỚC KẾT QUẢ SẢN XUẤT NÔNG, LÂM, NGƯ NGHIỆP QUÝ ${quarter}` ];
                        loaibaocaotext=`(Quý ${quarter}-${year})`;
                    }else if(quarter===2){
                        headerRow05=[`ƯỚC KẾT QUẢ SẢN XUẤT NÔNG, LÂM, NGƯ NGHIỆP 6 THÁNG` ];
                        loaibaocaotext=`(6 tháng-${year})`;
                    }else if(quarter===3){
                        headerRow05=[`ƯỚC KẾT QUẢ SẢN XUẤT NÔNG, LÂM, NGƯ NGHIỆP 9 THÁNG` ];
                        loaibaocaotext=`(9 tháng-${year})`;
                    }else {
                        headerRow05=[`ƯỚC KẾT QUẢ SẢN XUẤT NÔNG, LÂM, NGƯ NGHIỆP QUÝ ${quarter}` ];
                        loaibaocaotext=`(Quý ${quarter}-${year})`;
                    }
                }else if(idLoai=== 4){
                    headerRow05=[`ƯỚC KẾT QUẢ SẢN XUẤT NÔNG, LÂM, NGƯ NGHIỆP lẦN ${number} NĂM ${year}` ];
                    loaibaocaotext= `(Lần ${number}-${year})`;
                }
                NameFileDownload= "Báo cáo "+loaibaocaotext;
                let headerRow06 = [''];


                data.push(headerRow01, headerRow02, headerRow03, headerRow04,headerRow05 ,headerRow06,headerRow07,headerRow08);
                // console.log(group);
                group.forEach((ct, index) => {
                    let row=[];
                    // console.log(formularjson[index+1]);
                    // console.log(formularjson[index+3 ].formula,index);
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
            if(idLoai===1){
                // console.log("hello");
                EDITABLE_RANGESWEEK.forEach(range => {
                    const parts = range.split(':');
                    const start = parts[0];
                    const end = parts[1] || parts[0];

                    const startColLetter = start.replace(/[0-9]/g, '');
                    const endColLetter = end.replace(/[0-9]/g, '');
                    const startRow = parseInt(start.replace(/\D+/g, ''), 10);
                    const endRow = parseInt(end.replace(/\D+/g, ''), 10);

                    const startCol = columnLetterToNumber(startColLetter);
                    const endCol = columnLetterToNumber(endColLetter);

                    for (let row = startRow; row <= endRow; row++) {
                        for (let col = startCol; col <= endCol; col++) {
                            const colLetter = columnNumberToLetter(col);
                            const cell = worksheet.getCell(`${colLetter}${row}`);
                            cell.fill = null;
                        }
                    }
                });
            }else{
                EDITABLE_RANGES.forEach(range => {
                    const parts = range.split(':');
                    const start = parts[0];
                    const end = parts[1] || parts[0];

                    const startColLetter = start.replace(/[0-9]/g, '');
                    const endColLetter = end.replace(/[0-9]/g, '');
                    const startRow = parseInt(start.replace(/\D+/g, ''), 10);
                    const endRow = parseInt(end.replace(/\D+/g, ''), 10);

                    const startCol = columnLetterToNumber(startColLetter);
                    const endCol = columnLetterToNumber(endColLetter);

                    for (let row = startRow; row <= endRow; row++) {
                        for (let col = startCol; col <= endCol; col++) {
                            const colLetter = columnNumberToLetter(col);
                            const cell = worksheet.getCell(`${colLetter}${row}`);
                            cell.fill = null;
                        }
                    }
                });
            }
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