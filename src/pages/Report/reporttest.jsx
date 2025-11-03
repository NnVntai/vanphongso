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
import ExcelDownloader from "@/components/REportModal/DownLoadTeamPlate";
import 'handsontable/dist/handsontable.full.min.css';
import UploadFileIcon from "@mui/icons-material/UploadFile";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import TableHearder from "../../components/Table/TableHearder";
import api from "@/config";
import React, { useEffect, useState, useRef } from "react";
import { saveAs } from "file-saver";
import * as XLSX from "xlsx";
const currentYear = new Date().getFullYear();
const years = Array.from({ length: 10 }, (_, i) => currentYear - i);
const months = Array.from({ length: 12 }, (_, i) => i + 1);
const quarters = [1, 2, 3, 4];
const weeks = [1, 2, 3, 4, 5];
const numberYears = [1, 2];


export default function FileInterface() {
    const mergesRef = useRef([]);
    const [fileTypes, setFileTypes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedFileType, setSelectedFileType] = useState("");
    const [week, setWeek] = useState("");
    const [month, setMonth] = useState("");
    const [quarter, setQuarter] = useState("");
    const [numberYear, setNumberYear] = useState("");
    const [year, setYear] = useState(currentYear);
    const [fileName, setFileName] = useState("");
    const [previewData, setPreviewData] = useState([]);
    const [openDialog, setOpenDialog] = useState(false);
    const inputRef = useRef(null);
    let datapost=useRef([]);
    const selectedType = parseInt(selectedFileType);

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
//                         if (typeof finalValue === "string" && !isNaN(finalValue.trim())) {
//                             finalValue = Number(finalValue.trim());
//                         }

                        rowData.push(finalValue);
                        // rowData.push(row.getCell(j).value ?? ""); // giữ trống nếu không có dữ liệu
                    }
                    jsonData.push(rowData);
                }
                // console.log(jsonData);
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
                    const dataChitieu = await api.get("/chitieu", {
                        params: {type: selectedFileType, year},
                    });
                    datapost.current =[];
                    const rawData = dataChitieu; // giữ nguyên dữ liệu từ API
                    // kiểm tra trùng

                    let previrewExcel=jsonData.slice(8, 500);
                    // console.log(previrewExcel);
                    let resultcheck={"equals":[], "notequals":[]}
                    for (let i = 0; i < rawData.data.length; i++) {

                        if(rawData.data[i].ten_chitieu==previrewExcel[i][1])
                        {
                            resultcheck.equals.push({i});
                            if(rawData.data[i].is_active)
                            {
                                // if((previrewExcel[i][5] && typeof previrewExcel[i][5] === 'object'))
                                // {
                                //      console.log(toValidString(previrewExcel[i][5]).result);
                                // }

                                datapost.current.push(
                                    {
                                        id_report: null,
                                        id_chitieu: rawData.data[i].id,
                                        value1: toValidString(previrewExcel[i][3]),
                                        value2: toValidString(previrewExcel[i][4]),
                                        value3: (previrewExcel[i][5] && typeof previrewExcel[i][5] === 'object')?toValidString(previrewExcel[i][5].result):toValidString(previrewExcel[i][5]),
                                    })
                            }else if(previrewExcel[i][3]!=null&&previrewExcel[i][3]!=""){
                                datapost.current.push(
                                    {
                                        id_report: null,
                                        id_chitieu: rawData.data[i].id,
                                        value1: toValidString(previrewExcel[i][3]),
                                        value2: null,
                                        value3: null,
                                    })
                            }
                        }
                        else
                        {
                            resultcheck.notequals.push({i});
                        }
                    }
                } catch (e) {
                    console.error("Lỗi khi tải cấu trúc tiệp:", e);
                }
            };
            reader.readAsArrayBuffer(file);
        }
    };

    const fetchFileTypes = async () => {
        try {
            const { data } = await api.get("/loaibaocao");
            setFileTypes(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error("Lỗi khi tải loại tệp:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFileTypes();


    }, []);

    const handleSubmitReport = async () => {
        const file = inputRef.current?.files[0];
        if (!selectedFileType || !file) return;

        const formData = new FormData();
        const user = JSON.parse(localStorage.getItem("username"));
        formData.append("id_user", user.id);
        formData.append("id_xa", user.id_xa);
        formData.append("filename", file);
        formData.append("id_loaibaocao", selectedFileType);
        formData.append("year_report", year);
        formData.append("number_report", numberYear);
        if (week) formData.append("week_report", week);
        if (month) formData.append("month_report", month);
        if (quarter) formData.append("quarterly_report", quarter);
        if (numberYear) formData.append("number_report", numberYear);

        try {
            let response = await api.post("/reports", formData, {
                headers: {"Content-Type": "multipart/form-data"},
            });

            if (response.data.message === 'duplicate') {
                confirmAlert({
                    title: 'Lỗi',
                    message: '❌ Báo cáo này đã được nộp trước đó. Không thể nộp lại.',
                    buttons: [
                        {
                            label: 'OK', onClick: () => {
                            }
                        }
                    ]
                });
                return; // dừng không tiếp tục xử lý
            }

            // Nếu không duplicate, tiếp tục nộp dữ liệu
            for (let i = 0; i < datapost.current.length; i++) {
                datapost.current[i].id_report = response.data.id;
            }

            await api.post("/report-data-bulk-insert", {records: datapost.current});

            confirmAlert({
                title: 'Thông báo',
                message: '📬 Báo cáo đã được nộp thành công!',
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
    // const handleExportExcel = async () => {
    //     try {
    //         const { data } = await api.get("/chitieu", {
    //             params: { type: selectedFileType, year },
    //         });
    //         const rawData = data; // giữ nguyên dữ liệu từ API
    //         const filteredData = rawData.map(({ ma_chitieu, ten_chitieu,dvt }) => ({
    //              ma_chitieu, ten_chitieu,dvt
    //         }));
    //         const templateBuf = await fetch("/templates/bao-cao-mau.xlsx").then((r) => r.arrayBuffer());
    //         const wb = XLSX.read(templateBuf, { type: "array" });
    //         const ws = wb.Sheets[wb.SheetNames[0]];
    //         XLSX.utils.sheet_add_json(ws, filteredData, { origin: "A7", skipHeader: true });
    //         const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    //         saveAs(new Blob([wbout], { type: "application/octet-stream" }), "BaoCao.xlsx");
    //     } catch (err) {
    //         console.error("Lỗi xuất Excel:", err);
    //     }
    // };
    const generateWeeklyReport = async (workbook) => {
        const worksheet = workbook.addWorksheet('Báo cáo tuần');

        // Thiết lập cột rộng
        worksheet.columns = [
            { width: 10 },  // A - Stt
            { width: 40 },  // B - Chỉ tiêu
            { width: 10 },  // C - ĐVT
            { width: 15 },  // D - Lũy kế cùng kỳ
            { width: 15 },  // E - Trong tuần
            { width: 15 }   // F - Lũy kế
        ];

        // Thêm style và dữ liệu (giống như code Node.js ở trên)
        // ... (phần này giữ nguyên như code Node.js đã cung cấp)

        return workbook;
    };
    const fileMap = {
        1: "mau-bao-cao-tuan.xlsx",
        2: "mau-bao-cao-thang.xlsx",
        3: "mau-bao-cao-quy.xlsx",
        4: "mau-bao-cao-nam.xlsx"
    };
    return (
        <TableHearder title="Nộp báo cáo theo file tải lên">
            <div className="bg-amber-50">
                <Box maxWidth="sm"  mx="auto" p={3}>
                    <FormControl fullWidth>
                        <InputLabel>Loại báo cáo</InputLabel>
                        <Select
                            value={selectedFileType}
                            onChange={(e) => setSelectedFileType(e.target.value)}
                            label="Loại báo cáo"
                        >
                            <MenuItem value="">{loading ? "Đang tải..." : "Chọn loại báo cáo"}</MenuItem>
                            {fileTypes.map((type) => (
                                <MenuItem key={type.id} value={type.id}>{type.name}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <Grid container spacing={2} mt={2}>
                        {selectedType === 1 && (
                            <Grid item xs={12} sm={4} sx={{ minWidth: 150 }}>
                                <FormControl fullWidth><InputLabel>Tuần</InputLabel>
                                    <Select  label="tuần"  value={week} onChange={(e) => setWeek(e.target.value)}>{weeks.map(w => (
                                        <MenuItem key={w} value={w}>Tuần {w}</MenuItem>))}
                                    </Select>
                                </FormControl>
                            </Grid>)
                        }
                        {(selectedType === 1 || selectedType === 2) && (
                            <Grid item xs={12} sm={4} sx={{ minWidth: 150 }}><FormControl fullWidth><InputLabel>Tháng</InputLabel>
                                <Select label="tháng" value={month} onChange={(e) => setMonth(e.target.value)}>{months.map(m => (
                                    <MenuItem key={m} value={m}>Tháng {m}</MenuItem>))}
                                </Select>
                            </FormControl></Grid>)
                        }
                        {selectedType === 3 && (
                            <Grid item xs={12} sm={4} sx={{ minWidth: 150 }}><FormControl fullWidth><InputLabel>Quý</InputLabel>
                                <Select label="Quý" value={quarter} onChange={(e) => setQuarter(e.target.value)}>{quarters.map(q => (
                                    <MenuItem key={q} value={q}>Quý {q}</MenuItem>))}
                                </Select>
                            </FormControl></Grid>)
                        }
                        {selectedType === 4 && (
                            <Grid item xs={12} sm={4} sx={{ minWidth: 150 }}>
                                <FormControl fullWidth><InputLabel>Lần</InputLabel>
                                    <Select label="Quý" value={numberYear} onChange={(e) => setNumberYear(e.target.value)}>{numberYears.map(q => (
                                        <MenuItem key={q} value={q}>lần {q}</MenuItem>))}
                                    </Select>
                                </FormControl></Grid>)
                        }
                        <Grid item xs={12} sm={4} sx={{ minWidth: 150 }}><FormControl fullWidth><InputLabel>Năm</InputLabel>
                            <Select label="Năm" value={year} onChange={(e) => setYear(e.target.value)}>{years.map(y => (
                                <MenuItem key={y} value={y}>Năm {y}</MenuItem>))}
                            </Select>
                        </FormControl></Grid>
                    </Grid>

                    <Grid container spacing={3} mt={3}>
                        <Grid item xs={6}>
                            <ExcelDownloader
                                year={year}
                                idLoai={selectedFileType}
                                ten_xa={JSON.parse(localStorage.getItem("username"))?.xa?.ten_xa}
                                id_xa={JSON.parse(localStorage.getItem("username"))?.xa?.id}
                                username={JSON.parse(localStorage.getItem("username"))}
                                month={month}
                                week={week}
                                number={numberYear}
                                quarter={quarter}
                                templatePath={`/templates/${fileMap[selectedType]}`}
                                outputFileName={`BaoCao_${fileTypes.find(ft => ft.id == selectedFileType)?.name}_${year}.xlsx`}
                                apiEndpoint="/chitieu/sumtichly"
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <input type="file" ref={inputRef} style={{ display: 'none' }} onChange={handleFileChange} />
                            <Button fullWidth variant="contained" startIcon={<UploadFileIcon />} onClick={handleClick}>Tải lên</Button>
                            {fileName && <Typography variant="caption" color="success.main">Đã chọn: {fileName}</Typography>}
                        </Grid>
                        <Grid item xs={12}>
                            <Button fullWidth color="success" variant="contained"  onClick={() => {
                                if (!selectedFileType || !year ||
                                    (selectedType === 1 && (!week || !month)) ||
                                    (selectedType === 2 && !month) ||
                                    (selectedType === 3 && !quarter) ||
                                    (selectedType === 4 && !numberYear)) {
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
                                <Typography><strong>Loại báo cáo:</strong> {fileTypes.find(ft => ft.id == selectedFileType)?.name}</Typography>
                                {week && <Typography><strong>Tuần:</strong> {week}</Typography>}
                                {month && <Typography><strong>Tháng:</strong> {month}</Typography>}
                                {quarter && <Typography><strong>Quý:</strong> {quarter}</Typography>}
                                {numberYear && <Typography><strong>Lần:</strong> {numberYear}</Typography>}
                                <Typography><strong>Năm:</strong> {year}</Typography>
                                <Typography><strong>File:</strong> {fileName}</Typography>
                            </Grid>
                            <Grid item xs={12} md={6} class="w-full">
                                <Typography><strong>Nội dung báo cáo (10 dòng đầu):</strong></Typography>
                                <Box id="handsontable-preview" class="w-full overflowX "  />

                                {/*<Box id="luckysheet" style={{ height: 600, marginTop: 20 }}></Box>*/}
                                {/*<div style={{ overflowX: "auto", maxHeight: 250 }}>*/}
                                {/*    <table style={{ width: "100%", fontSize: 12 }}>*/}
                                {/*        <tbody>*/}
                                {/*        {previewData.map((row, i) => (*/}
                                {/*            <tr key={i}>{row.map((cell, j) => <td key={j} style={{ border: '1px solid #ccc', padding: 4 }}>{cell}</td>)}</tr>*/}
                                {/*        ))}*/}
                                {/*        </tbody>*/}
                                {/*    </table>*/}
                                {/*</div>*/}
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