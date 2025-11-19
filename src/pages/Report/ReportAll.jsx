import React, { useState, useEffect } from "react";
import {
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Grid,
    Card,
    CardContent,
    Typography,
    Button,
    Modal,
    IconButton,
    Box,
} from "@mui/material";
import { X, Download } from "lucide-react";
import axios from "axios";
import api from "@/config";
import TableHearder from "@/components/Table/TableHearder";
import DownloadExcelButton from "@/components/ReportModal/DownloadBaoCaoAll.jsx";
import dayjs from 'dayjs';


import isoWeek from 'dayjs/plugin/isoWeek';

dayjs.extend(isoWeek);
// Lấy số tuần trong một năm bất kỳ
const currentYear = new Date().getFullYear();
const currentMonth = new Date().getMonth() + 1;
const years = Array.from({ length: 10 }, (_, i) => currentYear - i);
const cardColorsMui = {
    1: "#DBEAFE", // blue-100
    2: "#DCFCE7", // green-100
    3: "#FEF9C3", // yellow-100
    4: "#E9D5FF", // purple-100
};
export default function ReportAll() {
    const [fileTypes, setFileTypes] = useState([]);
    const [selectedFileType, setSelectedFileType] = useState(1);
    const [month, setMonth] = useState(currentMonth);
    const [year, setYear] = useState(currentYear);
    const [reportStats, setReportStats] = useState({});
    const [open, setOpen] = useState(false);
    const [selectedReport, setSelectedReport] = useState(null);
    const [statsData, setStatsData] = useState({});
    const [loading, setLoading] = useState(false);
    useEffect(() => {
        fetchFileTypes();
        fetchStats(); // Load dữ liệu ban đầu
    }, []);
    const fetchFileTypes = async () => {``
        try {
            const { data } = await api.get("/loaibaocao");
            setFileTypes(Array.isArray(data) ? data : []);
            // console.log(Array.isArray(data) ? data : []);
            // setFileTypes(fileTypes => fileTypes.map(t => t.id === 4 ? t.name="Theo năm + 06 tháng + 09 tháng " : t))
        } catch (err) {
            console.error("Lỗi khi tải loại báo cáo:", err);
        }
    };
    // Monday-based; Week 1 = week containing Jan 1
    function week1Monday(year) {
        const jan1 = new Date(year, 0, 1);
        const dowMon0 = (jan1.getDay() + 6) % 7; // Mon=0..Sun=6
        const m = new Date(jan1);
        m.setDate(jan1.getDate() - dowMon0);
        m.setHours(0,0,0,0);
        return m;
    }

    // Trả 52 hoặc 53 theo quy tắc trên


    // Trả {year, week} để xử lý giao thoa cuối năm
    function getVNWeekYear(date) {
        const d = new Date(date);
        const dowMon0 = (d.getDay() + 6) % 7;
        const monday = new Date(d);
        monday.setDate(d.getDate() - dowMon0);
        monday.setHours(0,0,0,0);

        const y = d.getFullYear();
        const w1Curr = week1Monday(y);
        const w1Next = week1Monday(y + 1);

        let weekYear;
        if (monday < w1Curr) weekYear = y - 1;
        else if (monday >= w1Next) weekYear = y + 1;
        else weekYear = y;

        const w1 = week1Monday(weekYear);
        const week = Math.floor((monday - w1) / (7 * 24 * 60 * 60 * 1000)) + 1;

        return { year: weekYear, week };
    }
    function getVNWeeksInYear(year) {
        const w1 = week1Monday(year);
        const w1next = week1Monday(year + 1);
        const weeks = Math.floor((w1next - w1) / (7 * 24 * 60 * 60 * 1000));
        return weeks; // 52 hoặc 53
    }
    const fetchStats = async () => {
        setLoading(true);
        try {
            const params = {
                id_loaibaocao: selectedFileType,
                year,
                ...(selectedFileType === 1 && { month })
            };
            const { data } = await api.get("/report/checkthongke", { params });
            setStatsData(data);
            console.log(data);
        } catch (err) {
            console.error("Lỗi khi tải thống kê:", err);
        } finally {
            setLoading(false);
        }
    };
    const handleFilter = () => {
        fetchStats(); // Gọi API khi click nút lọc
    };
    const handleReset = () => {
        setSelectedFileType(1);
        setMonth(currentMonth);
        setYear(currentYear);
        // Không gọi API ngay ở đây, useEffect sẽ tự động xử lý
    };
    useEffect(() => {
        if (selectedFileType && year) {
            fetchStats();
        }
    }, [selectedFileType, year, month]);
    const testcurrent= ()=>{
       console.log(  year,
                month,
                quarter,
                week,
                selectedFileType,
                number)
    }
    // console.log(getVNWeekYear('2025-12-29'));
    const getCards = () => {
        const type = parseInt(selectedFileType);
        let count = 0;
        if (type === 1) count = getVNWeeksInYear(year);
        else if (type === 2) count = 12;
        else if (type === 3) count = 4;
        else if (type === 4) count = 4;
        return Array.from({ length: count }, (_, i) => {
            const id = i + 1;
            let stats = {};
            if (type === 1) stats = statsData.weeks?.[id] || {};
            else if (type === 2) stats = statsData.months?.[id] || {};
            else if (type === 3) stats = statsData.quaterlys?.[id] || {};
            else if (type === 4) stats = statsData.years?.[id] || {};
            return {
                type,
                id,
                filename:
                    type === 1
                        ? `Tuần ${id}`
                        : type === 2
                            ? `Tháng ${id}`:
                                 type === 3
                                ? `Quý ${id}`
                                : (type === 4) ?(id===3?`Báo cáo 06 tháng`:id===4?`Báo cáo 09 tháng`:`Lần ${id}`):`Lần ${id}`,
                stats
            };
        });
    };
    const handleOpen = (report) => {
        setReportStats({
            total: (report.stats?.submitted?.length || 0) + (report.stats?.not_submitted?.length || 0),
            submitted: report.stats?.submitted || [],
            not_submitted: report.stats?.not_submitted || [],
        });
        setSelectedReport(report);
        console.log(report);
        setOpen(true);
    };
    const handleClose = () => {
        setOpen(false);
        setSelectedReport(null);
    };
    const cards = getCards();

    return (
        <TableHearder title="Danh sách các báo cáo">
            <div className="p-6 bg-gray-50">
                <div className="bg-white rounded-2xl shadow p-4 mb-6">
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={4} md={3} lg={2}>
                            <FormControl fullWidth>
                                <InputLabel>Loại báo cáo</InputLabel>
                                <Select
                                    value={selectedFileType}
                                    onChange={(e) => setSelectedFileType(e.target.value)}
                                    label="Loại báo cáo"
                                >
                                    {fileTypes.map((type) => (

                                        <MenuItem key={type.id} value={type.id}>{ type.id===4?type.name +" + 06 tháng + 09 tháng":type.name}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>

                        {/*{parseInt(selectedFileType) === 1 && (*/}
                        {/*    <Grid item xs={6} sm={3} md={2}>*/}
                        {/*        <FormControl fullWidth>*/}
                        {/*            <InputLabel>Tháng</InputLabel>*/}
                        {/*            <Select*/}
                        {/*                value={month}*/}
                        {/*                onChange={(e) => setMonth(e.target.value)}*/}
                        {/*                label="Tháng"*/}
                        {/*            >*/}
                        {/*                {months.map((m) => (*/}
                        {/*                    <MenuItem key={m} value={m}>Tháng {m}</MenuItem>*/}
                        {/*                ))}*/}
                        {/*            </Select>*/}
                        {/*        </FormControl>*/}
                        {/*    </Grid>*/}
                        {/*)}*/}

                        <Grid item xs={6} sm={3} md={2}>
                            <FormControl fullWidth>
                                <InputLabel>Năm</InputLabel>
                                <Select
                                    value={year}
                                    onChange={(e) => setYear(e.target.value)}
                                    label="Năm"
                                >
                                    {years.map((y) => (
                                        <MenuItem key={y} value={y}>Năm {y}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>

                        <Grid item xs={12} sm={6} md={3} lg={2}>
                            <div className="flex gap-2">
                                <Button
                                    variant="contained"
                                    onClick={handleFilter}
                                    disabled={loading}
                                >
                                    {loading ? 'Đang tải...' : 'Lọc'}
                                </Button>
                                <Button
                                    variant="outlined"
                                    onClick={handleReset}
                                    disabled={loading}
                                >
                                    Reset
                                </Button>
                            </div>
                        </Grid>
                    </Grid>
                </div>

                {loading ? (
                    <div className="text-center py-8">Đang tải dữ liệu...</div>
                ) : (
                    <div className="flex flex-wrap justify-center gap-4">
                        {cards.map((report) => (
                            <Card
                                key={report.id}
                                sx={{
                                    backgroundColor: cardColorsMui[selectedFileType],
                                    width: { xs: "100%", sm: "45%", md: "22%" },
                                    borderRadius: 4,
                                    textAlign: "center",
                                    boxShadow: 3,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    p: 2,
                                }}
                            >
                                <CardContent>
                                    <Typography variant="h6">{report.filename}</Typography>
                                    <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
                                        Đã nộp {report.stats?.submitted?.length || 0} / {report.stats?.submitted?.length + report.stats?.not_submitted?.length || 0} Xã
                                    </Typography>
                                    <Button
                                        onClick={() => handleOpen(report)}
                                        variant="contained"
                                        size="small"
                                        disabled={loading}
                                    >
                                        Chi tiết và xuất báo cáo
                                    </Button>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
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
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[60vh] overflow-y-auto">
                            <div>
                                <Typography variant="subtitle1" className="mb-1 text-green-600">
                                    ✔️ Đã nộp ({(reportStats.submitted || []).length})
                                </Typography>
                                <ul className="list-disc list-inside text-green-700">
                                    {(reportStats.submitted || []).map((xa) => (
                                        
                                        <li key={xa.id} className={xa.is_late?"text-blue-700":"text-green-700"}>{xa.ten_xa}</li>
                                    ))}
                                </ul>
                            </div>

                            <div>
                                <Typography variant="subtitle1" className="mb-1 text-red-600">
                                    ❌ Chưa nộp ({(reportStats.not_submitted || []).length})
                                </Typography>
                                <ul className="list-disc list-inside text-red-600">
                                    {(reportStats.not_submitted || []).map((xa) => (
                                        <li key={xa.id}>{xa.ten_xa}</li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                        {/* <button onClick={}>test </button> */}
                        <DownloadExcelButton

                            loaibaocaoId={selectedFileType}
                            year={year}
                            month={(selectedFileType === 2) ? selectedReport?.id : undefined}
                            number={selectedFileType === 4 ? selectedReport?.id : undefined}
                            quarter={selectedFileType === 3 ? selectedReport?.id : undefined}
                            week={selectedFileType === 1 ? selectedReport?.id : undefined}
                        />
                    </Box>
                </Modal>
            </div>
        </TableHearder>
    );
}