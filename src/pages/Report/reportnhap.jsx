// ReportAll.jsx
import React, { useState, useEffect } from "react";
import {
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Grid,
    Chip,
    CircularProgress,
} from "@mui/material";
import { Download, X } from "lucide-react";
import axios from "axios";
import api from "@/config";
import XlsxPreview from "@/components/XlsxPreview";
import TableHearder from "@/components/Table/TableHearder";

const currentYear = new Date().getFullYear();
const years = Array.from({ length: 10 }, (_, i) => currentYear - i);
const months = Array.from({ length: 12 }, (_, i) => i + 1);
const quarters = [1, 2, 3, 4];
const weeks = [1, 2, 3, 4, 5];
const numberYears = [1, 2];



const typeColors = {
    'Tuần': 'bg-blue-100 text-blue-800',
    'Tháng': 'bg-green-100 text-green-800',
    'Quý': 'bg-purple-100 text-purple-800',
    'Năm': 'bg-orange-100 text-orange-800',
};

const statusColors = {
    'Chờ duyệt': 'bg-yellow-100 text-yellow-800',
    'Đã duyệt': 'bg-green-100 text-green-800',
    'Từ chối': 'bg-red-100 text-red-800',
};

export default function ReportAll() {
    const [fileTypes, setFileTypes] = useState([]);
    const [selectedFileType, setSelectedFileType] = useState("");
    const [week, setWeek] = useState("");
    const [month, setMonth] = useState("");
    const [quarter, setQuarter] = useState("");
    const [year, setYear] = useState(currentYear);
    const [numberYear, setNumberYear] = useState("");
    const [reports, setReports] = useState([]);
    const [loadingReports, setLoadingReports] = useState(false);
    const [open, setOpen] = useState(false);
    const [selectedReport, setSelectedReport] = useState(null);

    const selectedType = parseInt(selectedFileType);

    useEffect(() => {
        fetchFileTypes();
    }, []);

    useEffect(() => {
        fetchReports();
    }, [selectedFileType, week, month, quarter, year, numberYear]);

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
            if (!reset) {
                if (selectedFileType) params.id_loaibaocao = selectedFileType;
                if (week) params.week_report = week;
                if (month) params.month_report = month;
                if (quarter) params.quarterly_report = quarter;
                if (year) params.year_report = year;
                if (numberYear) params.number_year = numberYear;
            }
            const { data } = await api.get("/reports/filter", { params });
            const sorted = [...data].sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));
            setReports(sorted);
        } catch (err) {
            console.error("Lỗi khi tải danh sách báo cáo:", err);
            setReports([]);
        } finally {
            setLoadingReports(false);
        }
    };

    const handleOpen = (report) => {
        setSelectedReport(report);
        setOpen(true);
    };
    const handleClose = () => {
        setOpen(false);
        setSelectedReport(null);
    };

    return (
        <TableHearder title="Danh sách các báo cáo">
            <div className="p-6 bg-gray-50">
                <div className="bg-white rounded-2xl shadow p-4 mb-4">
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={4} md={3} lg={2} sx={{ minWidth: 150 }}>
                            <FormControl fullWidth>
                                <InputLabel>Loại báo cáo</InputLabel>
                                <Select
                                    value={selectedFileType}
                                    onChange={(e) => setSelectedFileType(e.target.value)}
                                    label="Loại báo cáo"

                                >
                                    <MenuItem value="">Tất cả</MenuItem>
                                    {fileTypes.map((type) => (
                                        <MenuItem key={type.id} value={type.id}>{type.name}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                        {selectedType === 1 && (
                            <Grid item xs={6} sm={3} md={2} sx={{ minWidth: 150 }}>
                                <FormControl fullWidth>
                                    <InputLabel>Tuần</InputLabel>
                                    <Select value={week} onChange={(e) => setWeek(e.target.value)} label="Tuần">
                                        <MenuItem value="">Tất cả</MenuItem>
                                        {weeks.map((w) => (
                                            <MenuItem key={w} value={w}>Tuần {w}</MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>
                        )}
                        {(selectedType === 1 || selectedType === 2) && (
                            <Grid item xs={6} sm={3} md={2} sx={{ minWidth: 150 }}>
                                <FormControl fullWidth>
                                    <InputLabel>Tháng</InputLabel>
                                    <Select value={month} onChange={(e) => setMonth(e.target.value)} label="Tháng">
                                        <MenuItem value="">Tất cả</MenuItem>
                                        {months.map((m) => (
                                            <MenuItem key={m} value={m}>Tháng {m}</MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>
                        )}
                        {selectedType === 3 && (
                            <Grid item xs={6} sm={3} md={2} sx={{ minWidth: 150 }}>
                                <FormControl fullWidth>
                                    <InputLabel>Quý</InputLabel>
                                    <Select value={quarter} onChange={(e) => setQuarter(e.target.value)} label="Quý">
                                        <MenuItem value="">Tất cả</MenuItem>
                                        {quarters.map((q) => (
                                            <MenuItem key={q} value={q}>Quý {q}</MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>
                        )}
                        {selectedType === 4 && (
                            <Grid item xs={12} sm={4} sx={{ minWidth: 150 }}>
                                <FormControl fullWidth>
                                    <InputLabel>Lần</InputLabel>
                                    <Select value={numberYear} onChange={(e) => setNumberYear(e.target.value)} label="Lần">
                                        {numberYears.map((n) => (
                                            <MenuItem key={n} value={n}>Lần {n}</MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>
                        )}
                        <Grid item xs={6} sm={3} md={2} sx={{ minWidth: 150 }}>
                            <FormControl fullWidth>
                                <InputLabel>Năm</InputLabel>
                                <Select value={year} onChange={(e) => setYear(e.target.value)} label="Năm">
                                    {years.map((y) => (
                                        <MenuItem key={y} value={y}>Năm {y}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={6} md={3} lg={2} sx={{ minWidth: 150 }}>
                            <div className="flex gap-2">
                                <button
                                    onClick={fetchReports}
                                    className="bg-blue-600 text-white px-4 py-2 rounded w-full hover:bg-blue-700"
                                >
                                    Lọc
                                </button>
                                <button
                                    onClick={() => {
                                        setSelectedFileType("");
                                        setSelectedCommune("");
                                        setWeek("");
                                        setMonth("");
                                        setQuarter("");
                                        setYear(currentYear);
                                        fetchReports(true);
                                    }}
                                    className="border border-gray-400 px-4 py-2 rounded w-full hover:bg-gray-100"
                                >
                                    Reset
                                </button>
                            </div>
                        </Grid>
                    </Grid>
                </div>

                {loadingReports ? (
                    <div className="p-5 text-center text-gray-500">
                        <CircularProgress size={24} /> Đang tải dữ liệu...
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {reports.map((report) => (
                            <div key={report.id} className="bg-white rounded-xl shadow p-4 space-y-2">
                                <div className="flex justify-between items-start">
                                    <h3 className="font-semibold text-sm text-gray-800 truncate w-3/4">{report.filename}</h3>
                                    <Chip
                                        label={report.report_type}
                                        className={`text-xs ${typeColors[report.report_type] || 'bg-gray-100 text-gray-800'}`}
                                        size="small"
                                    />
                                </div>
                                <div className="text-xs text-gray-600">Ngày tạo: {new Date(report.created_at).toLocaleDateString("vi-VN")}</div>
                                <div className="text-xs text-gray-600">Ngày cập nhật: {new Date(report.updated_at).toLocaleDateString("vi-VN")}</div>
                                {report.total_commune && (
                                    <div className="text-xs font-medium text-gray-700">Số xã đã nộp: {report.total_commune}</div>
                                )}
                                <Chip
                                    label={report.status || 'Chờ duyệt'}
                                    className={`text-xs ${statusColors[report.status] || 'bg-yellow-100 text-yellow-800'}`}
                                    size="small"
                                />
                                <button
                                    onClick={() => handleOpen(report)}
                                    className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 w-full"
                                >
                                    Xem chi tiết
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                {open && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-2xl shadow-lg p-6 w-[90vw] md:w-[70vw] lg:w-[60vw] max-h-[90vh] overflow-auto">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-lg font-semibold">{selectedReport?.filename}</h2>
                                <button onClick={handleClose} className="text-gray-600 hover:text-red-500">
                                    <X size={20} />
                                </button>
                            </div>
                            {selectedReport && (
                                <XlsxPreview fileUrl={selectedReport.fileUrl} filename={selectedReport.filename} />
                            )}
                            {selectedReport && (
                                <a
                                    href={selectedReport.fileUrl}
                                    download
                                    className="mt-4 inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700"
                                >
                                    <Download size={18} /> Tải xuống
                                </a>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </TableHearder>
    );
}
