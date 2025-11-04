import React, { useState, useEffect } from "react";
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
} from "@mui/material";
import { Download, X } from "lucide-react";
import TableHearder from "../../components/Table/TableHearder";
import axios from "axios";
import api from "@/config";
import XlsxPreview from "@/components/XlsxPreview";

// Constants for filter selectors
const currentYear = new Date().getFullYear();
const years = Array.from({ length: 10 }, (_, i) => currentYear - i);
const months = Array.from({ length: 12 }, (_, i) => i + 1);
const quarters = [1, 2, 3, 4];
// const weeks = [1, 2, 3, 4, 5];
const numberYears = [1, 2];
// Axios instance with auth header interceptor
export default function ReportAdmin() {
    /* -------------------- Local state -------------------- */
    // Filter state
    const [fileTypes, setFileTypes] = useState([]);
    const [selectedFileType, setSelectedFileType] = useState("");
    const [week, setWeek] = useState("");
    const [month, setMonth] = useState("");
    const [quarter, setQuarter] = useState("");
    const [year, setYear] = useState(currentYear);
    const [numberYear, setNumberYear] = useState("");
    // NEW: commune (xã) filter state
    const [communes, setCommunes] = useState([]);
    const [selectedCommune, setSelectedCommune] = useState("");

    // Data state
    const [reports, setReports] = useState([]);
    const [loadingReports, setLoadingReports] = useState(false);
    const [open, setOpen] = useState(false);
    const [selectedReport, setSelectedReport] = useState(null);

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

    // NEW: Lấy danh sách xã (communes)
    const fetchCommunes = async () => {
        try {
            const { data } = await api.get("/xas");
            setCommunes(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error("Lỗi khi tải danh sách xã:", err);
        }
    };

    const fetchReports = async (reset = false) => {
        setLoadingReports(true);
        try {
            const params = {};
            if (!reset) {
                if (selectedFileType) params.id_loaibaocao = selectedFileType;
                if (week) params.week_report = week;
                // Ưu tiên filter theo selectedCommune, nếu không chọn thì fallback id_xa của user (nếu có)
                if (selectedCommune) params.id_xa = selectedCommune;
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
            console.log(data);
            setReports(sorted);
        } catch (err) {
            console.error("Lỗi khi tải danh sách báo cáo:", err);
            setReports([]);
        } finally {
            setLoadingReports(false);
        }
    };
    /* -------------------- Effects -------------------- */
    useEffect(() => {
        fetchFileTypes();
        fetchCommunes();
    }, []);

    // Re‑fetch reports when any filter changes
    useEffect(() => {
        fetchReports();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedFileType, week, month, quarter, year, selectedCommune,numberYear]);

    /* -------------------- Modal handlers -------------------- */
    const handleOpen = (report) => {
        setSelectedReport(report);
        setOpen(true);
    };
    const handleClose = () => {
        setOpen(false);
        setSelectedReport(null);
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
        <TableHearder title="Danh sách các báo cáo">
            <div className="p-6 bg-gray-50 min-h-screen">
                <Typography variant="h5" className="font-bold mb-4">
                    Danh sách báo cáo
                </Typography>
                {/* ----------------- Bộ lọc ----------------- */}
                <Box mb={3} className="bg-white rounded-2xl shadow p-4">
                    <Grid container spacing={2} alignItems="flex-end">
                        {/* ----------- Loại báo cáo ----------- */}
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

                        {/* ----------- NEW: Xã ----------- */}
                        <Grid item xs={12} sm={4} md={3} lg={2} sx={{ minWidth: 150 }}>
                            <FormControl fullWidth>
                                <InputLabel>Xã</InputLabel>
                                <Select
                                    label="Xã"
                                    value={selectedCommune}
                                    onChange={(e) => setSelectedCommune(e.target.value)}
                                >
                                    <MenuItem value="">Tất cả</MenuItem>
                                    {communes.map((xa) => (
                                        <MenuItem key={xa.id} value={xa.id}>
                                            {xa.ten_xa || xa.name}
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
                                </FormControl>
                            </Grid>)
                        }
                        {/* ----------- Năm ----------- */}
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

                        {/* ----------- Buttons ----------- */}
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
                                        setSelectedCommune("");
                                        setWeek("");
                                        setMonth("");
                                        setQuarter("");
                                        setYear(currentYear);
                                        fetchReports(true);
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
                                    <TableCell className="font-semibold">Xã</TableCell>
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
                                            <TableCell>{report.xa?.ten_xa}</TableCell>
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

                        {/* Nếu chọn báo cáo, hiển thị file */}
                        {selectedReport && (
                            <XlsxPreview fileUrl={selectedReport.fileUrl} filename={selectedReport.filename} report={selectedReport} />
                        )}

                        {/* Nút tải xuống */}
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
            </div>
        </TableHearder>
    );
}
