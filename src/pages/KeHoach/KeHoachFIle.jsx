import {
    Box,
    Typography,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Grid,
    Button,
    Card,
    CardContent,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Fade
} from "@mui/material";
import ExcelJS from 'exceljs';
// import "x-data-spreadsheet/dist/xspreadsheet.css";
// import Spreadsheet from "x-data-spreadsheet";
import { confirmAlert } from 'react-confirm-alert';
import 'react-confirm-alert/src/react-confirm-alert.css'; // Bắt buộ
import Handsontable from 'handsontable';
import ButtonExportChiTieu from "@/components/KeHoach/ButtonExportChiTieu";
import 'handsontable/dist/handsontable.full.min.css';
import UploadFileIcon from "@mui/icons-material/UploadFile";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import TableHearder from "../../components/Table/TableHearder";
import api from "@/config";
import React, { useEffect, useState, useRef } from "react";
const currentYear = new Date().getFullYear();
const years = Array.from({ length: 10 }, (_, i) => currentYear - i);

export default function FileInterface() {
    const mergesRef = useRef([]);


    const [year, setYear] = useState(currentYear);
    const [fileName, setFileName] = useState("");
    const [previewData, setPreviewData] = useState([]);
    const [openDialog, setOpenDialog] = useState(false);
    const inputRef = useRef(null);
    let datapost=useRef([]);


    const handleClick = () => inputRef.current.click();
    const toValidString = (value) => {
        if (value === null || value === undefined || value === "") {
            return "0"; // hoặc "" nếu cơ sở dữ liệu chấp nhận chuỗi rỗng
        }
        return String(value);
    };

    const handleFileChange = async (event) => {
        const file = event.target.files[0];
        if (file) {
            setFileName(file.name);
            const reader = new FileReader();
            reader.onload = async (e) => {
                const workbook = new ExcelJS.Workbook();
                await workbook.xlsx.load(e.target.result);
                const worksheet = workbook.worksheets[0];
                const jsonData = [];
                const totalRows = worksheet.rowCount;

                for (let i = 1; i <= totalRows; i++) {
                    const row = worksheet.getRow(i);
                    const rowData = [];
                    // console.log(row);
                    // const cell = sheet.getCell('A2');
                    // const id = cell.model?.custom?.id;
                    for (let j = 1; j <= row.cellCount; j++) {

                        const cell = row.getCell(j);
                        const val = cell.value;

                        let finalValue = "";

// Nếu là công thức
                        if (val && typeof val === 'object' && val.formula !== undefined) {
                            finalValue = val.result ?? "";
                        } else {
                            finalValue = val ?? "";
                        }

// Nếu là chuỗi số, chuyển sang số
                        if (typeof finalValue === "string" && !isNaN(finalValue.trim())) {
                            finalValue = Number(finalValue.trim());
                        }

                        rowData.push(finalValue);
                        // rowData.push(row.getCell(j).value ?? ""); // giữ trống nếu không có dữ liệu
                    }
                    // console.log(rowData);
                    jsonData.push(rowData);
                    // console.log(worksheet.getCell(i,1));
                    // if(row.getCell(1).model?.custom?.id)
                    // {
                    //     console.log(row.getCell(1).model?.custom?.id)
                    // }
                }
                const maxCols = Math.max(...jsonData.map((row) => row.length));
                const normalized = jsonData.map((row) => {
                    const newRow = Array.from(row);
                    while (newRow.length < maxCols) {
                        newRow.push("");
                    }
                    return newRow;
                });
                setPreviewData(normalized.slice(0, 500));
                // Xóa Luckysheet cũ (nếu có)
                const merges = [];
                const mergeRanges = worksheet.model?.merges || [];
                mergeRanges.forEach((rangeStr) => {
                    const [start, end] = rangeStr.split(':');
                    const startCell = worksheet.getCell(start);
                    const endCell = worksheet.getCell(end);

                    merges.push({
                        row: startCell.row - 1,
                        col: startCell.col - 1,
                        rowspan: endCell.row - startCell.row + 1,
                        colspan: endCell.col - startCell.col + 1,
                    });
                });
                // console.log(merges)
                // Save merges to ref for later use
                mergesRef.current = merges;
                try {
                    let previrewExcel=jsonData.slice(5, 500);
                    // console.log(previrewExcel);

                    for (let i = 0; i < previrewExcel.length; i++) {
                        if(previrewExcel[i][5]??false)
                        {
                            if(previrewExcel[i][3]!==0)
                            {
                                datapost.current.push(
                                {
                                    id_chitieu: previrewExcel[i][4]??"",
                                    kehoach: toValidString(previrewExcel[i][3]),
                                    year: year,
                                })
                            }
                        }
                    }
                } catch (e) {
                    console.error("Lỗi khi tải cấu trúc tiệp:", e);
                }
            };
            reader.readAsArrayBuffer(file);
        }
    };




    useEffect(() => {

    }, []);

    const handleSubmitReport = async () => {
        const file = inputRef.current?.files[0];
        if ( !file) return;


        try {
            // Nếu không duplicate, tiếp tục nộp dữ liệu
            // console.log( datapost.current);
            await api.post("/kehoach/bulk-upsert", {rows: datapost.current});
            confirmAlert({
                title: 'Thông báo',
                message: '📬 Nhập kế hoặc thành công!',
                buttons: [
                    {
                        label: 'OK', onClick: () => {
                        }
                    }
                ]
            });

            setFileName("");
            inputRef.current.value = "";

        } catch (err) {
            confirmAlert({
                title: 'Lỗi',
                message: '❌ Lỗi khi nộp báo cáo: ' + err,
                buttons: [
                    {
                        label: 'OK', onClick: () => {
                        }
                    }
                ]
            });
        }
    }
    return (
        <TableHearder title="Nộp báo cáo theo file tải lên">
            <div className="bg-amber-50">
                <Box maxWidth="sm"  mx="auto" p={3}>
                    <Grid container spacing={2} mt={2}>
                        <Grid item xs={12} sm={4} sx={{ minWidth: 150 }}>
                            <FormControl fullWidth><InputLabel>Năm</InputLabel>
                                <Select label="Năm" value={year} onChange={(e) => setYear(e.target.value)}>{years.map(y => (
                                    <MenuItem key={y} value={y}>Năm {y}</MenuItem>))}
                                </Select>
                            </FormControl>
                        </Grid>
                    </Grid>
                    <Grid container spacing={3} mt={3}>
                        <Grid item xs={6}>
                            <ButtonExportChiTieu
                                year={year}
                                outputFileName={`KeHoach_TTDLNongNghiep_${year}.xlsx`}
                                apiEndpoint="/chitieu"
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <input type="file" ref={inputRef} style={{ display: 'none' }} onChange={handleFileChange} />
                            <Button fullWidth variant="contained" startIcon={<UploadFileIcon />} onClick={handleClick}>Tải lên</Button>
                            {fileName && <Typography variant="caption" color="success.main">Đã chọn: {fileName}</Typography>}
                        </Grid>
                        <Grid item xs={12}>
                            <Button fullWidth color="success" variant="contained"  onClick={() => {
                                if ( !year) {
                                    confirmAlert({
                                        title: 'Thiếu thông tin',
                                        message: '⚠️ Vui lòng chọn đầy đủ loại báo cáo và thời gian.',
                                        buttons: [
                                            { label: 'OK', onClick: () => {} }
                                        ]
                                    });
                                    return;
                                }
                                setOpenDialog(true);
                            }} >📤 Nộp báo cáo</Button>
                        </Grid>
                    </Grid>
                </Box>

                <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="lg" fullWidth   TransitionComponent={Fade} TransitionProps={{
                    onEntered: () => {
                        // console.log(mergesRef);
                        const container = document.getElementById("handsontable-preview");
                        if (container && previewData.length > 0) {
                            // Xoá handsontable cũ nếu có
                            if (container.handsontableInstance) {
                                container.handsontableInstance.destroy();
                            }

                            const hot = new Handsontable(container, {
                                data: previewData,
                                rowHeaders: true,
                                colHeaders: true,
                                readOnly: true,
                                width: '100%',
                                height: 300,
                                licenseKey: 'non-commercial-and-evaluation',
                                mergeCells: mergesRef.current,
                                cells: function (row, col) {
                                    const cellProperties = {};
                                    cellProperties.className = 'htCenter htMiddle'; // center text
                                    return cellProperties;
                                },

                                // customBorders: [
                                //     {
                                //         range: {
                                //             from: { row: 0, col: 0 },
                                //             to: { row: 9, col: previewData[0]?.length - 1 || 4 },
                                //         },
                                //         top: { width: 1, color: '#000' },
                                //         left: { width: 1, color: '#000' },
                                //         bottom: { width: 1, color: '#000' },
                                //         right: { width: 1, color: '#000' },
                                //     }
                                // ]
                            });

                            // Gán lại instance để destroy lần sau
                            container.handsontableInstance = hot;
                        }
                    }}}>
                    <DialogTitle>Xác nhận nộp báo cáo</DialogTitle>
                    <DialogContent>
                        <Grid container spacing={2}>
                            <Grid item xs={12} md={6}>
                                <Typography><strong>Năm:</strong> {year}</Typography>
                                <Typography><strong>File:</strong> {fileName}</Typography>
                            </Grid>
                            <Grid item xs={12} md={6} class="w-full">
                                <Typography><strong>Nội dung báo cáo (10 dòng đầu):</strong></Typography>
                                <Box id="handsontable-preview" class="w-full overflowX "  />
                            </Grid>
                        </Grid>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setOpenDialog(false)}>Huỷ</Button>
                        <Button onClick={() => { handleSubmitReport(); setOpenDialog(false); }} variant="contained" color="primary">Xác nhận nộp</Button>
                    </DialogActions>
                </Dialog>
            </div>
        </TableHearder>
    );
}