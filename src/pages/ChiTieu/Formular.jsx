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
import ButtonExportTarget from "@/components/Targets/ButtonExportTarget";
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
    const [loadingGlobal, setLoadingGlobal] = useState(false);
    const [year, setYear] = useState(currentYear);
    const [fileName, setFileName] = useState("");
    const [previewData, setPreviewData] = useState([]);
    const [openDialog, setOpenDialog] = useState(false);
    const inputRef = useRef(null);
    const datapost = useRef({});
    const handleClick = () => inputRef.current.click();
    const toValidString = (value) => {
        if (value === null || value === undefined || value === "") {
            return "0"; // hoặc "" nếu cơ sở dữ liệu chấp nhận chuỗi rỗng
        }
        return String(value);
    };
    function shiftFormula(formula, rowOffset, colOffset) {
    return formula.replace(/([A-Z]+)(\d+)/g, (match, colLetters, rowNum) => {
        rowNum = parseInt(rowNum) + rowOffset;

        // Dịch cột
        let colNumber = 0;
        for (let i = 0; i < colLetters.length; i++) {
        colNumber = colNumber * 26 + (colLetters.charCodeAt(i) - 64);
        }
        colNumber += colOffset;

        // Chuyển lại về chữ cái
        let newCol = "";
        while (colNumber > 0) {
        const rem = (colNumber - 1) % 26;
        newCol = String.fromCharCode(65 + rem) + newCol;
        colNumber = Math.floor((colNumber - 1) / 26);
        }

        return `${newCol}${rowNum}`;
    });
    }
    useEffect(() => {
         console.log("🧩 datapost cập nhật:", datapost);         
    }, [datapost]);
    const handleFileChange = async (event) => {
        datapost.current = {}; 
        const file = event.target.files[0];
        if (!file) return;

        setFileName(file.name);
        const reader = new FileReader();

        reader.onload = async (e) => {
            const workbook = new ExcelJS.Workbook();
            await workbook.xlsx.load(e.target.result);

            const jsonDataAllSheets = [];

            // Duyệt qua toàn bộ sheet
            workbook.worksheets.forEach((worksheet, sheetIndex) => {
                const sheetName = worksheet.name;
                const jsonData = [];
                const totalRows = worksheet.rowCount;

                for (let i = 1; i <= totalRows; i++) {
                    const row = worksheet.getRow(i);
                    const rowData = [];

                    for (let j = 1; j <= row.cellCount; j++) {
                        const cell = row.getCell(j);
                        const val = cell.value;

                        // ✅ Trường hợp là đối tượng công thức / sharedFormula
                        if (val && typeof val === "object") {
                            if (val.formula !== undefined) {
                            // Trường hợp có công thức riêng
                            rowData.push({
                                formula: `=${val.formula}`,
                                result: val.result ?? "",
                            });
                            } else if (val.sharedFormula) {
                                const rootCell = worksheet.getCell(val.sharedFormula);
                                const rootFormula = rootCell?.value?.formula;

                                if (rootFormula) {
                                    const rowOffset = cell.row - rootCell.row;
                                    const colOffset = cell.col - rootCell.col;

                                    const shiftedFormula = shiftFormula(rootFormula, rowOffset, colOffset);

                                    rowData.push({
                                    formula: `=${shiftedFormula}`,
                                    result: val.result ?? "",
                                    });
                                } else {
                                    rowData.push(val.result ?? "");
                                }
                            }
                        } else {
                            // ✅ Ô thường (số, text, null)
                            rowData.push(val ?? "");
                        }
                    }
                    jsonData.push(rowData);
                }
                // Chuẩn hoá độ dài các dòng
                const maxCols = Math.max(...jsonData.map((r) => r.length));
                const normalized = jsonData.map((r) => {
                    const newRow = Array.from(r);
                    while (newRow.length < maxCols) newRow.push("");
                    return newRow;
                });
                jsonDataAllSheets.push({
                    sheetName,
                    data: normalized,
                });
                // Xử lý merge nếu cần
                const merges = [];
                const mergeRanges = worksheet.model?.merges || [];
                mergeRanges.forEach((rangeStr) => {
                    const [start, end] = rangeStr.split(":");
                    const startCell = worksheet.getCell(start);
                    const endCell = worksheet.getCell(end);
                    merges.push({
                        row: startCell.row - 1,
                        col: startCell.col - 1,
                        rowspan: endCell.row - startCell.row + 1,
                        colspan: endCell.col - startCell.col + 1,
                    });
                });
                // Lưu merge theo từng sheet nếu cần
                mergesRef.current[sheetName] = merges;
            });
            // 👉 Lưu sheet đầu tiên để hiển thị preview (tối đa 500 dòng)
            if (jsonDataAllSheets.length > 0) {
                setPreviewData(jsonDataAllSheets[0].data.slice(0, 500));
            }
            // 👉 Gom dữ liệu vào datapost.current
            try {
                datapost.current.nomal = []; // reset
                datapost.current.week = []; // reset
                // console.log(jsonDataAllSheets);
                if(jsonDataAllSheets.length>3)
                {
                    for (let sheetIndex = 0; sheetIndex < 2; sheetIndex++) {
                        if(sheetIndex===0)
                        {
                            const rows=jsonDataAllSheets[sheetIndex].data.slice(0, 500);
                            
                            for (let i = 0; i < rows.length; i++) {
                                if(rows[i][4]!==null&&rows[i][4]!==""&&rows[i][4]!==undefined)
                                {
                                    // if (rows[i][3] && typeof rows[i][3] === "object" && rows[i][3].formula !== undefined) {
                                    datapost.current.nomal.push({
                                        id:rows[i][4],
                                        formular:(jsonDataAllSheets[sheetIndex].data[i][3].formula!==undefined&&jsonDataAllSheets[sheetIndex].data[i][3].formula!=='')?jsonDataAllSheets[sheetIndex].data[i][3].formula:"",
                                        planformular:(jsonDataAllSheets[sheetIndex+2].data[i][8].formula!==undefined&&jsonDataAllSheets[sheetIndex+2].data[i][8].formula!=='')?jsonDataAllSheets[sheetIndex+2].data[i][8].formula:"",
                                    });     
                                }
                            }
                        }else if(sheetIndex===1){
                            const rows=jsonDataAllSheets[sheetIndex].data.slice(0, 500);
                            for (let i = 0; i < rows.length; i++) {
                                if(rows[i][4]!==null&&rows[i][4]!==""&&rows[i][4]!==undefined)
                                {
                                    // if (rows[i][3] && typeof rows[i][3] === "object" && rows[i][3].formula !== undefined) {
                                    datapost.current.week.push({
                                        id:rows[i][4],
                                        formularweek:(jsonDataAllSheets[sheetIndex].data[i][3].formula!==undefined&&jsonDataAllSheets[sheetIndex].data[i][3].formula!=='')?jsonDataAllSheets[sheetIndex].data[i][3].formula:"",
                                        planweekformular:(jsonDataAllSheets[sheetIndex+2].data[i][8].formula!==undefined&&jsonDataAllSheets[sheetIndex+2].data[i][8].formula!=='')?jsonDataAllSheets[sheetIndex+2].data[i][8].formula:"",
                                    });     
                                }
                                    
                            }
                        }
                    }
                }

                console.log(datapost.current.nomal);
                console.log(datapost.current.week);
                const mergedMap = new Map();
                // Duyệt qua normal
                  datapost.current.nomal.forEach(item => {
                    mergedMap.set(item.id, { ...item }); // tạo bản sao object
                });
                // Duyệt qua week
                  datapost.current.week.forEach(item => {
                    if (mergedMap.has(item.id)) {
                        // Nếu id đã tồn tại, merge vào object cũ
                        Object.assign(mergedMap.get(item.id), item);
                    } else {
                        // Nếu id chưa có, thêm mới
                        mergedMap.set(item.id, { ...item });
                    }
                });
                datapost.current.merged = Array.from(mergedMap.values());
                // console.log(datapost.current.merged);
            } catch (e) {
                console.error("Lỗi khi xử lý dữ liệu Excel:", e);
            }
        
        };

        reader.readAsArrayBuffer(file);
    };
    const handleSubmitReport = async () => {
        setLoadingGlobal(true);
        const file = inputRef.current?.files[0];
        if ( !file) return;
        try {
            const { data } = await api.post("/chitieu/bulk-upsert-formula", { rows:datapost.current.merged });
            confirmAlert({
                title: 'Thông báo',
                message: '📬 Cập nhật thành công!',
                buttons: [
                    {
                        label: 'OK', onClick: () => {
                        }
                    }
                ]
            });
            setFileName("");
            inputRef.current.value = "";
            setLoadingGlobal(false);
        } catch (err) {
            setLoadingGlobal(false);
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
        <TableHearder title="Điều chỉnh công thức báo cáo" backlink="/indexchitieu">
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
            <Box className="bg-amber-50" p={3}>
                <Grid container spacing={3} justifyContent="center">
                    {/* 2. NÚT TẢI FILE MẪU */}
                    <Grid item xs={12} sm={6} md={4}>
                        <ButtonExportTarget
                            fullWidth
                            year={year}
                            outputFileName={`Công Thức_TTDLNongNghiep_${year}.xlsx`}
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
                            📤 Chọn File excel công thức
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
                <DialogTitle> Xác nhận hoàn thành điều chỉnh công thức </DialogTitle>
                <DialogContent >
                    <Grid container spacing={2}>
                        <Grid item xs={12} md={4}>
                            <Typography><strong>Năm:</strong> { }</Typography>
                            <Typography><strong>File:</strong> {fileName}</Typography>
                        </Grid>
                        <Grid item xs={12} md={8}  sx={{width:"1000px"}}  >
                            <Typography mb={1} ><strong>Xem trước nội dung:</strong></Typography>
                            <Box id="handsontable-preview"   sx={{
                                width: "100%",
                                minHeight: 500,
                                overflow: "auto",
                                border: "1px solid #ccc",
                                borderRadius: 2,
                            }} />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenDialog(false)}>Huỷ</Button>
                    <Button
                        disabled={!datapost.current.merged?.length}
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