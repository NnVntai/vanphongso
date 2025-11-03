import React from 'react';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import api from '@/config';
import formularjson from '/src/utils/formular.json';

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
const alignLeftForRange = (sheet, startRow, endRow, startCol, endCol) => {
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
const setColumnWidthsInRange = (sheet, startCol, endCol, width) => {
    for (let col = startCol; col <= endCol; col++) {
        sheet.getColumn(col).width = width;
    }
};

const DownloadExcelButton = ({ loaibaocaoId, year, month, quarter, week ,number}) => {
    const exportToExcel = async () => {
        const response = await api.post('/chitieu/dulieuxuatbaocao', {
            year,
            month,
            quarter,
            week,
            loaibaocao_id: loaibaocaoId,
            number,
        });
        console.log("id_loaibaocao "+loaibaocaoId,"year "+ year, "month "+month,"quarter "+ quarter,"week "+ week ,"number "+number);
        const tables = [];
        const rawData = response.data.data;

        let currentXaNames = null;
        let currentGroup = [];

        for (const chitieu of rawData) {
            const xaNames = chitieu.xa.map((x) => x.ten_xa).join(',');
            if (xaNames !== currentXaNames) {
                if (currentGroup.length > 0) tables.push(currentGroup);
                currentGroup = [];
                currentXaNames = xaNames;
            }
            currentGroup.push(chitieu);
        }
        if (currentGroup.length > 0) tables.push(currentGroup);

        const workbook = new ExcelJS.Workbook();12
        workbook.creator = 'ChiTieuApp';
        workbook.created = new Date();
        if(loaibaocaoId<3)
        {
            tables.forEach((group, idx) => {
                const sheet = workbook.addWorksheet(`Nhóm xã ${idx + 1}`);
                const xaList = group[0].xa.map((x) => x.ten_xa);
                const headerRow0 = ['BÁO CÁO ƯỚC KẾT QUẢ SẢN XUẤT NÔNG, LÂM, NGƯ NGHIỆP ', '', ''];
                const headerRow1 = ['STT', 'Tên chỉ tiêu', 'Đơn vị'];
                const headerRow2 = ['', '', ''];

                xaList.forEach((xa) => {
                    headerRow0.push("", '', '');
                    headerRow1.push(xa, '', '');
                    if(loaibaocaoId===1)
                    {
                        headerRow2.push('Lũy kế cùng kỳ', 'Trong tuần', 'Lũy kế');
                    }else if(loaibaocaoId===2){
                        headerRow2.push('Lũy kế cùng kỳ', 'Trong tháng', 'Lũy kế');
                    }
                });

                const data = [headerRow0, headerRow1, headerRow2];

                group.forEach((ct) => {
                    const row = [ct.ma_chitieu, ct.ten_chitieu, ct.dvt];
                    ct.xa.forEach((x) => {
                        row.push(x.value1, x.value2, x.value3);
                    });
                    data.push(row);
                });

                sheet.addRows(data);

                // Gán công thức dựa trên file JSON
                formularjson.forEach((f, j) => {
                    const colLetter = f.namecol;
                    const formula = f.formula;
                    const number = f.number;
                    if (colLetter && formula && j > 3 && formula !== "") {
                        let col = 4;
                        xaList.forEach(() => {
                            const colTrong = getExcelAlpha(col + 1);
                            const colTichLy = getExcelAlpha(col + 2);
                            const cellRef1 = `${colTrong}${number}`;
                            const cellRef2 = `${colTichLy}${number}`;
                            sheet.getCell(cellRef1).value = { formula: replaceColumnLetter(formula, "E", colTrong) };
                            sheet.getCell(cellRef2).value = { formula: replaceColumnLetter(formula, "E", colTichLy) };
                            col += 3;
                        });
                    }
                });

                // Merge và style
                sheet.mergeCells('A1:' + getExcelAlpha(3 + xaList.length * 3) + '1');
                sheet.mergeCells('A2:A3');
                sheet.mergeCells('B2:B3');
                sheet.mergeCells('C2:C3');

                let col = 4;
                xaList.forEach(() => {
                    const colStart = getExcelAlpha(col);
                    const colEnd = getExcelAlpha(col + 2);
                    sheet.mergeCells(`${colStart}2:${colEnd}2`);
                    col += 3;
                });

                sheet.getRow(1).font = { bold: true };
                sheet.getRow(2).font = { bold: true };
                sheet.getRow(3).font = { bold: true };
                sheet.columns.forEach((column) => {
                    column.alignment = {
                        vertical: 'middle',
                        horizontal: 'center',
                        wrapText: true,
                    };
                    column.width = 15;
                });
                setBorderForRange(sheet, 2, 207, 1, 3 + xaList.length * 3);
                alignLeftForRange(sheet,3,207,3,21);
                setColumnWidthsInRange(sheet, 1,1,5);
                setColumnWidthsInRange(sheet, 3,3,5);
                setColumnWidthsInRange(sheet, 2,2,17);
                setColumnWidthsInRange(sheet, 4,21,6);

            });

        }else if(loaibaocaoId>2){
            tables.forEach((group, idx) => {
                const sheet = workbook.addWorksheet(`Nhóm xã ${idx + 1}`);
                const xaList = group[0].xa.map((x) => x.ten_xa);
                const headerRow0 = ['BÁO CÁO ƯỚC KẾT QUẢ SẢN XUẤT NÔNG, LÂM, NGƯ NGHIỆP ', '', ''];
                const headerRow1 = ['STT', 'Tên chỉ tiêu', 'Đơn vị'];
                const headerRow2 = ['', '', ''];

                xaList.forEach((xa) => {
                    headerRow0.push("", '');
                    headerRow1.push(xa, '');
                    headerRow2.push('Năm trước', 'Năm báo cáo');
                });

                const data = [headerRow0, headerRow1, headerRow2];

                group.forEach((ct) => {
                    const row = [ct.ma_chitieu, ct.ten_chitieu, ct.dvt];
                    ct.xa.forEach((x) => {
                        row.push(x.value1, x.value2);
                    });
                    data.push(row);
                });

                sheet.addRows(data);

                // Gán công thức dựa trên file JSON
                formularjson.forEach((f, j) => {
                    const colLetter = f.namecol;
                    const formula = f.formula;
                    const number = f.number;
                    if (colLetter && formula && j > 3 && formula !== "") {
                        let col = 4;
                        xaList.forEach(() => {
                            const colTrong = getExcelAlpha(col + 1);
                            // const colTichLy = getExcelAlpha(col + 2);
                            const cellRef1 = `${colTrong}${number}`;
                            // const cellRef2 = `${colTichLy}${number}`;
                            sheet.getCell(cellRef1).value = { formula: replaceColumnLetter(formula, "E", colTrong) };
                            // sheet.getCell(cellRef2).value = { formula: replaceColumnLetter(formula, "E", colTichLy) };
                            col += 2;
                        });
                    }
                });

                // Merge và style
                sheet.mergeCells('A1:' + getExcelAlpha(3 + xaList.length * 2) + '1');
                sheet.mergeCells('A2:A3');
                sheet.mergeCells('B2:B3');
                sheet.mergeCells('C2:C3');

                let col = 4;
                xaList.forEach(() => {
                    const colStart = getExcelAlpha(col);
                    const colEnd = getExcelAlpha(col + 1);
                    sheet.mergeCells(`${colStart}2:${colEnd}2`);
                    col += 2;
                });

                sheet.getRow(1).font = { bold: true };
                sheet.getRow(2).font = { bold: true };
                sheet.getRow(3).font = { bold: true };
                setBorderForRange(sheet, 2, 207, 1, 3 + xaList.length * 2);

                sheet.columns.forEach((column) => {
                    column.alignment = {
                        vertical: 'middle',
                        horizontal: 'center',
                        wrapText: true,
                    };
                    // column.width = 15;
                });
                alignLeftForRange(sheet,3,207,3,21);
                setColumnWidthsInRange(sheet, 1,1,5);
                setColumnWidthsInRange(sheet, 3,3,5);
                setColumnWidthsInRange(sheet, 2,2,17);
                setColumnWidthsInRange(sheet, 4,21,6);
            });
        }
        const blob = await workbook.xlsx.writeBuffer();
        saveAs(new Blob([blob]), 'DuLieuChiTieu.xlsx');
    };

    return (
        <button
            onClick={exportToExcel}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
            Tải báo cáo
        </button>
    );
};

export default DownloadExcelButton;
