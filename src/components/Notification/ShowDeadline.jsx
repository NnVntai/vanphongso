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
  const id_xa = JSON.parse(localStorage.getItem("username"))?.xa?.id;
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

  // === Hàm hỗ trợ tính tuần VN ===
  function week1Monday(year) {
    const d = new Date(year, 0, 4); // ngày 4/1 luôn nằm trong tuần 1
    const dowMon0 = (d.getDay() + 6) % 7;
    d.setDate(d.getDate() - dowMon0);
    d.setHours(0, 0, 0, 0);
    return d;
  }

  function getVNWeekYear(date) {
    const d = new Date(date);
    const dowMon0 = (d.getDay() + 6) % 7;
    const monday = new Date(d);
    monday.setDate(d.getDate() - dowMon0);
    monday.setHours(0, 0, 0, 0);

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
    return Math.floor((w1next - w1) / (7 * 24 * 60 * 60 * 1000));
  }

  // === Helper: lấy item theo key ===
  const getItemByKey = (key, list) => {
    if (!key) return undefined;
    if (typeof key === 'string' && key.includes('-')) {
      const idx = Number(key.split('-').pop());
      if (Number.isNaN(idx)) return undefined;
      return list[idx];
    }
    return list.find(it => it.id === key);
  };

  // === Fetch dữ liệu ===
  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await api.get("/report-notifications");
        const { data: oldReport } = await api.post("/oldreportforuser", { year, month, week, id_xa, quarter });
        // console.log(oldReport);
        // 🔹 Tính danh sách tuần chưa nộp (từ 1/10 năm trước)
        const currentYear = dayjs().year();
        const startDate = new Date(currentYear - 1, 9, 1); // 1/10 năm trước
        const { year: startYear, week: startWeek } = getVNWeekYear(startDate);
        const { year: currentVNYear, week: currentVNWeek } = getVNWeekYear(new Date());

        const allWeeks = [];
        for (let y = startYear; y <= currentVNYear; y++) {
          const totalWeeks = getVNWeeksInYear(y);
          const startW = y === startYear ? startWeek : 1;
          const endW = y === currentVNYear ? currentVNWeek : totalWeeks;
          for (let w = startW; w <= endW; w++) {
            allWeeks.push({ year: y, week: w });
          }
        }
        const pendingWeeks = allWeeks.filter(({ year, week }) => {
          return !oldReport.some(
            (r) => r.year_report === year && r.week_report === week && r.id_loaibaocao === 1
          );
        });
        // 🔹 Chèn các tuần chưa nộp vào danh sách weekly
        const weeklyReports = data.filter(n => n.id_loaibaocao === 1);
        const otherReports = data.filter(n => n.id_loaibaocao !== 1);

        const expandedWeekly = [];
        weeklyReports.forEach((wItem) => {
          pendingWeeks.forEach(({ year, week }) => {
            expandedWeekly.push({
              ...wItem,
              isGeneratedWeek: true,
              customWeek: week,
              customYear: year,
            });
          });
        });

        setNotifications([...expandedWeekly, ...otherReports]);
        setSubmittedReports(oldReport);
      } catch (err) {
        console.error("Lỗi khi tải thông báo:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [year, id_xa]);

  useEffect(() => {
    const timer = setInterval(() => setNow(dayjs()), 1000);
    return () => clearInterval(timer);
  }, []);

  // === Tính thời gian ===
  const calculateTimes = (noti) => {
    if (!noti) return {};
    const { start_day, deadline, month, id_loaibaocao, customWeek, customYear } = noti;
    if (!start_day || !deadline) return {};
    const now = dayjs();
    let nextNotify;

    const startDayInt = parseInt(start_day);
    const deadlineHours = parseInt(deadline);
    const type = reportTypeMap[id_loaibaocao];

    if (type === "weekly") {
      const baseDate = customWeek && customYear
        ? new Date(customYear, 0, 4 + (customWeek - 1) * 7)
        : new Date();
      const { year: vnYear, week: vnWeek } = getVNWeekYear(baseDate);
      const baseMonday = week1Monday(vnYear);
      const nextNotifyDate = new Date(baseMonday);
      nextNotifyDate.setDate(baseMonday.getDate() + (vnWeek - 1) * 7 + (startDayInt - 1));
      nextNotify = dayjs(nextNotifyDate).hour(0).minute(0).second(0);
    } else if (type === "monthly") {
      nextNotify = dayjs()
        .year(now.year())
        .month(now.month())
        .date(startDayInt)
        .hour(0).minute(0).second(0);
    } else {
      const startMonthInt = parseInt(month || 1);
      nextNotify = dayjs()
        .year(now.year())
        .month(startMonthInt - 1)
        .date(startDayInt)
        .hour(0).minute(0).second(0);
    }

    const deadlineTime = nextNotify.add(deadlineHours, "hour");
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

  // === Chọn item ===
  const handleSelect = (key) => {
    const noti = getItemByKey(key, notifications);
    if (!noti) return;
    const result = calculateTimes(noti);
    if (!result || !result.countdown) return;

    const isOverdue = result.countdown === "Đã quá hạn";
    const canSelect = result.isInProgress || isOverdue || noti.isGeneratedWeek;
    if (!canSelect) return;

    setSelectedItemId(prev => (prev === key ? null : key));
  };

  // === Gửi thông tin về cha ===
  useEffect(() => {
    console.log(notifications);
    if (typeof onSelectChange === 'function') {
      const selectedData = getItemByKey(selectedItemId, notifications);
      if (selectedData) {
        const result = calculateTimes(selectedData);
        const isSubmitted = submittedReports.some(
          (r) =>
            r.id_loaibaocao === selectedData.id_loaibaocao &&
            r.year_report === (selectedData.customYear || dayjs().year()) &&
            (r.week_report === (selectedData.customWeek || dayjs().week()))
        );
        const isOverdue = result.countdown === "Đã quá hạn";
        const islate = !isSubmitted && isOverdue;
        onSelectChange([{ ...selectedData, islate }]);
      } else {
        onSelectChange([]);
      }
    }
  }, [selectedItemId, notifications, submittedReports]);

  // === UI ===
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
        <Grid container spacing={3} justifyContent="center" alignItems="stretch">
          {
        
        notifications.map((item, index) => {
            const key = `${item.id}-${index}`;
            const result = calculateTimes(item);
            if (!result.nextNotifyDate) return null;

            const isSubmitted = submittedReports.some(
              (r) =>
                r.id_loaibaocao === item.id_loaibaocao &&
                r.year_report === (item.customYear || dayjs().year()) &&
                (r.week_report === (item.customWeek || dayjs().week()))
            );

            const isSelected = selectedItemId === key;
            const isOverdue = result.countdown === "Đã quá hạn" || item.isGeneratedWeek;

            const reportName = (() => {
              const base = reportMapName[item.id_loaibaocao] || "Báo cáo";
              if (item.id_loaibaocao === 1)
                return `${base} - Tuần ${item.customWeek || getVNWeekYear(new Date()).week}/${item.customYear || year}`;
              return base;
            })();

            let statusText, statusColor;
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

            return (
              <Grid item xs={12} sm={6} md={4} key={key}>
                <Card
                  onClick={() => {
                    if (!isSubmitted) handleSelect(key);
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
                    "&:hover": { boxShadow: 6, transform: "translateY(-3px)" },
                    cursor: "pointer",
                  }}
                >
                  <CardContent sx={{ textAlign: "center" }}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={isSelected}
                          onChange={() => handleSelect(key)}
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
                      ⏰ <b>Ngày bắt đầu:</b> {result.nextNotifyDate}
                    </Typography>

                    <Typography variant="body2" sx={{ mb: 0.5 }}>
                      ⏳ <b>Hạn nộp:</b> {result.deadlineTime}
                    </Typography>

                    {!isSubmitted && (
                      <Typography variant="body2" sx={{ mt: 1 }}>
                        {result.isInProgress ? "Còn lại:" : "Đã quá hạn:"}{" "}
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
