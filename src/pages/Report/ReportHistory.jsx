import React, { useState, useEffect, useRef } from "react";
import XlsxPreview from "@/components/XlsxPreview";
import {
    Box,
    Typography,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Grid,
    Button,
    Table,
    TableHead,
    TableBody,
    TableCell,
    TableRow,
    Modal,
    IconButton,
    CircularProgress,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Fade
} from "@mui/material";
import { Download, X } from "lucide-react";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import TableHearder from "../../components/Table/TableHearder";
import axios from "axios";
import api from "@/config";
import ExcelJS from 'exceljs';
import Handsontable from 'handsontable';
import 'handsontable/dist/handsontable.full.min.css';
import {confirmAlert} from "react-confirm-alert";

// Constants for filter selectors
const currentYear = new Date().getFullYear();
const years = Array.from({ length: 10 }, (_, i) => currentYear - i);
const months = Array.from({ length: 12 }, (_, i) => i + 1);
const quarters = [1, 2, 3, 4];
// const weeks = [1, 2, 3, 4, 5];
const numberYears = [1, 2];

// Axios instance with auth header interceptor

const EditReportModal = ({open, onClose, report, fileTypes, onUpdateSuccess}) => {
    // console.log(report?.id_loaibaocao);
    const [selectedFileType, setSelectedFileType] = useState(report?.id_loaibaocao || "");
    const [week, setWeek] = useState(report?.week_report || "");
    const [month, setMonth] = useState(report?.month_report || "");
    const [quarter, setQuarter] = useState(report?.quarterly_report || "");
    const [numberYear, setNumberYear] = useState(report?.number_report || "");
    const [year, setYear] = useState(report?.year_report || currentYear);
    const [fileName, setFileName] = useState("");
    const [previewData, setPreviewData] = useState([]);
    const [loading, setLoading] = useState(false);
    const inputRef = useRef(null);
    const datapost = useRef([]);
    const mergesRef = useRef([]);
    const selectedType = parseInt(selectedFileType);
    // console.log(selectedType);
    const toValidString = (value) => {
        if (value === null || value === undefined || value === "") {
            return "0";
        }
        return String(value);
    };
    const handleFileChange = async (event) => {
        if(!report?.id_loaibaocao)
        {
            alert('❌ Đã có lỗi xảy ra khong6 thể tải file');
            return;
        }
        const file = event.target.files[0];
        if (file) {
            const isXlsx = file.name.endsWith('.xlsx') ||
                file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
            if (!isXlsx) {

                alert('❌ Vui lòng tải đúng file báo cáo');
                // confirmAlert({
                //     title: 'Lỗi',
                //     message: '❌ Vui lòng tải đúng file báo cáo',
                //     buttons: [
                //         {
                //             label: 'OK', onClick: () => {
                //             }
                //         }
                //     ]
                // });
                return;
            }
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

                        if (val && typeof val === 'object' && val.formula !== undefined) {
                            finalValue = val.result ?? "";
                        } else {
                            finalValue = val ?? "";
                        }
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
                    let previrewExcel=jsonData.slice(8, 500);
                    if(previrewExcel[0].length<8 &&report?.id_loaibaocao>2)
                    {
                        // console.log(previrewExcel[0].length);
                        for (let i = 0; i < previrewExcel.length; i++) {
                            if(previrewExcel[i][6]==true) {
                                datapost.current.push(
                                    {
                                        id_report: report?.id,
                                        id_chitieu: previrewExcel[i][5],
                                        value1: (previrewExcel[i][3] && typeof previrewExcel[i][3] === 'object')?toValidString(previrewExcel[i][3].result):toValidString(previrewExcel[i][3]),
                                        value2: (previrewExcel[i][4] && typeof previrewExcel[i][4] === 'object')?toValidString(previrewExcel[i][4].result):toValidString(previrewExcel[i][4]),
                                        value3: null,
                                    });
                            }
                        }
                    }else if(previrewExcel[0].length>7 &&report?.id_loaibaocao<3)
                    {
                        for (let i = 0; i < previrewExcel.length; i++) {
                            if(previrewExcel[i][7]==true) {
                                datapost.current.push(
                                    {
                                        id_report: report?.id,
                                        id_chitieu: previrewExcel[i][6],
                                        value1: (previrewExcel[i][3] && typeof previrewExcel[i][3] === 'object')?toValidString(previrewExcel[i][3].result):toValidString(previrewExcel[i][3]),
                                        value2: (previrewExcel[i][4] && typeof previrewExcel[i][4] === 'object')?toValidString(previrewExcel[i][4].result):toValidString(previrewExcel[i][4]),
                                        value3: (previrewExcel[i][5] && typeof previrewExcel[i][5] === 'object')?toValidString(previrewExcel[i][5].result):toValidString(previrewExcel[i][5]),
                                    });
                            }
                        }
                    }else {
                        alert('❌ Có vẻ bạn không tải lên đúng loại file.');
                        // confirmAlert({
                        //     title: 'Lỗi',
                        //     message: '❌ Có vẻ bạn không tải lên đúng loại file.',
                        //     buttons: [
                        //         {
                        //             label: 'OK', onClick: () => {
                        //             }
                        //         }
                        //     ]
                        // });
                    }
                } catch (e) {
                    console.error("Lỗi khi tải cấu trúc tiệp:", e);
                }
            };

            reader.readAsArrayBuffer(file);
        }
    };

    const handleSubmit = async () => {
        // if (!selectedFileType) {
        //     alert("Vui lòng chọn loại báo cáo");
        //     return;
        // }

        setLoading(true);
        try {
            const formData = new FormData();
            const user = JSON.parse(localStorage.getItem("username"));
            const file = inputRef.current?.files[0];

            // Nếu có file mới, thêm vào formData
            if (file) {
                formData.append("filename", file);
                formData.append("remove_file", "1");
            }
            // console.log(file);

            formData.append("id_user", user.id);
            formData.append("id_xa", user.id_xa);
            formData.append("id_loaibaocao", report.id_loaibaocao);
            formData.append("year_report", year);
            formData.append("number_report", numberYear);

            if (week) formData.append("week_report", week);
            if (month) formData.append("month_report", month);
            if (quarter) formData.append("quarterly_report", quarter);
            if (numberYear) formData.append("number_report", numberYear);

            // Gửi yêu cầu cập nhật
            for (let pair of formData.entries()) {
                console.log(pair[0]+ ': ' + pair[1]);
            }
            const responsedata=await api.post(`/reports-update/${report.id}`, formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            // console.log(responsedata);
            // console.log(datapost.current);
            // Nếu có file mới, xóa dữ liệu cũ và thêm dữ liệu mới
            if (file) {
                await api.delete(`/report-data-list/${report.id}`);
                await api.post("/report-data-bulk-insert", { records: datapost.current });
            }

            alert("✅ Cập nhật báo cáo thành công!");
            onUpdateSuccess();
            onClose();
        } catch (err) {
            console.error("❌ Lỗi cập nhật báo cáo:", err);
            alert("❌ Cập nhật thất bại. Vui lòng thử lại.");
        } finally {
            setLoading(false);
        }
    };

    const handleClickUpload = () => inputRef.current.click();

    useEffect(() => {
        if (open && report?.fileUrl) {
            // Load file hiện tại để preview khi mở modal
            fetch(report.fileUrl)
                .then(response => response.arrayBuffer())
                .then(buffer => {
                    const workbook = new ExcelJS.Workbook();
                    return workbook.xlsx.load(buffer);
                })
                .then(workbook => {
                    const worksheet = workbook.worksheets[0];
                    const jsonData = [];
                    const totalRows = Math.min(worksheet.rowCount, 50); // Giới hạn số dòng

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
                        }
                        jsonData.push(rowData);
                    }

                    setPreviewData(jsonData);
                })
                .catch(err => {
                    console.error("Lỗi khi tải file hiện tại:", err);
                });
        }
    }, [open, report]);

    useEffect(() => {
        if (open && previewData.length > 0) {
            const container = document.getElementById("handsontable-preview");
            if (container) {
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
                        cellProperties.className = 'htCenter htMiddle';
                        return cellProperties;
                    },
                    customBorders: [
                        {
                            range: {
                                from: { row: 0, col: 0 },
                                to: { row: 9, col: previewData[0]?.length - 1 || 4 },
                            },
                            top: { width: 1, color: '#000' },
                            left: { width: 1, color: '#000' },
                            bottom: { width: 1, color: '#000' },
                            right: { width: 1, color: '#000' },
                        }
                    ]
                });

                // Gán lại instance để destroy lần sau
                container.handsontableInstance = hot;
            }
        }
    }, [open, previewData]);
    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="lg"
            fullWidth
            TransitionComponent={Fade}
        >
            <DialogTitle>
                Cập nhật báo cáo
                <IconButton
                    onClick={onClose}
                    sx={{ position: 'absolute', right: 8, top: 8 }}
                >
                    <X size={20} />
                </IconButton>
            </DialogTitle>

            <DialogContent dividers>
                <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                        <Grid container spacing={2}>
                            {
                                report?.report_type && (
                                <Grid item xs={6}>
                                    <Typography variant="body1">
                                        <strong>Loại báo cáo:</strong> {report.report_type}
                                    </Typography>
                                </Grid>
                            )}
                            {report?.week_report && (
                                <Grid item xs={6}>
                                    <Typography variant="body1">
                                        <strong>Tuần:</strong> {report.week_report}
                                    </Typography>
                                </Grid>
                            )}

                            {report?.month_report && (
                                <Grid item xs={6}>
                                    <Typography variant="body1">
                                        <strong>Tháng:</strong> {report.month_report}
                                    </Typography>
                                </Grid>
                            )}

                            {report?.quarterly_report && (
                                <Grid item xs={6}>
                                    <Typography variant="body1">
                                        <strong>Quý:</strong> {report.quarterly_report}
                                    </Typography>
                                </Grid>
                            )}

                            {report?.number_report && (
                                <Grid item xs={6}>
                                    <Typography variant="body1">
                                        <strong>Lần:</strong> {report.number_report}
                                    </Typography>
                                </Grid>
                            )}

                            <Grid item xs={6}>
                                <Typography variant="body1">
                                    <strong>Năm:</strong> {report?.year_report || year}
                                </Typography>
                            </Grid>

                            {/* Ẩn các trường này nhưng vẫn gửi giá trị khi submit */}
                            <input type="hidden" name="id_loaibaocao" value={report?.id_loaibaocao} />
                            {/*<input type="hidden" name="week_report" value={week} />*/}
                            <input type="hidden" name="month_report" value={month} />
                            <input type="hidden" name="quarterly_report" value={quarter} />
                            <input type="hidden" name="number_report" value={numberYear} />
                            <input type="hidden" name="year_report" value={year} />
                        </Grid>

                        <Box mt={3}>
                            <input
                                type="file"
                                ref={inputRef}
                                style={{ display: 'none' }}
                                onChange={handleFileChange}
                                accept=".xlsx,.xls"
                                disabled={loading}
                            />
                            <Button
                                fullWidth
                                variant="outlined"
                                startIcon={<UploadFileIcon />}
                                onClick={handleClickUpload}
                                disabled={loading}
                            >
                                Chọn file mới
                            </Button>
                            {fileName && (
                                <Typography variant="caption" color="success.main">
                                    File mới: {fileName}
                                </Typography>
                            )}
                            {!fileName && (
                                <Typography variant="caption">
                                    File hiện tại: {report?.filename}
                                </Typography>
                            )}
                        </Box>
                    </Grid>

                    <Grid item xs={12} md={6} class="w-1/2">
                        <Typography variant="subtitle1" gutterBottom>
                            Xem trước dữ liệu
                        </Typography>
                        <Box
                            id="handsontable-preview"
                            sx={{
                                height: 300,
                                border: '1px solid #ddd',
                                borderRadius: 1,
                                overflow: 'hidden'
                            }}
                        />
                    </Grid>
                </Grid>
            </DialogContent>

            <DialogActions>
                <Button onClick={onClose} disabled={loading}>
                    Hủy
                </Button>
                <Button
                    onClick={handleSubmit}
                    variant="contained"
                    color="primary"
                    disabled={loading}
                    startIcon={loading ? <CircularProgress size={20} /> : null}
                >
                    {loading ? 'Đang xử lý...' : 'Cập nhật'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default function ReportHistory() {
    // Filter state
    const [fileTypes, setFileTypes] = useState([]);
    const [selectedFileType, setSelectedFileType] = useState("");
    const [week, setWeek] = useState("");
    const [month, setMonth] = useState("");
    const [quarter, setQuarter] = useState("");
    const [year, setYear] = useState(currentYear);
    const [numberYear, setNumberYear] = useState("");

    // Data state
    const [reports, setReports] = useState([]);
    const [loadingReports, setLoadingReports] = useState(false);
    const [open, setOpen] = useState(false);
    const [selectedReport, setSelectedReport] = useState(null);
    const [editOpen, setEditOpen] = useState(false);
    const [editReport, setEditReport] = useState(null);
    const [deletingId, setDeletingId] = useState(null);

    // Derived value for conditional UI
    const selectedType = parseInt(selectedFileType);

    /* -------------------- API Calls -------------------- */
    const fetchFileTypes = async () => {
        try {
            const { data } = await api.get("/loaibaocao");
            setFileTypes(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error("Lỗi khi tải loại báo cáo:", err);
        }
    };

    const fetchReports = async (reset = false) => {
        setLoadingReports(true);
        try {
            const params = {};
            const user = JSON.parse(localStorage.getItem("username"));
            if (!reset) {
                if (selectedFileType) params.id_loaibaocao = selectedFileType;
                if (week) params.week_report = week;
                if (user.id_xa!=null) params.id_xa = user.id_xa;
                if (month) params.month_report = month;
                if (quarter) params.quarterly_report = quarter;
                if (year) params.year_report = year;
                if (numberYear) params.number_report = numberYear;
            }
            const { data } = await api.get("/reports/filter", { params });
            // Sort by updated_at (mới nhất trước)
            const sorted = [...data].sort(
                (a, b) => new Date(b.updated_at) - new Date(a.updated_at)
            );
            // console.log(sorted);
            setReports(sorted);
        } catch (err) {
            console.error("Lỗi khi tải danh sách báo cáo:", err);
            setReports([]);
        } finally {
            setLoadingReports(false);
        }
    };
    // Thêm state mới
// Cập nhật hàm handleDelete
    const handleDelete = async (report) => {
        if (window.confirm("Bạn có chắc chắn muốn xóa báo cáo này không?")) {
            try {
                setDeletingId(report.id); // Bắt đầu loading

                await api.delete(`/reports/${report.id}`);
                setReports(prev => prev.filter(r => r.id !== report.id));

                alert("✅ Xóa báo cáo thành công!");
            } catch (err) {
                console.error("❌ Lỗi khi xóa báo cáo:", err);
                alert("❌ Xóa thất bại. Vui lòng thử lại.");
            } finally {
                setDeletingId(null); // Dừng loading
            }
        }
    };

    useEffect(() => {
        fetchFileTypes();
        fetchReports(); // initial list
    }, [selectedFileType, week, month, quarter, year, numberYear]);

    /* -------------------- Modal handlers -------------------- */
    const handleOpen = (report) => {
        setSelectedReport(report);
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
        setSelectedReport(null);
    };

    const handleEditOpen = (report) => {
        setEditReport(report);
        setEditOpen(true);
    };


    const handleEditClose = () => {
        setEditOpen(false);
        setEditReport(null);
    };

    const handleUpdateSuccess = () => {
        fetchReports();
    };
     const handleDownload = async (filename) => {
        try {
            const response = await api.post(
                "/downloadExcel",
                { filename },
                { responseType: "blob" } // 👈 quan trọng: trả về dạng blob
            );

            // response.data lúc này là blob
            const blob = new Blob([response.data], {
                type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            });

            // Tạo URL tạm để tải file
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = filename || "mau.xlsx";
            document.body.appendChild(a);
            a.click();

            // Dọn dẹp
            a.remove();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error("❌ Lỗi tải file:", error);
            alert("Không thể tải file. Vui lòng thử lại.");
        }
    };

    /* -------------------- JSX -------------------- */
    return (
        <TableHearder title="Lịch sử nộp báo cáo">
            <div className="p-6 bg-gray-50 min-h-screen">
                <Typography variant="h5" className="font-bold mb-4">
                    Danh sách báo cáo
                </Typography>

                {/* ----------------- Bộ lọc ----------------- */}
                <Box mb={3} className="bg-white rounded-2xl shadow p-4">
                    <Grid container spacing={2} alignItems="flex-end">
                        <Grid item xs={12} sm={4} md={3} lg={2} sx={{ minWidth: 150 }}>
                            <FormControl fullWidth>
                                <InputLabel>Loại báo cáo</InputLabel>
                                <Select
                                    label="Loại báo cáo"
                                    value={selectedFileType}
                                    onChange={(e) => setSelectedFileType(e.target.value)}
                                >
                                    <MenuItem value="">Tất cả</MenuItem>
                                    {fileTypes.map((type) => (
                                        <MenuItem key={type.id} value={type.id}>
                                            {type.name}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>

                        {/*{selectedType === 1 && (*/}
                        {/*    <Grid item xs={6} sm={3} md={2} sx={{ minWidth: 150 }}>*/}
                        {/*        <FormControl fullWidth>*/}
                        {/*            <InputLabel>Tuần</InputLabel>*/}
                        {/*            <Select*/}
                        {/*                label="Tuần"*/}
                        {/*                value={week}*/}
                        {/*                onChange={(e) => setWeek(e.target.value)}*/}
                        {/*            >*/}
                        {/*                <MenuItem value="">Tất cả</MenuItem>*/}
                        {/*                {weeks.map((w) => (*/}
                        {/*                    <MenuItem key={w} value={w}>*/}
                        {/*                        Tuần {w}*/}
                        {/*                    </MenuItem>*/}
                        {/*                ))}*/}
                        {/*            </Select>*/}
                        {/*        </FormControl>*/}
                        {/*    </Grid>*/}
                        {/*)}*/}

                        {(selectedType === 1 || selectedType === 2) && (
                            <Grid item xs={6} sm={3} md={2} sx={{ minWidth: 150 }}>
                                <FormControl fullWidth>
                                    <InputLabel>Tháng</InputLabel>
                                    <Select
                                        label="Tháng"
                                        value={month}
                                        onChange={(e) => setMonth(e.target.value)}
                                    >
                                        <MenuItem value="">Tất cả</MenuItem>
                                        {months.map((m) => (
                                            <MenuItem key={m} value={m}>
                                                Tháng {m}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>
                        )}

                        {selectedType === 3 && (
                            <Grid item xs={6} sm={3} md={2} sx={{ minWidth: 150 }}>
                                <FormControl fullWidth>
                                    <InputLabel>Quý</InputLabel>
                                    <Select
                                        label="Quý"
                                        value={quarter}
                                        onChange={(e) => setQuarter(e.target.value)}
                                    >
                                        <MenuItem value="">Tất cả</MenuItem>
                                        {quarters.map((q) => (
                                            <MenuItem key={q} value={q}>
                                                Quý {q}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>
                        )}
                        {selectedType === 4 && (
                            <Grid item xs={12} sm={4} sx={{ minWidth: 150 }}>
                                <FormControl fullWidth><InputLabel>Lần</InputLabel>
                                    <Select label="Quý" value={numberYear} onChange={(e) => setNumberYear(e.target.value)}>{numberYears.map(q => (
                                        <MenuItem key={q} value={q}>lần {q}</MenuItem>))}
                                    </Select>
                                </FormControl></Grid>)
                        }

                        <Grid item xs={6} sm={3} md={2} sx={{ minWidth: 150 }}>
                            <FormControl fullWidth>
                                <InputLabel>Năm</InputLabel>
                                <Select
                                    label="Năm"
                                    value={year}
                                    onChange={(e) => setYear(e.target.value)}
                                >
                                    {years.map((y) => (
                                        <MenuItem key={y} value={y}>
                                            Năm {y}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>

                        <Grid item xs={12} sm={6} md={3} lg={2}>
                            <Box display="flex" gap={1}>
                                <Button
                                    variant="contained"
                                    color="primary"
                                    fullWidth
                                    onClick={fetchReports}
                                >
                                    Lọc
                                </Button>
                                <Button
                                    variant="outlined"
                                    fullWidth
                                    onClick={() => {
                                        setSelectedFileType("");
                                        setWeek("");
                                        setMonth("");
                                        setQuarter("");
                                        setYear(currentYear);
                                        setTimeout(fetchReports(true),1000);
                                    }}
                                >
                                    Reset
                                </Button>
                            </Box>
                        </Grid>
                    </Grid>
                </Box>

                {/* ------------- Danh sách báo cáo ------------- */}
                <div className="shadow rounded-2xl overflow-hidden bg-white">
                    {loadingReports ? (
                        <Box p={5} textAlign="center">
                            <CircularProgress />
                        </Box>
                    ) : (
                        <Table>
                            <TableHead className="bg-gray-100">
                                <TableRow>
                                    <TableCell className="font-semibold">Tên báo cáo</TableCell>
                                    <TableCell className="font-semibold">Tên file</TableCell>
                                    <TableCell className="font-semibold">Loại báo cáo</TableCell>
                                    <TableCell className="font-semibold">Ngày tạo</TableCell>
                                    <TableCell className="font-semibold">Ngày cập nhật</TableCell>
                                    <TableCell className="font-semibold text-center">Hành động</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {reports.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} align="center">
                                            Không có báo cáo nào phù hợp.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    reports.map((report) => (
                                        <TableRow key={report.id} hover>
                                            <TableCell>
                                                {report.id_loaibaocao===1?`BC Tuần ${report.week_report}`:
                                                    report.id_loaibaocao===2?((report.month_report===3)?" BC Quý 1":(report.month_report===6)?" BC 6 Tháng":(report.month_report===6)?" BC 9 Tháng":` Tháng ${report.month_report}`):
                                                ""
                                                }
                                                {/*{report.week_report != null ? ` Tuần ${report.week_report}` : ""}*/}
                                                {/*{report.month_report != null ? ` Tháng ${report.month_report}` : ""}*/}
                                                {/*{report.quarterly_report != null*/}
                                                {/*    ? report.quarterly_report > 1*/}
                                                {/*        ? ` Quý ${report.quarterly_report}`*/}
                                                {/*        : `${report.quarterly_report} Tháng`*/}
                                                {/*    : ""}*/}
                                                {report.number_report != null ? ` Lần ${report.number_report}` : ""}
                                                {report.year_report != null ? ` Năm ${report.year_report}` : ""}
                                            </TableCell>
                                            <TableCell>{report.filename}</TableCell>
                                            <TableCell>{report.report_type}</TableCell>
                                            <TableCell>
                                                {new Date(report.created_at).toLocaleDateString("vi-VN")}
                                            </TableCell>
                                            <TableCell>
                                                {new Date(report.updated_at).toLocaleDateString("vi-VN")}
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <Button
                                                    variant="contained"
                                                    size="small"
                                                    onClick={() => handleOpen(report)}
                                                    className="capitalize"
                                                >
                                                    Xem
                                                </Button>
                                                {/*<Button*/}
                                                {/*    variant="contained"*/}
                                                {/*    size="small"*/}
                                                {/*    color="success"*/}
                                                {/*    className="capitalize"*/}
                                                {/*    onClick={() => handleEditOpen(report)}*/}
                                                {/*>*/}
                                                {/*    Cập nhật*/}
                                                {/*</Button>*/}
                                                <Button
                                                    variant="contained"
                                                    size="small"
                                                    color="warning"
                                                    className="capitalize"
                                                    onClick={() => handleDelete(report)}
                                                    disabled={deletingId === report.id}
                                                >
                                                    {deletingId === report.id ? (
                                                        <CircularProgress size={20} />
                                                    ) : (
                                                        "Xóa"
                                                    )}
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    )}
                </div>

                {/* ---------------- Modal xem báo cáo ---------------- */}
                <Modal open={open} onClose={handleClose} closeAfterTransition>
                    <Box className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl shadow-lg p-4 w-[90vw] md:w-[70vw] lg:w-[60vw] max-h-[90vh] overflow-hidden">
                        <div className="flex items-center justify-between mb-2">
                            <Typography variant="h6" component="h2">
                                {selectedReport?.filename}
                            </Typography>
                            <IconButton onClick={handleClose}>
                                <X />
                            </IconButton>
                        </div>

                        {selectedReport && (
                            <XlsxPreview fileUrl={selectedReport.fileUrl} filename={selectedReport.filename} report={selectedReport} />
                        )}

                         {selectedReport && (
                            <button
                                onClick={() => handleDownload(selectedReport.filename)}
                                className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl shadow hover:bg-blue-700 transition"
                            >
                                <Download size={18} /> Tải xuống
                            </button>
                        )}
                    </Box>
                </Modal>

                {/* ---------------- Modal cập nhật báo cáo ---------------- */}
                <EditReportModal
                    open={editOpen}
                    onClose={handleEditClose}
                    report={editReport}
                    fileTypes={fileTypes}
                    onUpdateSuccess={handleUpdateSuccess}
                />
            </div>
        </TableHearder>
    );
}