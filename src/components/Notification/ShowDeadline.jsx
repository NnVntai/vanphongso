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
  // ==== HÀM TÍNH TUẦN THEO CHUẨN VIỆT NAM ====
  function week1Monday(year) {
    const d = new Date(year, 0, 4);
    const dowMon0 = (d.getDay() + 6) % 7;
    d.setDate(d.getDate() - dowMon0);
    d.setHours(0, 0, 0, 0);
    return d;
  }

  function getVNWeekYear(date) {
      const d = new Date(date);
      const year = d.getFullYear();

      // Lấy ngày 1/1 của năm
      const firstDay = new Date(year, 0, 1);

      // Tính ngày Thứ Hai đầu tiên của năm
      const firstDayWeek = firstDay.getDay();
      const offset = (firstDayWeek + 6) % 7; // đưa về Monday = 0
      const firstMonday = new Date(firstDay);
      firstMonday.setDate(firstDay.getDate() - offset);

      // Lấy thứ Hai của tuần hiện tại
      const dowMon0 = (d.getDay() + 6) % 7;
      const currentMonday = new Date(d);
      currentMonday.setDate(d.getDate() - dowMon0);

      // Tính số tuần
      const diff = currentMonday - firstMonday;
      const week = Math.floor(diff / (7 * 24 * 60 * 60 * 1000)) + 1;

      return {
          year,
          week
      };
  }

  function getVNWeeksInYear(year) {
    const w1 = week1Monday(year);
    const w1next = week1Monday(year + 1);
    return Math.floor((w1next - w1) / (7 * 24 * 60 * 60 * 1000));
  }

  const getItemByKey = (key, list) => {
    if (!key) return undefined;
    if (typeof key === 'string' && key.includes('-')) {
      const idx = Number(key.split('-').pop());
      if (Number.isNaN(idx)) return undefined;
      return list[idx];
    }
    return list.find(it => it.id === key);
  };

  // ============ FETCH DATA (CÓ PENDING TUẦN + PENDING THÁNG) ============
  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await api.get("/report-notifications");
        const { data: oldReport } = await api.post("/oldreportforuser", {
          year, month, week, id_xa, quarter
        });
        
        const currentYear = dayjs().year();

        // ====== PENDING WEEK (GIỮ Y NGUYÊN) ======
        const startDate = new Date(currentYear - 1, 9, 1);
        const { year: startYear, week: startWeek } = getVNWeekYear(startDate);
        const { year: currentVNYear, week: currentVNWeek } = getVNWeekYear(new Date());
        // console.log(oldReport);
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
          return !oldReport.some(r =>
            r.id_loaibaocao === 1 &&
            r.year_report === year &&
            r.week_report === week
          );
        });

        const weeklyReports = data.filter(n => n.id_loaibaocao === 1);
        const otherReports = data.filter(n => n.id_loaibaocao !== 1);

        const expandedWeekly = [];
        weeklyReports.forEach(wItem => {
          pendingWeeks.forEach(({ year, week }) => {
            expandedWeekly.push({
              ...wItem,
              isGeneratedWeek: true,
              customWeek: week,
              customYear: year
            });
          });
        });

        // =====================================================
        // 🔥🔥🔥 PENDING THÁNG (THÊM GIỐNG TUẦN — BẮT ĐẦU TỪ THÁNG 10 NĂM TRƯỚC)
        // =====================================================
        const startMonthYear = currentYear - 1; // ví dụ đang 2025 → lấy 2024
        const startMonth = 10; // tháng 10
        const currentMonth = dayjs().month() + 1;

        const allMonths = [];
        for (let y = startMonthYear; y <= currentYear; y++) {
          const fromM = y === startMonthYear ? 10 : 1;
          const toM = y === currentYear ? currentMonth : 12;

          for (let m = fromM; m <= toM; m++) {
            allMonths.push({ year: y, month: m });
          }
        }
        const pendingMonths = allMonths.filter(({ year, month }) => {
          return !oldReport.some(r =>
            r.id_loaibaocao === 2 &&
            r.year_report === year &&
            r.month_report === month
          );
        });
        // console.log(pendingMonths,pendingWeeks);
        const monthlyTemplate = data.find(d => d.id_loaibaocao === 2);
        const expandedMonthly = [];

        if (monthlyTemplate) {
          pendingMonths.forEach(({ year, month }) => {
            expandedMonthly.push({
              ...monthlyTemplate,
              isGeneratedMonth: true,
              customMonth: month,
              customYear: year
            });
          });
        }
        // GỘP TẤT CẢ VÀO
        setNotifications([
          ...expandedWeekly,        // tuần chưa nộp
          ...expandedMonthly,       // 🔥 tháng chưa nộp
          ...otherReports           // các báo cáo bình thường
        ]);
        setSubmittedReports(oldReport);
      } catch (err) {
        console.error("Lỗi khi tải thông báo:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [year, id_xa]);
    // ============================
  // Cập nhật thời gian thực mỗi giây
  // ============================
  useEffect(() => {
    const timer = setInterval(() => setNow(dayjs()), 1000);
    return () => clearInterval(timer);
  }, []);

  // ============================
  // HÀM TÍNH THỜI GIAN (CHUNG CHO TUẦN / THÁNG / QUÝ / NĂM)
  // ============================
  const calculateTimes = (noti) => {
    if (!noti) return {};
    const { start_day, deadline, month, id_loaibaocao, customWeek, customYear, customMonth } = noti;
    if (!start_day || !deadline) return {};

    const now = dayjs();
    const startDayInt = parseInt(start_day);
    const deadlineHours = parseInt(deadline);
    const type = reportTypeMap[id_loaibaocao];
    let nextNotify;

    // ========= BÁO CÁO TUẦN =========
    if (type === "weekly") {
      const baseDate = (customYear && customWeek)
        ? new Date(customYear, 0, 4 + (customWeek - 1) * 7)
        : new Date();

      const { year: vnYear, week: vnWeek } = getVNWeekYear(baseDate);
      const baseMonday = week1Monday(vnYear);

      const nextNotifyDate = new Date(baseMonday);
      nextNotifyDate.setDate(
        baseMonday.getDate() + (vnWeek - 1) * 7 + (startDayInt - 1)
      );

      nextNotify = dayjs(nextNotifyDate).hour(0).minute(0).second(0);
    }

    // ========= BÁO CÁO THÁNG (GỒM THÁNG PENDING) =========
    else if (type === "monthly") {
      const useMonth = customMonth || now.month() + 1;
      const useYear = customYear || now.year();

      nextNotify = dayjs()
        .year(useYear)
        .month(useMonth - 1)
        .date(startDayInt)
        .hour(0)
        .minute(0)
        .second(0);
    }

    // ========= BÁO CÁO QUÝ / NĂM (giữ nguyên logic) =========
    else {
      const startMonthInt = parseInt(month || 1);
      nextNotify = dayjs()
        .year(now.year())
        .month(startMonthInt - 1)
        .date(startDayInt)
        .hour(0)
        .minute(0)
        .second(0);
    }

    // === TÍNH DEADLINE ===
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

  // ============================
  // XỬ LÝ CHỌN ITEM
  // ============================
  const handleSelect = (key) => {
    const noti = getItemByKey(key, notifications);
    if (!noti) return;

    const result = calculateTimes(noti);
    const isOverdue = result.countdown === "Đã quá hạn";

    // Cho chọn nếu:
    // - đang trong hạn nộp
    // - đã quá hạn
    // - là báo cáo tạo thêm (pending week/month)
    const canSelect =
      result.isInProgress || isOverdue || noti.isGeneratedWeek || noti.isGeneratedMonth;

    if (!canSelect) return;

    setSelectedItemId(prev => (prev === key ? null : key));
  };

  // ============================
  // GỬI DỮ LIỆU VỀ CHA
  // ============================
  useEffect(() => {
    if (typeof onSelectChange === "function") {
      const selectedData = getItemByKey(selectedItemId, notifications);

      if (selectedData) {
        const result = calculateTimes(selectedData);
      
        // ==== KIỂM TRA ĐÃ NỘP ====
        const isSubmitted = submittedReports.some((r) => {
      
          // --- TUẦN ---
          if (selectedData.id_loaibaocao === 1) {
            return (
              r.id_loaibaocao === 1 &&
              r.week_report === selectedData.customWeek &&
              r.year_report === selectedData.customYear
            );
          }

          // --- THÁNG ---
          if (selectedData.id_loaibaocao === 2) {
            return (
              r.id_loaibaocao === 2 &&
              r.month_report === (selectedData.customMonth) &&
              r.year_report === (selectedData.customYear)
            );

          }
          if (selectedData.id_loaibaocao === 3) {
            return (
              r.id_loaibaocao ===3 &&
              r.quarter_report === (selectedData.quarter) &&
              r.year_report === (year)
            );
          }
          if (selectedData.id_loaibaocao === 4) {
            return (
              r.id_loaibaocao === 4 &&
              r.number_report === (selectedData.quarter) &&
              r.year_report === (year)
            );
          }

          return false;
        });

        const isOverdue = result.countdown === "Đã quá hạn";
        const islate = !isSubmitted && isOverdue;

        onSelectChange([{ ...selectedData, islate }]);
      } else {
        onSelectChange([]);
      }
    }
  }, [selectedItemId, notifications, submittedReports]);
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
          {notifications.map((item, index) => {
            const key = `${item.id}-${index}`;
            const result = calculateTimes(item);

            if (!result.nextNotifyDate) return null;

            // Parse ngày => lấy tuần/tháng dùng để hiển thị
            const clean = result.nextNotifyDate.split(", ")[1];
            const parsed = dayjs(clean, "DD/MM/YYYY HH:mm");
            const dateAll = dayjs(parsed);

            const getMonthIn = dateAll.month() + 1;
            const getWeekIn = dateAll.week();

            // ================================
            // KIỂM TRA ĐÃ NỘP (WEEK + MONTH)
            // ================================
            const isSubmitted = submittedReports.some((r) => {

              // --- TUẦN ---
              if (item.id_loaibaocao === 1) {
                return (
                  r.id_loaibaocao === 1 &&
                  r.week_report === item.customWeek &&
                  r.year_report === item.customYear
                );
              }

              // --- THÁNG ---
              if (item.id_loaibaocao === 2) {
                return (
                  r.id_loaibaocao === 2 &&
                  r.month_report === (item.customMonth || getMonthIn) &&
                  r.year_report === (item.customYear || dayjs().year())
                );
              }
               if (item.id_loaibaocao === 3) {
                // console.log(item);
                return (
                  r.id_loaibaocao === 3 &&
                  r.quarterly_report === (item.quarter)&&
                  r.year_report === (item.customYear || dayjs().year())
                );
              }
               if (item.id_loaibaocao === 4) {
                return (
                  r.id_loaibaocao === 4 &&
                  r.number_report === (item.quarter) &&
                  r.year_report === (item.customYear || dayjs().year())
                );
              }

              return false;
            });

            const isSelected = selectedItemId === key;
            const isOverdue =
              result.countdown === "Đã quá hạn" ||
              item.isGeneratedWeek ||
              item.isGeneratedMonth;

            // ====================================
            // TẠO LABEL HIỂN THỊ TÊN BÁO CÁO
            // ====================================
            const reportName = (() => {
              const base = reportMapName[item.id_loaibaocao] || "Báo cáo";

              // ====== 1️⃣ BÁO CÁO TUẦN ======
              if (item.id_loaibaocao === 1) {
                if (item.isGeneratedWeek && item.customWeek && item.customYear) {
                  return `${base} - Tuần ${item.customWeek}/${item.customYear}`;
                }
                return `${base} - Tuần ${getWeekIn}`;
              }

              // ====== 2️⃣ BÁO CÁO THÁNG ======
              if (item.id_loaibaocao === 2) {
                const m = item.customMonth || getMonthIn;
                const y = item.customYear || dayjs().year();

                const label =
                  m === 3 ? "Quý 1" :
                  m === 6 ? "6 Tháng" :
                  m === 9 ? "9 Tháng" :
                  `Tháng ${m}`;

                return `${base} - ${label} (${y})`;
              }

              // ====== 3️⃣ BÁO CÁO QUÝ ======
              if (item.id_loaibaocao === 3 && item.quarter) {
                return `${base} - ${
                  item.quarter === 1
                    ? "Quý I"
                    : item.quarter === 2
                    ? "Quý II - Báo cáo 06 tháng"
                    : item.quarter === 3
                    ? "Quý III - Báo cáo 09 tháng"
                    : "Quý IV - Báo cáo Năm lần 2"
                }`;
              }

              // ====== 4️⃣ BÁO CÁO NĂM ======
              if (item.id_loaibaocao === 4 && item.quarter) {
                return `${base} - Lần ${item.quarter}`;
              }

              return base;
            })();

            // =============================
            // TẠO TEXT TRẠNG THÁI HIỂN THỊ
            // =============================
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
                      ? "#e8f5e9"            // Đã nộp
                      : isOverdue
                      ? "#ffebee"             // Quá hạn
                      : result.isInProgress
                      ? "#fff8e1"             // Đang trong hạn
                      : "white",               // Chưa đến kỳ
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
                    {/* ========== CHECKBOX CHỌN ITEM ========== */}
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={isSelected}
                          onChange={() => handleSelect(key)}
                          onClick={(e) => e.stopPropagation()}
                          color="primary"
                          disabled={
                            isSubmitted
                              ? true                     // không chọn khi đã nộp
                              : !(result.isInProgress || isOverdue)
                          }
                        />
                      }
                      label={
                        <Typography
                          variant="subtitle1"
                          fontWeight="bold"
                          sx={{ textAlign: "center" }}
                        >
                          📝 {reportName}
                        </Typography>
                      }
                      sx={{ justifyContent: "center", width: "100%" }}
                    />

                    <Divider sx={{ my: 1 }} />

                    {/* ========== TRẠNG THÁI ========== */}
                    <Typography
                      variant="body2"
                      sx={{
                        color: statusColor,
                        fontWeight: 600,
                        mb: 1,
                      }}
                    >
                      {statusText}
                    </Typography>

                    {/* ========== NGÀY BẮT ĐẦU ========== */}
                    <Typography variant="body2" sx={{ mb: 0.5 }}>
                      ⏰ <b>Ngày bắt đầu:</b> {result.nextNotifyDate}
                    </Typography>

                    {/* ========== DEADLINE ========== */}
                    <Typography variant="body2" sx={{ mb: 0.5 }}>
                      ⏳ <b>Hạn nộp:</b> {result.deadlineTime}
                    </Typography>

                    {/* ========== COUNTDOWN ========== */}
                    {!isSubmitted && (
                      <Typography variant="body2" sx={{ mt: 1 }}>
                        {result.isInProgress
                          ? "Còn lại:"
                          : isOverdue
                          ? "Đã quá hạn:"
                          : "Bắt đầu sau:"}{" "}
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

