import React, { useState, useEffect } from 'react';
import {
    Typography,
    CircularProgress,
    Checkbox,
    Card,
    CardContent,
    Grid,
    Box,
    Divider,
    FormControlLabel
} from '@mui/material';
import dayjs from 'dayjs';
import 'dayjs/locale/vi';
import duration from 'dayjs/plugin/duration';
import weekOfYear from 'dayjs/plugin/weekOfYear';
import customParseFormat from 'dayjs/plugin/customParseFormat';
dayjs.extend(customParseFormat);
dayjs.extend(weekOfYear);
dayjs.locale('vi');
dayjs.extend(duration);

const reportTypeMap = {
    1: 'weekly',
    2: 'monthly',
    3: 'quarterly',
    4: 'yearly'
};

const ReportNotificationScheduler = ({
                                         api,
                                         year,
                                         month,
                                         week,
                                         quarter,
                                         onSelectChange,
                                     }) => {
    const id_xa= JSON.parse(localStorage.getItem("username"))?.xa?.id;
    const [notifications, setNotifications] = useState([]);
    const [submittedReports, setSubmittedReports] = useState([]);
    const [selectedItemId, setSelectedItemId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [now, setNow] = useState(dayjs());

    const reportMapName = {
        1: `Nộp báo cáo Tuần `,
        2: `Nộp báo cáo Tháng `,
        3: `Nộp báo cáo`,
        4: `Nộp báo cáo Năm ${year}`
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const { data } = await api.get("/report-notifications");
                // console.log(year , month, week, id_xa, quarter);
                const { data: oldReport } = await api.post("/oldreportforuser", {year, month, week, id_xa, quarter,});
                setSubmittedReports(oldReport)
                setNotifications(data);
                // console.log(oldReport);
            } catch (err) {
                console.error("Lỗi khi tải thông báo:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [year,id_xa]);

    useEffect(() => {
        const timer = setInterval(() => setNow(dayjs()), 1000);
        return () => clearInterval(timer);
    }, []);
    useEffect(() => {
        if (typeof onSelectChange === 'function') {
            const selectedData = notifications.find(item => item.id === selectedItemId);
            if (selectedData) {
                const result = calculateTimes(selectedData);

                // Kiểm tra nếu đã nộp
                const isSubmitted = submittedReports.some(
                    (r) =>
                        r.id_loaibaocao === selectedData.id_loaibaocao &&
                        r.year_report === dayjs().year() &&
                        (
                            (r.month_report && r.month_report === (selectedData.month || dayjs().month() + 1)) ||
                            (r.quarterly_report && r.quarterly_report === selectedData.quarter) ||
                            (r.number_report && r.number_report === selectedData.quarter) ||
                            (r.week_report && selectedData.id_loaibaocao === 1)
                        )
                );

                const isOverdue = result.countdown === "Đã quá hạn";
                const islate = !isSubmitted && isOverdue; // 🔹 chỉ trễ hạn khi chưa nộp và quá hạn

                onSelectChange([{ ...selectedData, islate }]);
            } else {
                onSelectChange([]);
            }
        }
    }, [selectedItemId]);
    const handleSelect = (id) => {
        const noti = notifications.find(item => item.id === id);
        const result = calculateTimes(noti);
        // console.log(result);
        // ✅ Chỉ cho chọn nếu đang trong hạn hoặc đã quá hạn
        const isOverdue = result.countdown === "Đã quá hạn";
        const canSelect = result.isInProgress || isOverdue;

        if (!canSelect) return; // ❌ Nếu chưa đến kỳ, không cho chọn

        // ✅ Nếu đã chọn rồi thì bỏ chọn, nếu chưa thì chọn
        setSelectedItemId(prev => (prev === id ? null : id));
    };
    const calculateTimes = (noti) => {
        const { start_day, deadline, month, id_loaibaocao } = noti;
        const now = dayjs();
        let nextNotify;
        const type = reportTypeMap[id_loaibaocao];
        if (!start_day || !deadline) return {};

        const startDayInt = parseInt(start_day);
        const deadlineHours = parseInt(deadline);

        if (type === "weekly") {
            // 🔹 Tính ngày bắt đầu của tuần hiện tại
            const baseThisWeek = dayjs().day(startDayInt).startOf("day");

            // Nếu ngày bắt đầu tuần này đã trôi qua => kỳ đó vẫn là hiện tại cho đến khi tới tuần kế tiếp thật sự
            if (baseThisWeek.isAfter(now)) {
                nextNotify = baseThisWeek; // tuần này chưa bắt đầu
            } else {
                nextNotify = baseThisWeek; // vẫn tính tuần này, không nhảy sang tuần sau
            }
        }

        else if (type === "monthly") {
            // 🔹 Báo cáo tháng — tính ngày bắt đầu trong tháng hiện tại
            const startOfMonth = dayjs()
                .year(now.year())
                .month(now.month())
                .date(startDayInt)
                .hour(0)
                .minute(0)
                .second(0);

            // Nếu chưa tới ngày bắt đầu tháng này, giữ nguyên
            // Nếu đã qua mà chưa tới tháng sau → vẫn là kỳ hiện tại
            nextNotify = startOfMonth;
        }

        else if (type === "quarterly") {
            // 🔹 Báo cáo quý — tính theo tháng và ngày bắt đầu
            const startMonthInt = parseInt(month);
            const currentYear = now.year();

            nextNotify = dayjs()
                .year(currentYear)
                .month(startMonthInt - 1)
                .date(startDayInt)
                .hour(0)
                .minute(0)
                .second(0);
        }

        else if (type === "yearly") {
            // 🔹 Báo cáo năm — cố định theo tháng bắt đầu
            if (!month) return {};
            const startMonthInt = parseInt(month);
            const currentYear = now.year();

            nextNotify = dayjs()
                .year(currentYear)
                .month(startMonthInt - 1)
                .date(startDayInt)
                .hour(0)
                .minute(0)
                .second(0);
        }

        if (!nextNotify) return {};

        // 🔹 Thời hạn nộp
        const deadlineTime = nextNotify.add(deadlineHours, "hour");

        // 🔹 Xác định trạng thái
        const nowBetween = now.isAfter(nextNotify) && now.isBefore(deadlineTime);
        const countdownMs = deadlineTime.diff(now);
        const d = dayjs.duration(countdownMs);

        const countdown =
            countdownMs > 0
                ? `${Math.floor(d.asDays())} ngày ${d.hours()}h ${d.minutes()}p ${d.seconds()}s`
                : "Đã quá hạn";

        return {
            nextNotifyDate: nextNotify.format("dddd, DD/MM/YYYY HH:mm"),
            deadlineTime: deadlineTime.format("dddd, DD/MM/YYYY HH:mm"),
            isInProgress: nowBetween,
            countdown,
        };
    };

    return (
        <Box className="p-6">
            <Typography variant="h5" gutterBottom align="center" fontWeight="bold">
                🗂️ Danh sách Báo Cáo
            </Typography>

            {loading ? (
                <Box className="flex justify-center py-10">
                    <CircularProgress />
                </Box>
            ) : (
                <Grid
                    container
                    spacing={3}
                    justifyContent="center" // 🟢 Căn giữa toàn bộ card
                    alignItems="stretch"   // 🟢 Các card đều chiều cao
                >
                    {notifications.map((item) => {
                        // console.log(item);
                        const result = calculateTimes(item);
                        if (!result.nextNotifyDate) return null;

                        // 🔍 Kiểm tra báo cáo này đã được nộp chưa
                        const isSubmitted = submittedReports.some(
                            (r) =>
                                r.id_loaibaocao === item.id_loaibaocao &&
                                r.year_report === dayjs().year() &&
                                (
                                    (r.month_report && r.month_report === (item.month || dayjs().month() + 1)) ||
                                    (r.quarterly_report && r.quarterly_report === item.quarter) ||
                                    (r.number_report && r.number_report === item.quarter) ||
                                    (r.week_report && item.id_loaibaocao === 1)
                                )
                        );
                        // console.log(isSubmitted);
                        const isSelected = selectedItemId === item.id;
                        const clean = result.nextNotifyDate.split(", ")[1];
                        const parsed = dayjs(clean, "DD/MM/YYYY HH:mm");
                        const dateAll = dayjs(parsed);
                        const getMonthIn = dateAll.month() + 1;
                        if (getMonthIn === 12) return null;

                        const getWeekIn = dateAll.week();

                        const reportName = (() => {
                            const base = reportMapName[item.id_loaibaocao] || "Báo cáo";
                            if (item.id_loaibaocao === 1) return `${base} - Tuần ${getWeekIn}`;
                            if (item.id_loaibaocao === 2) {
                                const label =
                                    getMonthIn === 3 ? "Quý 1" :
                                        getMonthIn === 6 ? "6 Tháng" :
                                            getMonthIn === 9 ? "9 Tháng" : `Tháng ${getMonthIn}`;
                                return `${base} - ${label}`;
                            }
                            if (item.id_loaibaocao === 3 && item.quarter)
                                return `${base} - ${
                                    item.quarter === 1 ? "Quý I" :
                                        item.quarter === 2 ? "Quý II - Báo cáo 06 tháng" :
                                            item.quarter === 3 ? "Quý III - Báo cáo 09 tháng" : "Quý IV - báo cáo năm Lần 2"
                                }`;
                            if (item.id_loaibaocao === 4 && item.quarter)
                                return `${base} - Lần ${item.quarter}`;
                            return base;
                        })();

                        const isOverdue = result.countdown === "Đã quá hạn";
                        let statusText, statusColor;

                        // ⚙️ Quy tắc hiển thị trạng thái
                        if (isSubmitted) {
                            statusText = "✅ Đã nộp";
                            statusColor = "success.main";
                        } else if (isOverdue) {
                            statusText = "🔴 Đã quá hạn";
                            statusColor = "error.main";
                        } else if (result.isInProgress) {
                            statusText = "🟡 Đang trong hạn nộp";
                            statusColor = "warning.main";
                        } else {
                            statusText = "🟢 Chưa đến kỳ";
                            statusColor = "success.main";
                        }

                        // 🧭 Nếu đã nộp thì tính chu kỳ kế tiếp luôn
                        const displayNextNotify = isSubmitted
                            ? dayjs(result.nextNotifyDate).add(1, "month").format("dddd, DD/MM/YYYY HH:mm")
                            : result.nextNotifyDate;

                        return (
                            <Grid item xs={12} sm={6} md={4} key={item.id}>
                                <Card
                                    onClick={() => {
                                        if (!isSubmitted) handleSelect(item.id);
                                    }}
                                    variant="outlined"
                                    sx={{
                                        height: "100%",
                                        borderColor: isSelected ? "primary.main" : "grey.300",
                                        backgroundColor: isSubmitted
                                            ? "#e8f5e9"
                                            : isOverdue
                                                ? "#ffebee"
                                                : result.isInProgress
                                                    ? "#fff8e1"
                                                    : "white",
                                        borderRadius: 3,
                                        transition: "all 0.3s ease",
                                        boxShadow: isSelected ? 4 : 1,
                                        "&:hover": {
                                            boxShadow: 6,
                                            transform: "translateY(-3px)",
                                        },
                                        cursor: "pointer",
                                    }}
                                >
                                    <CardContent sx={{ textAlign: "center" }}>
                                        <FormControlLabel
                                            control={
                                                <Checkbox
                                                    checked={isSelected}
                                                    onChange={() => handleSelect(item.id)}
                                                    onClick={(e) => e.stopPropagation()}
                                                    color="primary"
                                                    disabled={isSubmitted ? true : !(result.isInProgress || isOverdue)}
                                                />
                                            }
                                            label={
                                                <Typography variant="subtitle1" fontWeight="bold" sx={{ textAlign: "center" }}>
                                                    📝 {reportName}
                                                </Typography>
                                            }
                                            sx={{ justifyContent: "center", width: "100%" }}
                                        />

                                        <Divider sx={{ my: 1 }} />

                                        <Typography variant="body2" sx={{ color: statusColor, fontWeight: 600, mb: 1 }}>
                                            {statusText}
                                        </Typography>

                                        <Typography variant="body2" sx={{ mb: 0.5 }}>
                                            ⏰ <b>Ngày bắt đầu:</b> {displayNextNotify}
                                        </Typography>

                                        <Typography variant="body2" sx={{ mb: 0.5 }}>
                                            ⏳ <b>Hạn nộp:</b> {result.deadlineTime}
                                        </Typography>

                                        {!isSubmitted && (
                                            <Typography variant="body2" sx={{ mt: 1 }}>
                                                {result.isInProgress ? "Còn lại:" : isOverdue ? "Đã quá hạn:" : "Bắt đầu sau:"}{" "}
                                                <b>{result.countdown}</b>
                                            </Typography>
                                        )}
                                    </CardContent>
                                </Card>
                            </Grid>
                        );
                    })}

                </Grid>
            )}
        </Box>
    );

};

export default ReportNotificationScheduler;
