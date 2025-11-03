import React, { useState } from 'react';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import PropTypes from 'prop-types';

import api from "@/config";
import { confirmAlert } from 'react-confirm-alert';
import 'react-confirm-alert/src/react-confirm-alert.css';
import { Button } from "@mui/material";
import FileDownloadIcon from '@mui/icons-material/FileDownload';

const ExcelDownloader = ({
                             year,
                             idLoai,
                             id_xa,
                             // ten_xa,
                             username,
                             quarter,
                             week,
                             number,
                             month,
                             templatePath,
                             outputFileName,
                             apiEndpoint
                         }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    // Danh sách các vùng cho phép chỉnh sửa theo yêu cầu
    const EDITABLE_RANGES = [
        "$D$19:$E$22", "$D$24:$E$27", "$D$29:$E$32", "$D$34:$E$42", "$D$49:$E$52",
        "$D$54:$E$57", "$D$59:$E$62", "$D$64:$E$67", "$D$74:$E$77", "$D$79:$E$82",
        "$D$89:$E$92", "$D$94:$E$97", "$D$99:$E$102", "$D$109:$E$112", "$D$119:$E$122",
        "$D$124:$E$127", "$D$129:$E$132", "$D$134:$E$137", "$D$139:$E$142", "$D$144:$E$147",
        "$D$149:$E$152", "$D$154:$E$157", "$D$159:$E$162", "$D$164:$E$167", "$D$169:$E$172",
        "$D$174:$E$176", "$D$180:$E$183", "$D$185:$E$185", "$D$187:$E$188", "$D$192:$E$195",
        "$D$197:$E$200", "$D$203:$E$205", "$D$207:$E$209", "$D$211:$E$212"
    ];

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

    const processAndDownloadExcelYearQuaterly = async () => {
        setIsLoading(true);
        setError(null);

        try {
            // const response = await api.get(`/kehoach2/${year}`, {
            //
            // });
            //
            // const tables = [];
            // const rawData = response.data.data;
            // // console.log(rawData);
            // let currentGroup = [];
            // // console.log(rawData);
            // // Group data based on 'xa' names
            // for (const chitieu of rawData) {
            //     currentGroup.push(chitieu);
            // }
            // if (currentGroup.length > 0) tables.push(currentGroup);
            //
            // 1. Load template
            const templateResponse = await fetch(templatePath);
            if (!templateResponse.ok) throw new Error('Không tải được file template');
            const arrayBuffer = await templateResponse.arrayBuffer();

            // 2. Load workbook
            const workbook = new ExcelJS.Workbook();
            await workbook.xlsx.load(arrayBuffer);
            const worksheet = workbook.getWorksheet(1); // Lấy sheet đầu tiên
            // console.log(worksheet);
            // 3. Mở khóa các vùng cho phép chỉnh sửa
            unlockEditableRanges(worksheet);

            worksheet.getCell(`A1`).value="Đơn vị: "+"UBND "+username.xa?.ten_xa;
            worksheet.getCell(`A2`).value="Người nhập báo cáo: "+username?.name;
            worksheet.getCell(`A3`).value="Số ĐT: "+username?.phone;
            worksheet.getCell(`A4`).value="Email: "+username?.email;
            let loaibaocaotext="";
            if( idLoai === 1 )
            {
                loaibaocaotext=`(Tuần ${week}-${month}-${year})`;
            }else if(idLoai=== 2){
                loaibaocaotext=`(Tháng ${month}-${year})`;
            }else if(idLoai=== 3){
                if(quarter===1)
                {
                    loaibaocaotext=`(Quý ${quarter}-${year})`;
                }else if(quarter===2){
                    loaibaocaotext=`(6 tháng-${year})`;
                }else if(quarter===3){
                    loaibaocaotext=`(9 tháng-${year})`;
                }else {
                    loaibaocaotext=`(Quý ${quarter}-${year})`;
                }
            }else if(idLoai=== 4){
                loaibaocaotext= `(Lần ${number}-${year})`;
            }
            worksheet.getCell(`A6`).value=loaibaocaotext;
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

            // 7. Xuất file
            const buffer = await workbook.xlsx.writeBuffer();
            saveAs(new Blob([buffer]), outputFileName || 'bao-cao.xlsx');

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

        try {
            // 1. Load template
            const templateResponse = await fetch(templatePath);
            if (!templateResponse.ok) throw new Error('Không tải được file template');
            const arrayBuffer = await templateResponse.arrayBuffer();

            // 2. Load workbook
            const workbook = new ExcelJS.Workbook();
            await workbook.xlsx.load(arrayBuffer);
            const worksheet = workbook.getWorksheet(1); // Lấy sheet đầu tiên
            // console.log(worksheet);
            // 3. Mở khóa các vùng cho phép chỉnh sửa
            unlockEditableRanges(worksheet);

            if (idLoai === 1 || idLoai === 2) {
                // 4. Fetch data from API
                console.log( "year "+ year,
                    "id báo cáo "+ idLoai,
                    "Tháng "+ month,
                    "Xã " +id_xa,);
                const response = await api.post(apiEndpoint, {
                    year: year,
                    id_loaibaocao: idLoai,
                    month: month,
                    id_xa: id_xa,
                });

                const apiData = response.data?.data || [];
                // console.log(apiData);
                if (!Array.isArray(apiData)) {
                    throw new Error('Dữ liệu từ API không hợp lệ');
                }

                // 5. Process data - chỉ cập nhật các ô được phép chỉnh sửa
                apiData.forEach((dataItem, index) => {
                    const rowNumber = index + 9; // Giả sử dữ liệu bắt đầu từ hàng 6

                    // Chỉ cập nhật nếu ô nằm trong vùng được phép
                    const cellE = `F${rowNumber}`;
                    // if (EDITABLE_RANGES.some(range => {
                    //     if (range.includes(':')) {
                    //         const [start, end] = range.split(':');
                    //         const startRow = parseInt(start.replace(/\D+/g, ''));
                    //         const endRow = parseInt(end.replace(/\D+/g, ''));
                    //         const col = range.substring(0, 1);
                    //         // console.log(col);
                    //         return col === 'E' && rowNumber >= startRow && rowNumber <= endRow;
                    //     }
                    //     return range === cellE;
                    // })) {

                    // console.log(dataItem.total_value2)
                    if (dataItem.total_value2 > 0) {
                        const cell = worksheet.getCell(cellE);
                        // console.log(cell.value);
                        if (cell.formula) {
                            // console.log(dataItem.total_value2);
                            // Nếu ô có sẵn công thức
                            // cell.value = dataItem.total_value2;

                            cell.value = {
                                formula: `(${cell.value.formula}) + ${dataItem.total_value2}`
                            };
                            // console.log(cell.value);
                        } else if (!isNaN(dataItem.total_value2)) {
                            // Nếu không có công thức thì đặt giá trị số trực tiếp
                            cell.value = dataItem.total_value2;
                        }
                        // }
                    }
                });
            }
            worksheet.getCell(`A1`).value="Đơn vị: "+"UBND "+username.xa?.ten_xa;
            worksheet.getCell(`A2`).value="Người nhập báo cáo: "+username?.name;
            worksheet.getCell(`A3`).value="Số ĐT: "+username?.phone;
            worksheet.getCell(`A4`).value="Email: "+username?.email;
            let loaibaocaotext="";
            if( idLoai === 1 )
            {
                loaibaocaotext=`(Tuần ${week}-${month}-${year})`;
            }else if(idLoai=== 2){
                loaibaocaotext=`(Tháng ${month}-${year})`;
            }else if(idLoai=== 3){
                if(quarter===1)
                {
                    loaibaocaotext=`(Quý ${quarter}-${year})`;
                }else if(quarter===2){
                    loaibaocaotext=`(6 tháng-${year})`;
                }else if(quarter===3){
                    loaibaocaotext=`(9 tháng-${year})`;
                }else {
                    loaibaocaotext=`(Quý ${quarter}-${year})`;
                }
            }else if(idLoai=== 4){
                loaibaocaotext= `(Lần ${number}-${year})`;
            }
            worksheet.getCell(`A6`).value=loaibaocaotext;
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

            // 7. Xuất file
            const buffer = await workbook.xlsx.writeBuffer();
            saveAs(new Blob([buffer]), outputFileName || 'bao-cao.xlsx');

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