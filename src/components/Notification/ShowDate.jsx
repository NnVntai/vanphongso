import React, { useState, useEffect } from 'react';
import {
    Typography,
    CircularProgress,
    Checkbox,
    Card,
    CardContent,
    Grid,
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
    const [notifications, setNotifications] = useState([]);
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
                console.log(data);
                setNotifications(data);
            } catch (err) {
                console.error("Lỗi khi tải thông báo:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    useEffect(() => {
        const timer = setInterval(() => setNow(dayjs()), 1000);
        return () => clearInterval(timer);
    }, []);
    useEffect(() => {
        if (typeof onSelectChange === 'function') {
            const selectedData = notifications.find(item => item.id === selectedItemId);
            onSelectChange(selectedData ? [selectedData] : []);
        }
    }, [selectedItemId]);
    const handleSelect = (id) => {
        const noti = notifications.find(item => item.id === id);
        const result = calculateTimes(noti);

        if (!result.isInProgress) return; // ❌ Không cho chọn nếu bị disable

        setSelectedItemId(prev => (prev === id ? null : id));
        // setSelectedItemId(prev => (prev === id ? null : id)); // nếu đã chọn rồi thì bỏ chọn
    };
    const calculateTimes = (noti) => {
        const { start_day, deadline, month, id_loaibaocao } = noti;

        const now = dayjs();
        let nextNotify;
        const type = reportTypeMap[id_loaibaocao];
        if (!start_day || !deadline) return {};

        if (type === 'weekly') {
            const startDayInt = parseInt(start_day);
            const deadlineHours = parseInt(deadline);
            const baseThisWeek = dayjs().day(startDayInt).startOf('day');
            const adjustedBase = baseThisWeek.isAfter(now) ? baseThisWeek : baseThisWeek.subtract(7, 'day');
            const candidateStart = adjustedBase.add(7, 'day');
            const candidateDeadline = candidateStart.add(deadlineHours, 'hour');
            nextNotify = candidateDeadline.isAfter(now) ? candidateStart : candidateStart.add(7, 'day');
        } else if (type === 'yearly') {
            if (!month) return {};
            const today = now.date();
            const currentMonth = now.month() + 1;
            const currentYear = now.year();
            const startDayInt = parseInt(start_day);
            const startMonthInt = parseInt(month);
            const deadlineHours = parseInt(deadline);

            const reportYear = (startMonthInt < currentMonth || (startMonthInt === currentMonth && deadlineHours <= today))
                ? currentYear + 1
                : currentYear;
            nextNotify = dayjs()
                .year(reportYear)
                .month(startMonthInt - 1)
                .date(startDayInt)
                .hour(0)
                .minute(0)
                .second(0);
        } else if (type === 'quarterly') {
            const now = dayjs(); // thời điểm hiện tại

            const startDayInt = parseInt(start_day);      // Ngày bắt đầu báo cáo
            const startMonthInt = parseInt(month);        // Tháng bắt đầu báo cáo (1 → 12)
            const deadlineHours = parseInt(deadline);     // Thời hạn nộp (VD: 48 giờ)

            let currentYear = now.year();

// Bước 1: Xây dựng ngày bắt đầu báo cáo trong năm hiện tại
            let baseDate = dayjs()
                .year(currentYear)
                .month(startMonthInt - 1) // vì dayjs().month() = 0 (Jan)
                .date(startDayInt)
                .hour(0)
                .minute(0)
                .second(0);

// Bước 2: Tính thời điểm hết hạn
            let deadlineTime = baseDate.add(deadlineHours, "hour");

// Bước 3: Nếu deadline đã trôi qua, đẩy sang năm kế tiếp
            if (deadlineTime.isBefore(now)) {
                currentYear += 1;
                baseDate = baseDate.year(currentYear); // cập nhật lại baseDate
                deadlineTime = baseDate.add(deadlineHours, "hour");
            }

// Kết quả: ngày thông báo tiếp theo là `baseDate`
            nextNotify = baseDate;
        } else if (type === 'monthly') {
            const startDayInt = parseInt(start_day);
            const deadlineHours = parseInt(deadline);
            let tempNotify = dayjs()
                .year(now.year())
                .month(now.month())
                .date(startDayInt)
                .hour(0)
                .minute(0)
                .second(0);
            let tempExpire = tempNotify.add(deadlineHours, 'hour');
            const baseMonth = now.isBefore(tempExpire) ? now : now.add(1, 'month');
            nextNotify = dayjs()
                .year(baseMonth.year())
                .month(baseMonth.month())
                .date(startDayInt)
                .hour(0)
                .minute(0)
                .second(0);
        }

        if (!nextNotify) return {};
        const deadlineTime = nextNotify.add(parseInt(deadline), 'hour');
        const nowBetween = now.isAfter(nextNotify) && now.isBefore(deadlineTime);
        const countdownMs = deadlineTime.diff(now);
        const d = dayjs.duration(countdownMs);
        const countdown = countdownMs > 0
            ? `${Math.floor(d.asDays())} ngày ${d.hours()}h ${d.minutes()}p ${d.seconds()}s`
            : 'Đã quá hạn';

        return {
            nextNotifyDate: nextNotify.format('dddd, DD/MM/YYYY HH:mm'),
            deadlineTime: deadlineTime.format('dddd, DD/MM/YYYY HH:mm'),
            isInProgress: nowBetween,
            countdown
        };
    };

    return (
        <div className="p-4 space-y-4">
            <Typography variant="h5" gutterBottom>
                Danh sách báo cáo
            </Typography>
            {loading ? (
                <div className="text-center py-10">
                    <CircularProgress />
                </div>
            ) : (
                <Grid container spacing={2}>
                    {notifications.map((item) => {
                        const result = calculateTimes(item);
                        const isSelected = selectedItemId === item.id;
                        const clean = result.nextNotifyDate.split(", ")[1]; // lấy "13/08/2025 00:00"
                        const parsed = dayjs(clean, "DD/MM/YYYY HH:mm");
                        // const dateallformat=dayjs(result.nextNotifyDate).format('dddd, DD/MM/YYYY HH:mm');
                        const dateall=dayjs(parsed);
                        const getmonthin=dateall.month()+1;
                        // if(item.id_loaibaocao === 1)
                        // console.log(parsed);
                        if(getmonthin!==12)
                        {
                            const getweekin=dateall.week();
                            const reportName = reportMapName[item.id_loaibaocao] +
                                (item.id_loaibaocao === 1 ? `  ${getweekin}` : '') +
                                (item.id_loaibaocao === 2? (getmonthin===3?`Quý 1`:(getmonthin===6?`6 Tháng`:(getmonthin===9?`9 Tháng`:`${getmonthin}`))) : '') +
                                (item.id_loaibaocao === 4 && item.quarter ? ` Lần ${item.quarter}` : '') +
                                (item.id_loaibaocao === 3 && item.quarter ? ` ${item.quarter===1?"Quý 1":item.quarter===2?"6 tháng":item.quarter===3?"9 tháng":""}` : '');
                            return (
                                <Grid item xs={12} md={6} key={item.id} >
                                    <Card
                                        onClick={() => handleSelect(item.id)}
                                        variant="outlined"
                                        sx={{
                                            borderColor: isSelected ? 'primary.main' : 'grey.300',
                                            backgroundColor: isSelected ? 'primary.50' : 'white',
                                            cursor: 'pointer',
                                            transition: 'all 0.3s ease',
                                            borderRadius: 2,
                                            '&:hover': {
                                                boxShadow: 3
                                            }
                                        }}
                                    >
                                        <CardContent  className={` w-full `} >
                                            <FormControlLabel
                                                control={
                                                    <Checkbox
                                                        checked={isSelected}
                                                        onChange={() => handleSelect(item.id)}
                                                        onClick={(e) => e.stopPropagation()}
                                                        color="primary"
                                                        disabled={!result.isInProgress}
                                                    />
                                                }
                                                label={<Typography variant="subtitle1" className="font-semibold">📝 {reportName}</Typography>}
                                            />
                                            <Typography variant="body2">📅 {result.isInProgress ? 'Kết thúc sau' : 'Bắt đầu sau'}: {result.countdown}</Typography>
                                            <Typography variant="body2"

                                            >⏰ Ngày bắt đầu: {result.nextNotifyDate || 'Không tính được'}</Typography>
                                            <Typography

                                                variant="body2"
                                                className={result.isInProgress ? 'text-red-600 font-semibold' : '' }
                                            >
                                                ⏳ Hạn nộp: {result.deadlineTime || 'Không tính được'}
                                            </Typography>
                                        </CardContent>
                                    </Card>
                                </Grid>
                            );
                        }
                    })}
                </Grid>
            )}
        </div>
    );
};

export default ReportNotificationScheduler;
