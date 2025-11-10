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
                                    id_xa:JSON.parse(localStorage.getItem("username")).id_xa
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
        <TableHearder title="Nộp kế hoạch chỉ tiêu theo file tải lên">
            <Box className="bg-amber-50" p={3}>
                <Grid container spacing={3} justifyContent="center">

                    {/* 1. CHỌN NĂM */}
                    <Grid item xs={12} sm={4}>
                        <FormControl fullWidth>
                            <InputLabel>Năm</InputLabel>
                            <Select
                                label="Năm"
                                value={year}
                                onChange={(e) => setYear(e.target.value)}
                            >
                                {years.map((y) => (
                                    <MenuItem key={y} value={y}>Năm {y}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>

                    {/* 2. NÚT TẢI FILE MẪU */}
                    <Grid item xs={12} sm={6} md={4}>
                        <ButtonExportChiTieu
                            fullWidth
                            year={year}
                            outputFileName={`KeHoach_TTDLNongNghiep_${year}.xlsx`}
                            apiEndpoint="/chitieu"
                            label="📄 Tải file mẫu kế hoạch"
                        />
                    </Grid>

                    {/* 3. NÚT TẢI LÊN FILE */}
                    <Grid item xs={12} sm={6} md={4}>
                        <input
                            type="file"
                            ref={inputRef}
                            style={{ display: "none" }}
                            onChange={handleFileChange}
                        />
                        <Button
                            fullWidth
                            variant="outlined"
                            startIcon={<UploadFileIcon />}
                            onClick={handleClick}
                            sx={{ height: 56 }}
                        >
                            📤 Chọn file kế hoạch chỉ tiêu
                        </Button>
                        {fileName && (
                            <Typography
                                variant="caption"
                                color="success.main"
                                sx={{ display: "block", textAlign: "center", mt: 1 }}
                            >
                                ✅ Đã chọn: {fileName}
                            </Typography>
                        )}
                    </Grid>

                    {/* 4. NÚT NỘP BÁO CÁO */}
                    <Grid item xs={12} sm={8} md={6}>
                        <Button
                            fullWidth
                            color="success"
                            variant="contained"
                            sx={{ height: 56 }}
                            size="large"
                            onClick={() => {
                                if (!year) {
                                    confirmAlert({
                                        title: "Thiếu thông tin",
                                        message: "⚠️ Vui lòng chọn năm trước khi nộp báo cáo.",
                                        buttons: [{ label: "OK" }],
                                    });
                                    return;
                                }
                                setOpenDialog(true);
                            }}
                        >
                            🚀 nộp kế hoạch chỉ tiêu
                        </Button>
                    </Grid>
                </Grid>
            </Box>

            {/* DIALOG XEM TRƯỚC */}
            <Dialog
                open={openDialog}
                onClose={() => setOpenDialog(false)}
                maxWidth="lg"
                fullWidth
                TransitionComponent={Fade}
                TransitionProps={{
                    onEntered: () => {
                        const container = document.getElementById("handsontable-preview");
                        if (container && previewData.length > 0) {
                            if (container.handsontableInstance) {
                                container.handsontableInstance.destroy();
                            }

                            const hot = new Handsontable(container, {
                                data: previewData,
                                rowHeaders: true,
                                colHeaders: true,
                                readOnly: true,
                                width: "100%",
                                height: 300,
                                licenseKey: "non-commercial-and-evaluation",
                                mergeCells: mergesRef.current,
                                cells: () => ({ className: "htCenter htMiddle" }),
                            });

                            container.handsontableInstance = hot;
                        }
                    },
                }}
            >
                <DialogTitle>Xác nhận nộp kết hoạch chỉ tiêu </DialogTitle>
                <DialogContent>
                    <Grid container spacing={2}>
                        <Grid item xs={12} md={4}>
                            <Typography><strong>Năm:</strong> {year}</Typography>
                            <Typography><strong>File:</strong> {fileName}</Typography>
                        </Grid>
                        <Grid item xs={12} md={8}>
                            <Typography mb={1}><strong>Xem trước nội dung:</strong></Typography>
                            <Box id="handsontable-preview" sx={{ width: "100%", overflowX: "auto" }} />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenDialog(false)}>Huỷ</Button>
                    <Button
                        onClick={() => {
                            handleSubmitReport();
                            setOpenDialog(false);
                        }}
                        variant="contained"
                        color="primary"
                    >
                        Xác nhận nộp
                    </Button>
                </DialogActions>
            </Dialog>
        </TableHearder>

    );
}