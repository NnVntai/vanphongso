import React, { useState } from 'react';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import api from '@/config';
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
// const setMergeCell = (sheet, startRow, endRow, startCol, endCol) => {
//     for (let row = startRow; row <= endRow; row++) {
//         for (let col = startCol; col <= endCol; col++) {
//
//             sheet.mergeCells(`${colStart}5:${colStart}6`);
//         }
//     }
// };
const colorbackgroundexcel=(worksheet, startRow, endRow, startCol, endCol) => {
    for (let row = startRow; row <= endRow; row++) {
        for (let col = startCol; col <= endCol; col++) { // A=1, Z=26
            const cell = worksheet.getCell(row, col);
            // cell.fill = {
            //     type: 'pattern',
            //     pattern: 'solid',
            //     fgColor: { argb: rgbToARGB(218,238,243) } // xám nhạt = giả lập bị khóa
            // };
            cell.font ={
                name: 'Times New Roman',
                size: 12,
            }
        }
    }
}
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

const MainPage = ({ loaibaocaoId, year, month, quarter, week, number }) => {
    // const [tableData, setTableData] = useState([]);

    // Fetch data from API and export to Excel
    const exportToExcelFile = async () => {
        try {
            const response = await api.post('/chitieu/dulieuxuatbaocao', {
                year,
                month,
                quarterly:quarter,
                week,
                loaibaocao_id:loaibaocaoId,
                number,
            });
            console.log('year '+  year,
                'month '+ month,
               'quarter '+  quarter,
              'week '+   week,
               'loaibaocaoId '+  loaibaocaoId,
              'number '+   number)
              console.log(response);
            let namefile="";
            const tables = [];
            const rawData = response.data.data;
            let currentXaNames = null;
            let currentGroup = [];

            // Group data based on 'xa' names
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
            // console.log(tables);
            // Prepare data for export
            const preparedData = tables.map((group, idx) => {
                const xaList = group[0].xa.map((x) => x.ten_xa);
                const data = [];
                const headerRow01 = [];
                let headerRow02 = [""];
                let headerRow03 = [];
                let headerRow04 = [];
                let headerRow05 = [];
                let headerRow06=[];
                if( loaibaocaoId === 1 )
                {
                    namefile=[`(Tuần ${week}-${year})`];
                    headerRow02=[`BÁO CÁO ƯỚC KẾT QUẢ SẢN XUẤT NÔNG, LÂM, NGƯ NGHIỆP TUẦN ${week}`, '', '']
                }else if(loaibaocaoId=== 2){
         
                    namefile=[`(Tháng ${month}-${year})`];
                    headerRow02=[`BÁO CÁO ƯỚC KẾT QUẢ SẢN XUẤT NÔNG, LÂM, NGƯ NGHIỆP THÁNG ${month}`, '', ''];
                    
                }else if(loaibaocaoId=== 3){
                    headerRow02=[`BÁO CÁO ƯỚC KẾT QUẢ SẢN XUẤT NÔNG, LÂM, NGƯ NGHIỆP QUÝ ${quarter}`, '', '']
                    namefile=[`(Quý ${quarter}-${year})`];
              
                }else if(loaibaocaoId=== 4){
                    if(number===1||number===2)
                    {
                        headerRow02=[`BÁO CÁO ƯỚC KẾT QUẢ SẢN XUẤT NÔNG, LÂM, NGƯ NGHIỆP LẦN ${number} NĂM ${year}`, '', '']
                        namefile= [`(Lần ${number}-${year})`];
                    }
                    else if(number===3){
                        namefile=[`(6 Tháng-${year})`];
                        headerRow02=[`BÁO CÁO ƯỚC KẾT QUẢ SẢN XUẤT NÔNG, LÂM, NGƯ NGHIỆP 6 THÁNG`, '', ''];
                    }else if(number===4){
                        namefile=[`(9 Tháng-${year})`];
                        headerRow02=[`BÁO CÁO ƯỚC KẾT QUẢ SẢN XUẤT NÔNG, LÂM, NGƯ NGHIỆP 9 THÁNG`, '', ''];
                    }else {

                    }
                }
                let numbercol
 
                if(loaibaocaoId===1)
                {   numbercol = 10;
                    headerRow04=[1, 2, 3, 4, 5, 6, 7, 8, 9];
                    headerRow05=['STT', 'Tên chỉ tiêu', 'Đơn vị', 'Lũy kế cùng kỳ năm trước', 'Năm báo cáo', '', '', 'So sánh (%)', ''];
                     headerRow06 = ['', '', '', '', 'Kế hoạch', 'Thực hiện trong tuần', 'Lũy kế năm báo cáo', 'KH', 'CKNN'];
                }else if(loaibaocaoId===2){
                    numbercol = 10;
                    headerRow04=[1, 2, 3, 4, 5, 6, 7, 8, 9];
                    headerRow05=['STT', 'Tên chỉ tiêu', 'Đơn vị', 'Lũy kế cùng kỳ năm trước', 'Năm báo cáo', '', '', 'So sánh (%)', ''];
                     headerRow06 = ['', '', '', '', 'Kế hoạch', 'Thực hiện trong tháng', 'Lũy kế năm báo cáo', 'KH', 'CKNN'];
                }else if(loaibaocaoId>2){
                    numbercol = 9;
                    // console.log("hello");
                    headerRow04=[1, 2, 3, 4, 5, 6, 7, 8];
                    headerRow05=['STT', 'Tên chỉ tiêu', 'Đơn vị', 'Lũy kế cùng kỳ năm trước', 'Năm báo cáo', '', 'So sánh (%)', ''];
                     headerRow06 = ['', '', '', '', 'Kế hoạch',  'Lũy kế năm báo cáo', 'KH', 'CKNN'];
                }
                xaList.forEach((xa) => {
                    headerRow01.push('');
                    headerRow02.push('');
                    headerRow03.push('');
                    headerRow04.push(numbercol++);
                    headerRow05.push(xa);
                    headerRow06.push('');
                });

                data.push(headerRow01, headerRow02, headerRow03, headerRow04, headerRow05, headerRow06);
                if(loaibaocaoId===1)
                {
                    group.forEach((ct, index) => {
                        const row = [
                            ct.ma_chitieu,
                            ct.ten_chitieu,
                         (ct.dvt == "103cây" ? "10³ cây" :(ct.dvt == "m3"? "m³":  ct.dvt)),
                            ct.formularweek ? `${replaceColumnLetter(evaluateRelativeFormula(ct.formularweek,-2), "D", getExcelAlpha(4))} ` : ct.total_value1 === 0 ? null : ct.total_value1,
                           ct.formularweek  ? `${replaceColumnLetter(evaluateRelativeFormula(ct.formularweek ,-2), "D", getExcelAlpha(5))} ` :  ct.kehoach === 0 ? null : ct.kehoach,
                            ct.formularweek  ? `${replaceColumnLetter(evaluateRelativeFormula(ct.formularweek ,-2), "D", getExcelAlpha(6))} ` : ct.total_value2 === 0 ? null : ct.total_value2,
                            ct.formularweek  ? `${replaceColumnLetter(evaluateRelativeFormula(ct.formularweek ,-2), "D", getExcelAlpha(7))} ` : ct.total_value3 === 0 ? null : ct.total_value3,
                            ct.planweekformular? `${replaceColumnLetter(evaluateRelativeFormula(ct.planweekformular ,-2), "D", getExcelAlpha(5))} `: null,
                            ct.planweekformular  ? evaluateRelativeFormula(ct.planweekformular ,-2): null,
                        ];

                        ct.xa.forEach((x, xaIndex) => {
                            row.push( ct.formularweek  ? `${replaceColumnLetter(evaluateRelativeFormula( ct.formularweek ,-2), "D", getExcelAlpha(xaIndex + 10))} ` : x.value3.giatri === 0 ? null : x.value3.giatri);
                        });

                        data.push(row);
                    });
                }else if(loaibaocaoId<3){
                    group.forEach((ct, index) => {
                        const row = [
                            ct.ma_chitieu,
                            ct.ten_chitieu,
                             (ct.dvt == "103cây" ? "10³ cây" :(ct.dvt == "m3"? "m³":  ct.dvt)),
                            ct.formular ? `${replaceColumnLetter(evaluateRelativeFormula(ct.formular,-2), "D", getExcelAlpha(4))} ` : ct.total_value1 === 0 ? null : ct.total_value1,
                            ct.formular ? `${replaceColumnLetter(evaluateRelativeFormula(ct.formular,-2), "D", getExcelAlpha(5))} ` :  ct.kehoach === 0 ? null : ct.kehoach,
                            ct.formular ? `${replaceColumnLetter(evaluateRelativeFormula(ct.formular,-2), "D", getExcelAlpha(6))} ` : ct.total_value2 === 0 ? null : ct.total_value2,
                            ct.formular ? `${replaceColumnLetter(evaluateRelativeFormula(ct.formular,-2), "D", getExcelAlpha(7))} ` : ct.total_value3 === 0 ? null : ct.total_value3,
                            ct.planformular ? `${replaceColumnLetter(evaluateRelativeFormula(ct.planformular,-2), "D", getExcelAlpha(5))} ` : null,
                            ct.planformular ? evaluateRelativeFormula(ct.planformular,-2 ): null,
                        ];
                        // evaluateRelativeFormula()
                        ct.xa.forEach((x, xaIndex) => {
                            row.push( ct.formular? `${replaceColumnLetter(evaluateRelativeFormula(ct.formular,-2), "D", getExcelAlpha(xaIndex + 10))} ` : x.value3.giatri === 0 ? null : x.value3.giatri);
                        });

                        data.push(row);
                    });
                }else if(loaibaocaoId>2){
                    group.forEach((ct, index) => {
                        const row = [
                            ct.ma_chitieu,
                            ct.ten_chitieu,
                             (ct.dvt == "103cây" ? "10³ cây" :(ct.dvt == "m3"? "m³":  ct.dvt)),
                             ct.formular ? `${replaceColumnLetter(evaluateRelativeFormula(  ct.formular,-2), "D", getExcelAlpha(4))} ` : ct.total_value1 === 0 ? null : ct.total_value1,
                            ct.formular ? `${replaceColumnLetter(evaluateRelativeFormula(  ct.formular,-2), "D", getExcelAlpha(5))} ` :  ct.kehoach === 0 ? null : ct.kehoach,
                            ct.formular ? `${replaceColumnLetter(evaluateRelativeFormula(  ct.formular,-2), "D", getExcelAlpha(6))} ` : ct.total_value2 === 0 ? null : ct.total_value2,
                            ct.planformular? `${replaceColumnLetter(evaluateRelativeFormula(replaceColumnLetter( ct.planformular,"G","F"),-2),'D',getExcelAlpha(5))}`: null,
                            ct.planformular ? evaluateRelativeFormula(replaceColumnLetter( ct.planformular,"G","F"),-2): null,
                        ];
                        ct.xa.forEach((x, xaIndex) => {
                            // console.log(x.value3.giatri);
                            row.push( ct.formular ? `${replaceColumnLetter(evaluateRelativeFormula( ct.formular,-2), "D", getExcelAlpha(xaIndex + 9))} ` : x.value2.giatri === 0 ? null : x.value2.giatri);
                        });
                        data.push(row);
                    });
                }
                // Process each "chitieu" and add rows
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
            // console.log(rawData);
            // console.log(preparedData[0]);
            // Iterate through the data and set the formulas for specific cells
            preparedData[0].forEach((row, rowIndex) => {
                row.forEach((cell, colIndex) => {
                    const excelCell = worksheet.getCell(rowIndex + 1, colIndex + 1);  // Get the specific cell

                    // Check if the cell is a formula (starts with '='), assign it to .formula property
                    if (typeof cell === 'string' && cell.startsWith('=')) {
                        // console.log(excelCell.formula);
                        excelCell.value={ formula: cell};
                        // excelCell.formula = cell; // Set formula directly if it's a valid formula string
                    } else if (typeof cell !== 'object') {
                        // If the cell is not an object (i.e., a normal value), assign the value
                        excelCell.value = cell;  // Otherwise, set the regular value
                    }
                    if(rowIndex>5 && colIndex>8)
                    {
                        if(rawData[rowIndex-6]?.is_active&&rawData[rowIndex-6]?.xa[colIndex-9]?.value2?.cothaydoi) {
                            // console.log(rawData[rowIndex-6]?.xa[colIndex-9]?.value2.giatri, colIndex+1,rowIndex+1);
                            excelCell.font = {
                                color: { argb: 'FFFF0000' },
                                // chữ đỏ
                                // bold: true
                            };
                        }
                    }

                });
            });
            // console.log(preparedData[0].length);
            worksheet.columns.forEach((column) => {
                column.alignment = {
                    vertical: 'middle',
                    horizontal: 'center',
                    wrapText: true,
                };
                column.width = 15;
            });
            // merger rows
            worksheet.mergeCells(`${getExcelAlpha(1)}5:${getExcelAlpha(1)}6`);
            worksheet.mergeCells(`${getExcelAlpha(2)}5:${getExcelAlpha(2)}6`);
            worksheet.mergeCells(`${getExcelAlpha(3)}5:${getExcelAlpha(3)}6`);
            worksheet.mergeCells(`${getExcelAlpha(4)}5:${getExcelAlpha(4)}6`);
            worksheet.mergeCells(`${getExcelAlpha(1)}2:${getExcelAlpha(9)}2`);
            // worksheet.mergeCells(`${getExcelAlpha(1)}3:${getExcelAlpha(111)}3`);
            if(loaibaocaoId===1){
                for (let i = 0; i < 102; i++) {
                    const colStart = getExcelAlpha(i+10);
                    worksheet.mergeCells(`${colStart}5:${colStart}6`);
                }
                worksheet.mergeCells(`${getExcelAlpha(5)}5:${getExcelAlpha(7)}5`);
                worksheet.mergeCells(`${getExcelAlpha(8)}5:${getExcelAlpha(9)}5`);
                setBorderForRange(worksheet, 4, preparedData[0].length, 1, 111);
            }else if(loaibaocaoId<3)
            {
                for (let i = 0; i < 102; i++) {
                    const colStart = getExcelAlpha(i+10);
                    worksheet.mergeCells(`${colStart}5:${colStart}6`);
                }
                worksheet.mergeCells(`${getExcelAlpha(5)}5:${getExcelAlpha(7)}5`);
                worksheet.mergeCells(`${getExcelAlpha(8)}5:${getExcelAlpha(9)}5`);
                setBorderForRange(worksheet, 4, preparedData[0].length, 1, 111);
            }else{
                for (let i = 0; i < 102; i++) {
                    const colStart = getExcelAlpha(i+9);
                    worksheet.mergeCells(`${colStart}5:${colStart}6`);
                }
                worksheet.mergeCells(`${getExcelAlpha(5)}5:${getExcelAlpha(6)}5`);
                worksheet.mergeCells(`${getExcelAlpha(7)}5:${getExcelAlpha(8)}5`);
                setBorderForRange(worksheet, 4, preparedData[0].length, 1, 110);
            }
            aligRightForRange(worksheet,7,preparedData[0].length,4,111);
            aligLeftForRange(worksheet,7,preparedData[0].length,2,2);
            aligRightForRange(worksheet,7,preparedData[0].length,1,1);
            setColumnWidthsInRange(worksheet, 1,1,5);
            setColumnWidthsInRange(worksheet, 3,3,6);
            setColumnWidthsInRange(worksheet, 2,2,18);
            setColumnWidthsInRange(worksheet, 4,111,10);
            colorbackgroundexcel(worksheet,1,300,1,111)
            // Save the file as a blob and prompt download
            const buffer = await workbook.xlsx.writeBuffer();
            saveAs(new Blob([buffer]), "Báo Cáo tổng "+namefile+'.xlsx');
        } catch (error) {
            console.error("Error fetching data for report:", error);
        }
    };

    return (
        <div>
            <button
                onClick={exportToExcelFile}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 mt-4"
            >
                Tải file Báo cáo
            </button>
        </div>
    );
};

export default MainPage;
