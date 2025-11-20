import React, { useState, useEffect } from 'react';
import { TextField, Button, Grid, Typography, Box, InputAdornment,FormControlLabel ,Checkbox, MenuItem} from '@mui/material';
import  TableHearder from '../../components/Table/TableHearder';
import api from "@/config"; // axios base config
import { confirmAlert } from "react-confirm-alert";
import "react-confirm-alert/src/react-confirm-alert.css";
import dayjs from "dayjs";
import 'dayjs/locale/vi'; // <--- import locale Vietnamese
dayjs.locale('vi');
const ReportNotificationWeekForm = ({ notification, onUpdate }) => {
    const [nextNotifyDate, setNextNotifyDate] = useState('');
    const [deadlineTime, setDeadlineTime] = useState('');
    const [notificationTime, setNotificationTime] = useState('');
    const [notificationAfterTime, setNotificationAfterTime] = useState('');
    const [errors, setErrors] = useState({});
    const [formData, setFormData] = useState({
        id: null,
        start_day: '',
        deadline: '',
        month: '',
        reminder_before_hours: '',
        reminder_after_hours:"",
        id_loaibaocao:2,
        quarter:"",
        description:"",
    });
    useEffect(() => {
        const { start_day, deadline, reminder_before_hours, reminder_after_hours } = formData;

        if (start_day !== '' && deadline !== '') {
            const now = dayjs();
            const startDayInt = parseInt(start_day);
            const deadlineHours = parseInt(deadline);

            // Tạm tính base ngày trong tháng hiện tại
            let nextNotify = dayjs()
                .year(now.year())
                .month(now.month())
                .date(startDayInt)
                .hour(0)
                .minute(0)
                .second(0);

            let expire = nextNotify.add(deadlineHours, 'hour');

            // Nếu đã quá hạn thì đẩy sang tháng sau
            if (expire.isBefore(now)) {
                nextNotify = nextNotify.add(1, 'month');
                expire = nextNotify.add(deadlineHours, 'hour');
            }
            // Thời gian nhắc lần 1 và lần 2
            const notification1 = nextNotify.add(parseInt(reminder_after_hours || 0), "hour");
            const notification2 = nextNotify.add(parseInt(reminder_before_hours || 0), "hour");

            setNextNotifyDate(nextNotify.format("dddd, DD/MM/YYYY HH:mm"));
            setDeadlineTime(expire.format("dddd, DD/MM/YYYY HH:mm"));
            setNotificationAfterTime(notification1.format("dddd, DD/MM/YYYY HH:mm"));
            setNotificationTime(notification2.format("dddd, DD/MM/YYYY HH:mm"));
        } else {
            setNextNotifyDate('');
            setNotificationTime('');
            setNotificationAfterTime('');
            setDeadlineTime('');
        }
    }, [formData.start_day, formData.deadline, formData.reminder_before_hours, formData.reminder_after_hours]);
    useEffect(() => {
        const fetchWeek = async () => {
            try {
                const { data } = await api.get("/report-notifications-admin/2");
                // console.log(data);
                if(data && data.length > 0)
                    setFormData({
                        id: data[0].id,
                        start_day: data[0].start_day,
                        deadline:data[0].deadline,
                        month: data[0].month,
                        reminder_before_hours: data[0].reminder_before_hours,
                        reminder_after_hours:data[0].reminder_after_hours,
                        id_loaibaocao:2,
                        quarter:data[0].quarter,
                        description:data[0].description,
                    });
            } catch (err) {
                confirmAlert({
                    title: "Lỗi",
                    message: "Không thể tải thông tin .",
                    buttons: [{ label: "OK", onClick: () => {} }],
                });
            }
        };
        fetchWeek();

        if (notification) {
            setFormData({
                id: notification.id,
                start_day: notification.start_day,
                deadline:notification.deadline,
                month: notification.month,
                reminder_before_hours: notification.reminder_before_hours,
                reminder_after_hours:notification.reminder_after_hours,
                id_loaibaocao:2,
                quarter:notification.quarter,
                description:notification.description,
            });
        }
    }, [notification]);
    const handleChange = (e) => {
        const { name, value } = e.target;
        const intVal = parseInt(value);
        // Kiểm tra riêng cho ngày bắt đầu nộp trong tháng
        if (name === "start_day") {
            // console.log()
            if (intVal < 1 || intVal > 28) {
                setErrors((prev) => ({
                    ...prev,
                    start_day: "Ngày bắt đầu phải từ 1 đến 28",
                }));
            } else {
                setErrors((prev) => ({ ...prev, start_day: null }));
            }
        }

        setFormData({ ...formData, [name]: value });
    };

    // const handleChange = (e) => {
    //     const { name, value } = e.target;
    //     setFormData({ ...formData, [name]: value });
    // };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const {
            deadline,
            reminder_before_hours,
            reminder_after_hours,
            start_day,
            month,
            id_loaibaocao,
            quarter,
            description,
        } = formData;

        const deadlineHours = parseInt(deadline);
        const beforeHours = parseInt(reminder_before_hours || 0);
        const afterHours = parseInt(reminder_after_hours || 0);

        if (beforeHours > deadlineHours || afterHours > deadlineHours) {
            confirmAlert({
                title: "Lỗi thời gian",
                message: "Thời gian nhắc nhở không được lớn hơn thời gian hết hạn.",
                buttons: [{ label: "OK", onClick: () => {} }],
            });
            return;
        }else if(formData.deadline===""||formData.reminder_after_hours===""||formData.start_day===""||formData.description===""||formData.id_loaibaocao===""){
            confirmAlert({
                title: "Lỗi",
                message: "Vui lòng nhập đầy đủ thông tin.",
                buttons: [{ label: "OK", onClick: () => {} }],
            });
            return;
        }
        // console.log(formData);
        try {
            let res;
            if (formData.id) {
                // Nếu đã có ID, tức là đang cập nhật
                res = await api.put(`/report-notifications/${formData.id}`, formData);
            } else {
                // Nếu chưa có ID, tức là tạo mới
                res = await api.post(`/report-notifications`, formData);
            }

            confirmAlert({
                title: "Thành công",
                message: "Thông báo đã được lưu!",
                buttons: [{ label: "OK", onClick: () => {} }],
            });

            if (onUpdate) {
                onUpdate(res.data); // Truyền dữ liệu mới về cho cha nếu cần
            }
        } catch (error) {
            console.error("Lỗi khi lưu thông báo:", error);
            confirmAlert({
                title: "Lỗi",
                message: "Không thể lưu thông báo. Vui lòng thử lại.",
                buttons: [{ label: "OK", onClick: () => {} }],
            });
        }
    };

    // const handleCheckboxChange = (e) => {
    //     setFormData({ ...formData, enable_reminder: e.target.checked });
    // };


    return (
        <TableHearder title="Điều chỉnh thông báo theo tháng" backlink="/notification">
            <Box className="max-w-screen-lg mx-auto p-6 bg-white shadow-md rounded-lg">
                <form onSubmit={handleSubmit}>
                    <Grid container spacing={2}>
                        {/* Thời gian thông báo */}
                        <Grid item xs={12} className="w-full">
                            <TextField
                                label="Ngày bắt đầu nộp báo cáo trong tháng"
                                type="number"
                                name="start_day"
                                value={formData.start_day}
                                onChange={handleChange}
                                fullWidth
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <span style={{ whiteSpace: "nowrap" }}>Ngày</span>
                                        </InputAdornment>
                                    ),
                                }}
                                inputProps={{
                                    min: 1,
                                    max: 28,
                                }}
                                error={!!errors.start_day}
                                helperText={errors.start_day}
                            />
                        </Grid>

                        {/* Thời gian hết hạn */}
                        <Grid item xs={12} className="w-full">
                            <TextField
                                label="Thời gian hết hạn nộp tính từ 0h Ngày trong tháng bắt đầu"
                                type="number"
                                name="deadline"
                                value={formData.deadline}
                                onChange={handleChange}
                                fullWidth
                                InputProps={{
                                    startAdornment: <InputAdornment position="start"><span style={{ whiteSpace: "nowrap" }}>Giờ</span></InputAdornment>,
                                }}
                            />
                        </Grid>
                        {/* Số giờ trước deadline để nhắc nhở */}
                        <Grid item xs={12} sm={6} className="w-full">
                            <TextField
                                label="Thời gian trì hoãn (delay) thông báo lần 1"
                                type="number"
                                name="reminder_after_hours"
                                value={formData.reminder_after_hours} // thong báo trước hạn cụ thể là vài tiếng trước khi hết hạn
                                onChange={handleChange}
                                fullWidth
                                InputProps={{
                                    startAdornment: <InputAdornment position="start">Giờ</InputAdornment>,
                                }}
                            />
                        </Grid>
                        {/* <Grid item xs={12} sm={6} className="w-full">
                            <TextField
                                label="Thời gian thông báo nhắc nhở lần 2"
                                type="number"
                                name="reminder_before_hours"
                                value={formData.reminder_before_hours} // thong báo trước hạn cụ thể là vài tiếng trước khi hết hạn
                                onChange={handleChange}
                                fullWidth
                                InputProps={{
                                    startAdornment: <InputAdornment position="start">Giờ</InputAdornment>,
                                }}
                            />
                        </Grid> */}
                        <Grid item xs={12} className="w-full">
                            <TextField
                                label="Nội dung thông báo"
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                multiline
                                rows={4} // Đặt số dòng cho TextArea
                                fullWidth
                                variant="outlined"
                                className="mb-4"
                            />
                        </Grid>
                        {/*<Grid item xs={12} className="w-full">*/}
                        {/*    <FormControlLabel*/}
                        {/*        control={*/}
                        {/*            <Checkbox*/}
                        {/*                checked={formData.check}*/}
                        {/*                onChange={handleCheckboxChange}*/}
                        {/*                name="enable_reminder"*/}
                        {/*                color="primary"*/}
                        {/*            />*/}
                        {/*        }*/}
                        {/*        label="Lặp lại hàng tuần"*/}
                        {/*    />*/}
                        {/*</Grid>*/}
                        {nextNotifyDate && (
                            <>
                                <Typography variant="subtitle1">
                                    🔔 Thời gian bắt đầu nộp báo cáo: <strong>{nextNotifyDate}</strong>
                                </Typography>
                                <Typography variant="subtitle1">
                                    ⏳ Thời gian hết hạn nộp báo cáo: <strong>{deadlineTime}</strong>
                                </Typography>
                                <Typography variant="subtitle1">
                                    ⏳ Thời gian thông báo đến người dùng lần 1: <strong>{notificationAfterTime}</strong>
                                </Typography>
                                {/* <Typography variant="subtitle1">
                                    ⏳ Thời gian thông báo nhắc nhở nộp báo cáo lần 2: <strong>{notificationTime}</strong>
                                </Typography> */}
                            </>
                        )}
                        {/* Nút Cập nhật */}
                        <Grid item xs={12} className="flex justify-center mt-4" >
                            <Button
                                type="submit"
                                variant="contained"
                                color="primary"
                                className="w-full md:w-auto"
                            >
                                Lưu Thông Báo
                            </Button>
                        </Grid>
                    </Grid>
                </form>
            </Box>
        </TableHearder>
    );
};

export default ReportNotificationWeekForm;
