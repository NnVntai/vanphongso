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
import { motion } from "framer-motion";

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
const Arrow = () => (
    <motion.div
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 1, repeat: Infinity }}
        style={{
            fontSize: "1.5rem",
            width: "10000px",
            position: "absolute",
            // backgroundColor: "white",
            top: "-40px",
            display: "flex",          // căn theo hàng ngang
            alignItems: "center",     // căn giữa dọc
            gap: "6px",               // khoảng cách giữa mũi tên và chữ
        }}
    >
        ⬇️ <div >Chọn vào các báo cáo dưới đây </div>
    </motion.div>
);
const ReportNotificationScheduler = ({
                                         api,
                                         year,
                                         month,
                                         week,
                                         quarter,
                                         onSelectChange,
                                     }) => {
    const [notifications, setNotifications] = useState([]);
    const [notificationsLate, setNotificationsLate] = useState([]);
    const [notificationsOld, setNotificationsOld] = useState([]);
    const [selectedItemId, setSelectedItemId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [now, setNow] = useState(dayjs());
    const id_xa= JSON.parse(localStorage.getItem("username"))?.xa?.id;
    const reportMapName = {
        1: `Nộp báo cáo Tuần `,
        2: `Nộp báo cáo Tháng `,
        3: `Nộp báo cáo`,
        4: `Nộp báo cáo Năm ${year}`
    };
    const getCurrentTimeInfo = () => {
        const now = dayjs();
        const year = now.year();            // Năm hiện tại (VD: 2025)
        const month = now.month() + 1;      // Tháng hiện tại (1-12)
        const week = now.week();            // Tuần hiện tại (1-52)

        return { year, month, week };
    };
    useEffect(() => {

        const fetchData = async () => {
            try {
                // 1️⃣ Lấy cấu hình các loại báo cáo
                const { data: notificationsData } = await api.get("/report-notifications");
                // // 2️⃣ Lấy danh sách báo cáo đã nộp kỳ trước
                console.log(notificationsData);
                const { data: lateReports } = await api.post("/reportslateforuser", {year, month, week, id_xa, quarter,});
                // console.log(lateReports);
                const { data: oldReport } = await api.post("/oldreportforuser", {year, month, week, id_xa, quarter,});
                
               let defaulNotifications = [
                    { id: 22, id_loaibaocao: 1, start_day: 1, deadline: 48, month: month,year:year,week:week-1,late:true,  },
                    { id: 44, id_loaibaocao: 2, start_day: 5, deadline: 72, month: month-1,year:year, week:week,late:true },
                ];
                const safeLateReports = Array.isArray(lateReports) ? lateReports : [];
                 const lateReportsOld = defaulNotifications.filter(
                    nd => !safeLateReports.some(nl => nl.id_loaibaocao === nd.id_loaibaocao)
                );
                setNotificationsLate(lateReportsOld);
                setNotificationsOld(oldReport);
                setNotifications(notificationsData);
                console.log(notificationsData);

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
            const selectedData =
                notifications.find(item => item.id === selectedItemId) ||
                notificationsLate.find(item => item.id === selectedItemId);
            onSelectChange(selectedData ? [selectedData] : []);
        }
    }, [selectedItemId, notifications, notificationsLate]);
    const handleSelect = (id) => {
        if(id!==null)
        {
            const noti = notifications.find(item => item.id === id);
            const result = calculateTimes(noti);
            if(!result.autoShifted)
                if(result.isLateYear)
                    if (!result.isInProgress) return; // ❌ Không cho chọn nếu bị disable

            setSelectedItemId(prev => (prev === id ? null : id));
        }
    };
    const handleSelectLate = (id) => {
        const noti = notificationsLate.find(item => item.id === id);
        setSelectedItemId(prev => (prev === id ? null : id));
        // setSelectedItemId(prev => (prev === id ? null : id)); // nếu đã chọn rồi thì bỏ chọn
    };
    const calculateTimes = (noti) => {
        const { start_day, deadline, month, id_loaibaocao } = noti;
        let autoShifted = false;
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
            if (!candidateDeadline.isAfter(now)) {
                autoShifted = true; // 👈 quá hạn → sang tuần sau
            }
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
            let baseDate = dayjs().year(currentYear).month(startMonthInt - 1) // vì dayjs().month() = 0 (Jan)
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
            if (now.isAfter(tempExpire)) {
                autoShifted = true; // 👈 quá hạn → sang tháng mới
            }
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
            : 'Đã quá hạn Cho phép nộp lại';
        return {
            nextNotifyDate: nextNotify.format('dddd, DD/MM/YYYY HH:mm'),
            deadlineTime: deadlineTime.format('dddd, DD/MM/YYYY HH:mm'),
            isInProgress: nowBetween,
            countdown,
            isLateYear:((countdown==='Đã quá hạn Cho phép nộp lại'&&id_loaibaocao===4)?false:true),
            autoShifted
        };
    };
    return (
        <div className="p-4 space-y-4">
            {/*<Typography variant="h5" gutterBottom>*/}
            {/*    Danh sách báo cáo*/}
            {/*</Typography>*/}
            {loading ? (
                <div className="text-center py-10">
                    <CircularProgress />
                </div>
            ) : (
                <Grid container spacing={2}>
                    <div style={{ position: "relative", }}>
                        <Arrow />
                    </div>
                    {notificationsLate.map((item) => {
                        // console.log(item.id);
                        // const result = calculateTimes(item);
                        const isSelected = selectedItemId === item.id;
                        const dataLateShow=getCurrentTimeInfo();

                        const reportName = `🕒 ${reportMapName[3]} ${item.id_loaibaocao===1?"Tuần "+(dataLateShow.week-1):""+(item.id_loaibaocao === 2? ((dataLateShow.month-1)===3?`Quý 1`:((dataLateShow.month-1)===6?`6 Tháng`:((dataLateShow.month-1)===9?`9 Tháng`:"Tháng "+`${(dataLateShow.month-1)}`))) : '')}`;
                        return (
                            <Grid item xs={12} md={6} key={item.id}>
                                <Card
                                    onClick={() => handleSelectLate(item.id)}
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
                                    <CardContent>
                                        <FormControlLabel
                                            control={
                                                <Checkbox
                                                    checked={isSelected}
                                                    onChange={() => handleSelectLate(item.id)}
                                                    onClick={(e) => e.stopPropagation()}
                                                    color="primary"
                                                />
                                            }
                                            label={
                                                <Typography variant="subtitle1" className="font-semibold">
                                                    {reportName}
                                                </Typography>
                                            }
                                        />
                                        <Typography variant="body2">📝 Vui lòng nộp lại báo cáo</Typography>
                                        <Typography variant="body2">⏰ Ngày bắt đầu: Vô thời hạn</Typography>
                                        <Typography variant="body2" sx={{ color: 'red' }}>❌ Đã quá hạn nộp</Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                        );
                    })}
                    <>
                    {/* {notifications.map((item) => {
                        const result = calculateTimes(item);
                        // console.log(result);
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
                                                        disabled={(!result.isLateYear)?false:(!result.isInProgress)}
                                                    />
                                                }
                                                label={<Typography variant="subtitle1" className="font-semibold">📝 {reportName}</Typography>}
                                            />
                                            {result.isLateYear?(<Typography variant="body2">📅 {result.isInProgress ? 'Kết thúc sau' : 'Bắt đầu sau'}: {result.countdown}</Typography>):
                                                (<Typography variant="body2" style={{color:"red"}} >📅 {result.isInProgress ? 'Kết thúc sau' : 'Bắt đầu sau'}: {result.countdown}</Typography>)}

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

                    })} */}
                    {/*{notifications.map((item) => {*/}
                    {/*    const result = calculateTimes(item);*/}
                    {/*    const isSelected = selectedItemId === item.id;*/}

                    {/*    // 🔹 Kiểm tra trong mảng báo cáo xem có bản nộp tương ứng chưa*/}
                    {/*    const currentYear = dayjs().year();*/}
                    {/*    const currentMonth = dayjs().month() + 1;*/}
                    {/*    const currentWeek = dayjs().week?.() ?? 44; // nếu có plugin weekOfYear*/}
                    {/*    const isSubmitted = notificationsOld.some(r => {*/}
                    {/*        if (r.id_loaibaocao !== item.id_loaibaocao) return false;*/}
                    {/*        if (r.year_report !== currentYear) return false;*/}

                    {/*        const reportStart = dayjs(result.nextNotifyDate, "dddd, DD/MM/YYYY HH:mm");*/}
                    {/*        const submitTime = dayjs(r.created_at);*/}

                    {/*        // Nếu nộp trước khi tới hạn thì không tính*/}
                    {/*        if (submitTime.isBefore(reportStart)) return false;*/}

                    {/*        // Xác định chu kỳ thực tế của kỳ báo cáo*/}
                    {/*        const notifyWeek = reportStart.week();*/}
                    {/*        const notifyMonth = reportStart.month() + 1;*/}

                    {/*        // 🔹 Báo cáo tuần*/}
                    {/*        if (item.id_loaibaocao === 1) {*/}
                    {/*            return r.week_report === notifyWeek;*/}
                    {/*        }*/}

                    {/*        // 🔹 Báo cáo tháng*/}
                    {/*        if (item.id_loaibaocao === 2) {*/}
                    {/*            return r.month_report === notifyMonth;*/}
                    {/*        }*/}

                    {/*        // 🔹 Báo cáo quý (nếu có dùng)*/}
                    {/*        if (item.id_loaibaocao === 3) {*/}
                    {/*            return r.quarterly_report && submitTime.isAfter(reportStart);*/}
                    {/*        }*/}

                    {/*        // 🔹 Báo cáo năm — chỉ cần đúng năm và nộp sau ngày bắt đầu*/}
                    {/*        if (item.id_loaibaocao === 4) {*/}
                    {/*            return r.year_report === currentYear && submitTime.isAfter(reportStart);*/}
                    {/*        }*/}

                    {/*        return false;*/}
                    {/*    });*/}

                    {/*    // 🔹 Xử lý format ngày*/}
                    {/*    const clean = result.nextNotifyDate?.split(", ")[1];*/}
                    {/*    if (!clean) return null;*/}
                    {/*    const parsed = dayjs(clean, "DD/MM/YYYY HH:mm");*/}
                    {/*    const dateall = dayjs(parsed);*/}
                    {/*    const getmonthin = dateall.month() + 1;*/}

                    {/*    if (getmonthin !== 12) {*/}
                    {/*        const getweekin = dateall.week();*/}
                    {/*        const reportName = reportMapName[item.id_loaibaocao] +*/}
                    {/*            (item.id_loaibaocao === 1 ? `  ${getweekin}` : '') +*/}
                    {/*            (item.id_loaibaocao === 2 ? (getmonthin === 3 ? `Quý 1` :*/}
                    {/*                (getmonthin === 6 ? `6 Tháng` :*/}
                    {/*                    (getmonthin === 9 ? `9 Tháng` : `${getmonthin}`))) : '') +*/}
                    {/*            (item.id_loaibaocao === 4 && item.quarter ? ` Lần ${item.quarter}` : '') +*/}
                    {/*            (item.id_loaibaocao === 3 && item.quarter ? */}
                    {/*                (item.quarter === 1 ? " Quý 1" :*/}
                    {/*                    item.quarter === 2 ? " 6 tháng" :*/}
                    {/*                        item.quarter === 3 ? " 9 tháng" : "") : '');*/}
                    {/*        return (*/}
                    {/*            <Grid item xs={12} md={6} key={item.id}>*/}
                    {/*                <Card*/}
                    {/*                    onClick={() => handleSelect(item.id)}*/}
                    {/*                    variant="outlined"*/}
                    {/*                    sx={{*/}
                    {/*                        borderColor: isSelected ? 'primary.main' : 'grey.300',*/}
                    {/*                        backgroundColor: isSelected ? 'primary.50' : 'white',*/}
                    {/*                        cursor: 'pointer',*/}
                    {/*                        transition: 'all 0.3s ease',*/}
                    {/*                        borderRadius: 2,*/}
                    {/*                        '&:hover': { boxShadow: 3 }*/}
                    {/*                    }}*/}
                    {/*                >*/}
                    {/*                    <CardContent className="w-full">*/}
                    {/*                        <FormControlLabel*/}
                    {/*                            control={*/}
                    {/*                                <Checkbox*/}
                    {/*                                    checked={isSubmitted || isSelected}*/}
                    {/*                                    onChange={() => handleSelect(item.id)}*/}
                    {/*                                    onClick={(e) => e.stopPropagation()}*/}
                    {/*                                    color="primary"*/}
                    {/*                                    disabled={isSubmitted || (!result.isLateYear ? false : !result.isInProgress)}*/}
                    {/*                                />*/}
                    {/*                            }*/}
                    {/*                            label={*/}
                    {/*                                <Typography variant="subtitle1" className="font-semibold">*/}
                    {/*                                    📝 {reportName}{" "}*/}
                    {/*                                    {isSubmitted && <span style={{ color: "green" }}> (Đã nộp)</span>}*/}
                    {/*                                </Typography>*/}
                    {/*                            }*/}
                    {/*                        />*/}
                    {/*                        <Typography*/}
                    {/*                            variant="body2"*/}
                    {/*                            style={result.isLateYear ? {} : { color: "red" }}*/}
                    {/*                        >*/}
                    {/*                            📅 {result.isInProgress ? 'Kết thúc sau' : 'Bắt đầu sau'}: {result.countdown}*/}
                    {/*                        </Typography>*/}
                    {/*                        <Typography variant="body2">*/}
                    {/*                            ⏰ Ngày bắt đầu: {result.nextNotifyDate || 'Không tính được'}*/}
                    {/*                        </Typography>*/}
                    {/*                        <Typography*/}
                    {/*                            variant="body2"*/}
                    {/*                            className={result.isInProgress ? 'text-red-600 font-semibold' : ''}*/}
                    {/*                        >*/}
                    {/*                            ⏳ Hạn nộp: {result.deadlineTime || 'Không tính được'}*/}
                    {/*                        </Typography>*/}
                    {/*                    </CardContent>*/}
                    {/*                </Card>*/}
                    {/*            </Grid>*/}
                    {/*        );*/}
                    {/*    }*/}
                    {/*})}*/}
                    </>
                    {notifications.map((item) => {

                        const result = calculateTimes(item);
                        // console.log(result);
                        const isSelected = selectedItemId === item.id;
                        const currentYear = dayjs().year();
                        // const currentMonth = dayjs().month() + 1;
                        // const currentWeek = dayjs().week?.() ?? 44;
                        // 🔹 Kiểm tra xem kỳ báo cáo này đã được nộp chưa
                        const isSubmitted = notificationsOld.some(r => {
                            if (r.id_loaibaocao !== item.id_loaibaocao) return false;
                            if (r.year_report !== currentYear) return false;

                            const reportStart = dayjs(result.nextNotifyDate, "dddd, DD/MM/YYYY HH:mm");
                            const submitTime = dayjs(r.created_at);
                            if (submitTime.isBefore(reportStart)) return false;

                            const notifyWeek = reportStart.week();
                            const notifyMonth = reportStart.month() + 1;

                            if (item.id_loaibaocao === 1) {
                                return r.week_report === notifyWeek;
                            }
                            if (item.id_loaibaocao === 2) {
                                return r.month_report === notifyMonth;
                            }
                            if (item.id_loaibaocao === 3) {
                                return r.quarterly_report && submitTime.isAfter(reportStart);
                            }
                            if (item.id_loaibaocao === 4) {
                                return r.year_report === currentYear && submitTime.isAfter(reportStart);
                            }
                            return false;
                        });

                        // 🔹 Tính chu kỳ cũ (chỉ áp dụng cho báo cáo tuần và tháng)
                        let previousCycle = null;
                        if (result.nextNotifyDate && (item.id_loaibaocao === 1 || item.id_loaibaocao === 2)) {
                            const nextCycle = dayjs(result.nextNotifyDate, "dddd, DD/MM/YYYY HH:mm");
                            previousCycle =
                                item.id_loaibaocao === 1
                                    ? nextCycle.subtract(7, "day") // tuần trước
                                    : nextCycle.subtract(1, "month"); // tháng trước
                        }

                        // 🔹 Format ngày để hiển thị
                        const clean = result.nextNotifyDate?.split(", ")[1];
                        if (!clean) return null;
                        const parsed = dayjs(clean, "DD/MM/YYYY HH:mm");
                        const dateall = dayjs(parsed);
                        const getmonthin = dateall.month() + 1;

                        // 🔹 Chuẩn bị tên báo cáo
                        const getweekin = dateall.week();
                        const reportName = reportMapName[item.id_loaibaocao] +
                            (item.id_loaibaocao === 1 ? `  ${getweekin}` : '') +
                            (item.id_loaibaocao === 2 ? (getmonthin === 3 ? ` Quý 1` :
                                (getmonthin === 6 ? ` 6 Tháng` :
                                    (getmonthin === 9 ? ` 9 Tháng` : ` ${getmonthin}`))) : '') +
                            (item.id_loaibaocao === 4 && item.quarter ? ` Lần ${item.quarter}` : '') +
                            (item.id_loaibaocao === 3 && item.quarter ?
                                (item.quarter === 1 ? " Quý 1" :
                                    item.quarter === 2 ? " 6 tháng" :
                                        item.quarter === 3 ? " 9 tháng" : "") : '');

                        // 🔹 Card hiển thị kỳ cũ (nếu chưa đến kỳ mới)
                        let oldCard = null;
                        if (previousCycle && !result.isInProgress && !isSubmitted) {
                            const prevWeek = previousCycle.week();
                            const prevMonth = previousCycle.month() + 1;
                            const oldReportName = reportMapName[item.id_loaibaocao] +
                                (item.id_loaibaocao === 1 ? ` ${prevWeek}` : '') +
                                (item.id_loaibaocao === 2 ? ` ${prevMonth}` : '');

                            oldCard = (
                                <Grid item xs={12} md={6} key={`old-${item.id}`}>
                                    <Card
                                        onClick={() => handleSelect(item.id)}
                                        variant="outlined"
                                        sx={{
                                            borderColor: isSelected ? 'primary.main' : 'grey.300',
                                            backgroundColor: isSelected ? 'primary.50' : 'white',
                                            cursor: 'pointer',
                                            transition: 'all 0.3s ease',
                                            borderRadius: 2,
                                            '&:hover': { boxShadow: 3 }
                                        }}
                                    >
                                        <CardContent>
                                            <FormControlLabel
                                                control={
                                                    <Checkbox
                                                        checked={ isSelected}
                                                        onChange={() => handleSelect(item.id)}
                                                        onClick={(e) => e.stopPropagation()}
                                                        color="primary"
                                                        disabled={!result.autoShifted}
                                                    />
                                                }
                                                label={
                                                    <Typography variant="subtitle1" className="font-semibold">
                                                        📝 {oldReportName}{" "}
                                                        {isSubmitted && <span style={{ color: "green" }}> (Đã nộp)</span>}
                                                    </Typography>
                                                }
                                            />
                                            {/*<Typography variant="subtitle1" className="font-semibold">*/}
                                            {/*    🗂️ {oldReportName} (Kỳ trước)*/}
                                            {/*</Typography>*/}
                                            <Typography variant="body2"  className={'text-red-600 font-semibold' }>
                                                📅 Đã quá hạn vui lòng nhập lại
                                            </Typography>
                                            <Typography variant="body2">
                                                ⏰ Ngày bắt đầu: {previousCycle.format('dddd, DD/MM/YYYY HH:mm')}
                                            </Typography>
                                            <Typography variant="body2">
                                                🔚 Hạn nộp: {previousCycle.add(parseInt(item.deadline), 'hour').format('dddd, DD/MM/YYYY HH:mm')}
                                            </Typography>
                                        </CardContent>
                                    </Card>
                                </Grid>
                            );
                        }
                        if (getmonthin !== 12&&selectedItemId!==2) {
                            return (
                                <React.Fragment key={item.id}>
                                    {/* Hiển thị kỳ cũ nếu có */}
                                    {oldCard}

                                    {/* Card chính của kỳ hiện tại / sắp tới */}
                                    <Grid item xs={12} md={6}>
                                        <Card
                                            onClick={() => handleSelect(item.id)}
                                            variant="outlined"
                                            sx={{
                                                borderColor: isSelected ? 'primary.main' : 'grey.300',
                                                backgroundColor: isSelected ? 'primary.50' : 'white',
                                                cursor: 'pointer',
                                                transition: 'all 0.3s ease',
                                                borderRadius: 2,
                                                '&:hover': { boxShadow: 3 }
                                            }}
                                        >
                                            <CardContent className="w-full">
                                                <FormControlLabel
                                                    control={
                                                        <Checkbox
                                                            checked={isSubmitted || isSelected}
                                                            onChange={() => handleSelect(item.id)}
                                                            onClick={(e) => e.stopPropagation()}
                                                            color="primary"
                                                            disabled={isSubmitted || (!result.isLateYear ? false : !result.isInProgress)}
                                                        />
                                                    }
                                                    label={
                                                        <Typography variant="subtitle1" className="font-semibold">
                                                            📝 {reportName}{" "}
                                                            {isSubmitted && <span style={{ color: "green" }}> (Đã nộp)</span>}
                                                        </Typography>
                                                    }
                                                />
                                                <Typography
                                                    variant="body2"
                                                    style={result.isLateYear ? {} : { color: "red" }}
                                                >
                                                    📅 {result.isInProgress ? 'Kết thúc sau' : 'Bắt đầu sau'}: {result.countdown}
                                                </Typography>
                                                <Typography variant="body2">
                                                    ⏰ Ngày bắt đầu: {result.nextNotifyDate || 'Không tính được'}
                                                </Typography>
                                                <Typography
                                                    variant="body2"
                                                    className={result.isInProgress ? 'text-red-600 font-semibold' : ''}
                                                >
                                                    ⏳ Hạn nộp: {result.deadlineTime || 'Không tính được'}
                                                </Typography>
                                            </CardContent>
                                        </Card>
                                    </Grid>
                                </React.Fragment>
                            );
                        }

                    })}
                </Grid>
            )}
        </div>
    );
};

export default ReportNotificationScheduler;
