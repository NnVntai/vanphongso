import {
    Box,
    Typography,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Grid,
    Button,
    Card,
    CardContent,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Fade
} from "@mui/material";
import ExcelJS from 'exceljs';
// import "x-data-spreadsheet/dist/xspreadsheet.css";
// import Spreadsheet from "x-data-spreadsheet";
import {confirmAlert} from 'react-confirm-alert';
import 'react-confirm-alert/src/react-confirm-alert.css'; // Bắt buộ
import Handsontable from 'handsontable';
import ExcelDownloader from "@/components/REportModal/DownLoadTeamPlate";
import 'handsontable/dist/handsontable.full.min.css';
import UploadFileIcon from "@mui/icons-material/UploadFile";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import TableHearder from "../../components/Table/TableHearder";
import dayjs from 'dayjs';
import 'dayjs/locale/vi';

import api from "@/config";
import React, {useEffect, useState, useRef} from "react";
import StepWizard from "../../components/Wizard/StepWizard.jsx"
// import dayjs from "dayjs";
dayjs.locale('vi');

async function getTimeInfo(timezone = "Asia/Ho_Chi_Minh", allowedDifferenceMinutes = 1) {
    try {

        const clientTime = new Date().toISOString();

        const response = await api.post("/time-info", {
            timezone,
            tolerance: allowedDifferenceMinutes,
            clientTime
        });
        if (!response.statusText) throw new Error(`Lỗi API: ${response.status}`);
        const data = response.data;
        // Giải nén dữ liệu
        const {
            year,
            month,
            day,
            hour,
            minute,
            week,
            quarter,
            diffMinutes,
            isTimeAccurate
        } = data;
        if (!isTimeAccurate) {
            confirmAlert({
                title: "Lỗi đồng bộ thời gian",
                message: `⚠️ Giờ máy bạn đang lệch ${diffMinutes ?? "nhiều"} phút so với giờ chuẩn. 
                  Vui lòng chỉnh lại giờ trong máy tính cá nhân trước khi nộp.`,
                buttons: [{ label: "OK", onClick: () => {} }]
            });
        } else {
            console.log("✅ Giờ máy khớp với giờ chuẩn.");
        }
        return data;
    } catch (err) {
        console.error("❌ Lỗi khi lấy thời gian từ API:", err.message);
        return null;
    }
}
function getMachineTime() {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const day = now.getDate();
    const hour = now.getHours();
    const minute = now.getMinutes();
    const quarter = Math.floor((month - 1) / 3) + 1;
    const week = getISOWeek(now);
    return {
        now,
        year,
        month,
        day,
        hour,
        minute,
        week,
        quarter,
    };
}

// ✅ Hàm phụ tính tuần ISO (ISO Week Number)
function getISOWeek(date) {
    const tmp = new Date(date.getTime());
    tmp.setHours(0, 0, 0, 0);
    tmp.setDate(tmp.getDate() + 3 - ((tmp.getDay() + 6) % 7));
    const week1 = new Date(tmp.getFullYear(), 0, 4);
    return 1 + Math.round(((tmp - week1) / 86400000 - 3 + ((week1.getDay() + 6) % 7)) / 7);
}

export default function FileInterface() {
    const mergesRef = useRef([]);
    const [loadingGlobal, setLoadingGlobal] = useState(false);
    const [fileTypes, setFileTypes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedFileType, setSelectedFileType] = useState("");
    const [week, setWeek] = useState("");
    const [month, setMonth] = useState("");
    const [quarter, setQuarter] = useState("");
    const [numberYear, setNumberYear] = useState("");
    const [isLate, setIsLate] = useState(false);
    // const [notification, setNotification] = useState("");
    const [year, setYear] = useState("");
    const [fileName, setFileName] = useState("");
    const [previewData, setPreviewData] = useState([]);
    const [openDialog, setOpenDialog] = useState(false);
    const inputRef = useRef(null);
    let datapost = useRef([]);
    let datapostyear = useRef([]);
    const selectedType = parseInt(selectedFileType);
    const handleClick = () => inputRef.current.click();
    const [nextStep, setNextStep] = useState(false);
    const [reportCheck, setReportCheck] = useState();

    const toValidString = (value) => {
        if (value === null || value === undefined || value === "") {
            return "0"; // hoặc "" nếu cơ sở dữ liệu chấp nhận chuỗi rỗng
        }
        return String(value);
    };

    const handleFileChange = async (event) => {
        const file = event.target.files[0];
        if (file) {
            const isXlsx = file.name.endsWith('.xlsx') ||
                file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
            if (!isXlsx) {
                confirmAlert({
                    title: 'Lỗi',
                    message: '❌ Vui lòng tải đúng file báo cáo',
                    buttons: [
                        {
                            label: 'OK', onClick: () => {
                            }
                        }
                    ]
                });
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
                    let previrewExcel = jsonData.slice(8, 500);
                    // console.log(selectedFileType);
                    if (selectedFileType === 1&&previrewExcel[0].length >8) {
                        console.log(jsonData.slice(6,7)[0][6],("W"+week+month+year+JSON.parse(localStorage.getItem("username")).id),jsonData.slice(6,7)[0][7]);
                        if(jsonData.slice(6,7)[0][7]!==("W"+week+month+year+JSON.parse(localStorage.getItem("username")).id))
                        {
                            resetFileUpload();
                            confirmAlert({
                                title: 'Lỗi',
                                message: '❌ Có vẻ bạn không tải lên đúng loại file.',
                                buttons: [
                                    {
                                        label: 'OK', onClick: () => {
                                        }
                                    }
                                ]
                            });
                            return;
                        }
                    }else if(selectedFileType === 2&&previrewExcel[0].length>8){
                        // console.log(jsonData.slice(6,7)[0][6],("W"+week+month+year));
                        if(jsonData.slice(6,7)[0][7]!==("M"+month+year+JSON.parse(localStorage.getItem("username")).id))
                        {
                            resetFileUpload();
                            confirmAlert({
                                title: 'Lỗi',
                                message: '❌ Có vẻ bạn không tải lên đúng loại file.',
                                buttons: [
                                    {
                                        label: 'OK', onClick: () => {
                                        }
                                    }
                                ]
                            });
                            return;
                        }
                    }else if(selectedFileType === 3&&previrewExcel[0].length <9){
                        // console.log(jsonData.slice(6,7)[0][5],("W"+quarter+year));
                        if(jsonData.slice(6,7)[0][6]!==("Q"+quarter+year+JSON.parse(localStorage.getItem("username")).id))
                        {
                            resetFileUpload();
                            confirmAlert({
                                title: 'Lỗi',
                                message: '❌ Có vẻ bạn không tải lên đúng loại file.',
                                buttons: [
                                    {
                                        label: 'OK', onClick: () => {
                                        }
                                    }
                                ]
                            });
                            return;
                        }
                    }else if(selectedFileType === 4&&previrewExcel[0].length <9){
                        // console.log(jsonData.slice(6,7)[0][5],("W"+numberYear+year));
                        console.log(jsonData.slice(6,7)[0][6]);
                        if(jsonData.slice(6,7)[0][6]!==("Y"+numberYear+year+JSON.parse(localStorage.getItem("username")).id))
                        {
                            resetFileUpload();
                            confirmAlert({
                                title: 'Lỗi',
                                message: '❌ Có vẻ bạn không tải lên đúng loại file.',
                                buttons: [
                                    {
                                        label: 'OK', onClick: () => {
                                        }
                                    }
                                ]
                            });
                            return;
                        }
                    }
                    if (previrewExcel[0].length < 9 && selectedFileType > 2) {
                        // console.log(previrewExcel[0].length);
                        if(selectedFileType===3&&quarter>1)
                        {
                            if(quarter===2||quarter===3||quarter===4)
                            {
                                for (let i = 0; i < previrewExcel.length; i++) {
                                    if (previrewExcel[i][7] == true) {
                                        datapost.current.push(
                                        {
                                            id_report: null,
                                            id_chitieu: previrewExcel[i][6],
                                            value1: (previrewExcel[i][3] && typeof previrewExcel[i][3] === 'object') ? toValidString(previrewExcel[i][3].result) : toValidString(previrewExcel[i][3]),
                                            value2: (previrewExcel[i][6] && typeof previrewExcel[i][6] === 'object') ? toValidString(previrewExcel[i][6].result) : toValidString(previrewExcel[i][6]),
                                            value3: null,
                                        });
                                        datapostyear.current.push(
                                            {
                                                id_report: null,
                                                id_chitieu: previrewExcel[i][6],
                                                value1: (previrewExcel[i][4] && typeof previrewExcel[i][4] === 'object') ? toValidString(previrewExcel[i][4].result) : toValidString(previrewExcel[i][4]),
                                                value2: (previrewExcel[i][7] && typeof previrewExcel[i][7] === 'object') ? toValidString(previrewExcel[i][7].result) : toValidString(previrewExcel[i][7]),
                                                value3: null,
                                            });

                                    }
                                }
                            }
                        }else{
                            for (let i = 0; i < previrewExcel.length; i++) {
                                if (previrewExcel[i][7] == true) {
                                    datapost.current.push(
                                        {
                                            id_report: null,
                                            id_chitieu: previrewExcel[i][6],
                                            value1: (previrewExcel[i][3] && typeof previrewExcel[i][3] === 'object') ? toValidString(previrewExcel[i][3].result) : toValidString(previrewExcel[i][3]),
                                            value2: (previrewExcel[i][5] && typeof previrewExcel[i][5] === 'object') ? toValidString(previrewExcel[i][5].result) : toValidString(previrewExcel[i][5]),
                                            value3: null,
                                        });
                                }
                            }
                        }

                    } else if (previrewExcel[0].length > 8 && selectedFileType < 3) {
                        for (let i = 0; i < previrewExcel.length; i++) {
                            if (previrewExcel[i][8] == true) {
                                datapost.current.push(
                                    {
                                        id_report: null,
                                        id_chitieu: previrewExcel[i][7],
                                        value1: (previrewExcel[i][3] && typeof previrewExcel[i][3] === 'object') ? toValidString(previrewExcel[i][3].result) : toValidString(previrewExcel[i][3]),
                                        value2: (previrewExcel[i][5] && typeof previrewExcel[i][5] === 'object') ? toValidString(previrewExcel[i][5].result) : toValidString(previrewExcel[i][5]),
                                        value3: (previrewExcel[i][6] && typeof previrewExcel[i][6] === 'object') ? toValidString(previrewExcel[i][6].result) : toValidString(previrewExcel[i][6]),
                                    });
                            }
                        }
                    } else {
                        resetFileUpload();
                        confirmAlert({
                            title: 'Lỗi',
                            message: '❌ Có vẻ bạn không tải lên đúng loại file.',
                            buttons: [
                                {
                                    label: 'OK', onClick: () => {
                                    }
                                }
                            ]
                        });
                    }
                } catch (e) {
                    console.error("Lỗi khi tải cấu trúc tiệp:", e);
                }
            };
            reader.readAsArrayBuffer(file);
        }
    };
    const fetchFileTypes = async () => {
        try {
            const {data} = await api.get("/loaibaocao");
            setFileTypes(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error("Lỗi khi tải loại tệp:", err);
        } finally {
            setLoading(false);
        }
    };
    const resetFileUpload = () => {
        setFileName("");
        setPreviewData([]);
        datapost.current = [];
        if (inputRef.current) {
            inputRef.current.value = null;
        }
    };
    const fetchAndSetTime = async () => {
        const result = await getTimeInfo();  // ← Lấy dữ liệu từ API thời gian
        if (result && result.isTimeAccurate) {
            setYear(result.year);
            setMonth(result.month);
            setWeek(result.week);
            setQuarter(result.quarter);
        }
        // console.log(result);
    };
    // LOAD LẦN ĐẦU
    useEffect(() => {
        const machineTime = getMachineTime();
        setYear(machineTime.year);
        setMonth(machineTime.month);
        setWeek(machineTime.week);
        setQuarter(machineTime.quarter);
        fetchAndSetTime();  // Gọi hàm
        fetchFileTypes();
    }, []);
    // useEffect(() => {
    //     console.log(year,month,week,quarter,selectedFileType);
    // }, [year,month,week,quarter,selectedFileType]);
    const checkClickSend = async () => {

        if (!selectedFileType || !year ||!fileName||
            (selectedType === 1 && (!week || !month)) ||
            (selectedType === 2 && !month) ||
            (selectedType === 3 && !quarter) ||
            (selectedType === 4 && !numberYear)) {
            confirmAlert({
                title: 'Thiếu thông tin',
                message: '⚠️ Vui lòng chọn báo cáo cần nộp.',
                buttons: [
                    {
                        label: 'OK', onClick: () => {
                        }
                    }
                ]
            });
            return;
        }
        setOpenDialog(true);

    }
    const handleSubmitReport = async () => {
        setLoadingGlobal(true);
        const file = inputRef.current?.files[0];
        console.log(inputRef.current);
        if (!selectedFileType || !file) return;

        const timeCheck = await getTimeInfo("Asia/Ho_Chi_Minh", 1); // lệch <=1 phút

        if (!timeCheck || !timeCheck.isTimeAccurate) {
            setLoadingGlobal(false);
            confirmAlert({
                title: "Lỗi đồng bộ thời gian",
                message: `⚠️ Giờ máy bạn đang lệch ${timeCheck?.diffMinutes ?? "nhiều"} phút so với giờ chuẩn. 
                      Vui lòng chỉnh lại giờ trong máy tính cá nhân trước khi nộp.`,
                buttons: [
                    { label: "OK", onClick: () => {} }
                ]
            });
            return; // ⛔ Không cho nộp
        }

        const formData = new FormData();
        const user = JSON.parse(localStorage.getItem("username"));
        formData.append("id_user", user.id);
        formData.append("id_xa", user.id_xa);
        formData.append("filename", file);
        formData.append("id_loaibaocao", selectedFileType);
        formData.append("year_report", year);
        formData.append("number_report", numberYear);
        formData.append("islate", isLate);
        if(selectedFileType===1){
            if (week) formData.append("week_report", week);
            if (month) formData.append("month_report", month);
        }else if(selectedFileType===2){
            if (month) formData.append("month_report", month);
        }else if(selectedFileType===3){
            if (quarter) formData.append("quarterly_report", quarter);
        }else if(selectedFileType===4){
            if (numberYear) formData.append("number_report", numberYear);
        }
        try {
            if(selectedFileType===3&&quarter>1)
            {
                try {
                    let response = await api.post("/reports", formData, {
                        headers: {"Content-Type": "multipart/form-data"},
                    });
                    if (response.data.message === 'duplicate') {
                        setLoadingGlobal(false);
                        setNextStep(true);
                        confirmAlert({
                            title: 'Lỗi',
                            message: '❌ Báo cáo này đã được nộp trước đó. Không thể nộp lại.',
                            buttons: [
                                {
                                    label: 'OK', onClick: () => {
                                    }
                                }
                            ]
                        });
                        return; // dừng không tiếp tục xử lý
                    }
                    // Nếu không duplicate, tiếp tục nộp dữ liệu
                    for (let i = 0; i < datapost.current.length; i++) {
                        datapost.current[i].id_report = response.data.id;
                    }
                    await api.post("/report-data-bulk-insert", {records: datapost.current});
                    formData.set("id_loaibaocao", 4);
                    formData.delete("quarterly_report");
                    if(quarter===2)
                    {
                        formData.append("number_report", 3);
                    }else if(quarter===3){
                        formData.append("number_report", 4);
                    }else if(quarter===4){
                        formData.append("number_report", 2);
                    }
                    // báo cao 2
                    let response2 = await api.post("/reports", formData, {
                        headers: {"Content-Type": "multipart/form-data"},
                    });

                    if (response.data.message === 'duplicate') {
                        setLoadingGlobal(false);
                        setNextStep(true);
                        confirmAlert({
                            title: 'Lỗi',
                            message: '❌ Báo cáo này đã được nộp trước đó. Không thể nộp lại.',
                            buttons: [
                                {
                                    label: 'OK', onClick: () => {
                                    }
                                }
                            ]
                        });
                        return; // dừng không tiếp tục xử lý
                    }
                    // Nếu không duplicate, tiếp tục nộp dữ liệu
                    for (let i = 0; i < datapostyear.current.length; i++) {
                        datapostyear.current[i].id_report = response2.data.id;
                    }
                    await api.post("/report-data-bulk-insert", {records: datapostyear.current});
                    confirmAlert({
                        title: 'Thông báo',
                        message: '📬 Báo cáo đã được nộp thành công!',
                        buttons: [
                            {
                                label: 'OK', onClick: () => {
                                }
                            }
                        ]
                    });
                }catch (e) {
                    console.log(e);
                }
            }else{
                let response = await api.post("/reports", formData, {
                    headers: {"Content-Type": "multipart/form-data"},
                });
                if (response.data.message === 'duplicate') {
                    setLoadingGlobal(false);
                    setNextStep(true);
                    confirmAlert({
                        title: 'Lỗi',
                        message: '❌ Báo cáo này đã được nộp trước đó. Không thể nộp lại.',
                        buttons: [
                            {
                                label: 'OK', onClick: () => {
                                }
                            }
                        ]
                    });
                    return; // dừng không tiếp tục xử lý
                }
                // Nếu không duplicate, tiếp tục nộp dữ liệu
                for (let i = 0; i < datapost.current.length; i++) {
                    datapost.current[i].id_report = response.data.id;
                }
                await api.post("/report-data-bulk-insert", {records: datapost.current});
                confirmAlert({
                    title: 'Thông báo',
                    message: '📬 Báo cáo đã được nộp thành công!',
                    buttons: [
                        {
                            label: 'OK', onClick: () => {
                            }
                        }
                    ]
                });
            }
            setLoadingGlobal(false);
            setNextStep(true);
            setFileName("");
            inputRef.current.value = "";
        } catch (err) {
            setLoadingGlobal(false);
            console.log(err);
            confirmAlert({
                title: 'Lỗi',
                message: '❌ Lỗi khi nộp báo cáo2: ' + err,
                buttons: [
                    {
                        label: 'OK', onClick: () => {
                        }
                    }
                ]
            });
        }
    }
    return (
        <TableHearder title="Nộp báo cáo nông nghiệp">
            {loadingGlobal && (
                <Box
                    sx={{
                        position: "fixed",
                        top: 0,
                        left: 0,
                        width: "100vw",
                        height: "100vh",
                        backgroundColor: "rgba(0,0,0,0)",
                        zIndex: 2000,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#fff"
                    }}
                >
                    <img
                        src="https://i.gifer.com/ZKZg.gif"
                        alt="loading"
                        width="100"
                        style={{ marginBottom: 10 }}
                    />
                    <Typography variant="h6" sx={{ color: "#fff" }}>
                        Đang xử lý, vui lòng chờ...
                    </Typography>
                </Box>
            )}
            <div className="bg-white">
                <Box maxWidth="sx" mx="auto" p={3}>
                    <StepWizard selectedReports={(selectedReports)=>{
                        console.log(selectedReports);
                        if (selectedReports[0]?.id_loaibaocao === 1) {
                            fetchAndSetTime();
                            setQuarter(null);
                            setMonth(null);
                            // setYear(year);
                            setWeek(week);
                            setSelectedFileType(selectedReports[0].id_loaibaocao);
                            setIsLate(selectedReports[0].islate);
                        } else if (selectedReports[0]?.id_loaibaocao === 2) {
                            fetchAndSetTime();
                            setQuarter(null);
                            setWeek(null);
                            setMonth(month);
                            // setYear(year);
                            setSelectedFileType(selectedReports[0].id_loaibaocao);
                            setIsLate(selectedReports[0].islate);
                        } else if (selectedReports[0]?.id_loaibaocao === 3) {
                            setQuarter(selectedReports[0].quarter);
                            setMonth(null);
                            // setYear(year);
                            setSelectedFileType(selectedReports[0].id_loaibaocao);
                            setIsLate(selectedReports[0].islate);
                        } else if (selectedReports[0]?.id_loaibaocao === 4) {
                            setNumberYear(selectedReports[0].quarter);
                            setMonth(null);
                            // setYear(year);
                            setSelectedFileType(selectedReports[0].id_loaibaocao);
                            setIsLate(selectedReports[0].islate);
                        } else {
                            setSelectedFileType();
                        }
                    }}
                    year={year} month={month} week={week} numberYear={numberYear} quarter={quarter}
                    selectedFileType={selectedFileType}
                    // selectIdChose={selectIdChose}
                    handleFileChange={handleFileChange}
                    handleClick={handleClick}
                    fileName={fileName}
                    inputRef={inputRef}
                    checkClickSend={checkClickSend}
                    nextStep={nextStep}
                    setNextStep={setNextStep}
                    reportCheck={reportCheck}
                    ></StepWizard>
                </Box>
                <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="lg" fullWidth
                        TransitionComponent={Fade} TransitionProps={{
                    onEntered: () => {
                        // console.log(mergesRef);
                        const container = document.getElementById("handsontable-preview");
                        if (container && previewData.length > 0) {
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
                                maxCols: (selectedType===1||selectedType===2)?7:(selectedType===3&&quarter!==1?8:6),
                                height: 300,
                                licenseKey: 'non-commercial-and-evaluation',
                                mergeCells: mergesRef.current,
                                cells: function (row, col) {
                                    const cellProperties = {};
                                    cellProperties.className = 'htCenter htMiddle'; // center text
                                    return cellProperties;
                                },
                            });
                            // Gán lại instance để destroy lần sau
                            container.handsontableInstance = hot;
                        }
                    }
                }}>
                    <DialogTitle>Xác nhận nộp báo cáo</DialogTitle>
                    <DialogContent>
                        <Grid container spacing={2}>
                            <Grid item xs={12} md={6}>
                                {selectedFileType===2&&(month===3|| month===6|| month===9)?
                                    <Typography><strong>Loại báo cáo:</strong> {month===3?"Quý 1":(month===6?"6 Tháng":(month===9?"9 Tháng":""))} </Typography>:
                                    <Typography><strong>Loại báo cáo:</strong> {fileTypes.find(ft => ft.id == selectedFileType)?.name}</Typography>
                                }
                                {
                                    selectedFileType===1?(
                                    <>
                                        <Typography><strong>Tuần:</strong> {week}</Typography>
                                    </>)
                                    :(selectedFileType===2&&(month!==3|| month!==6|| month!==9))?(
                                    <>
                                        <Typography><strong>Tháng:</strong> {month}</Typography>
                                    </>)
                                    :selectedFileType===4? <Typography><strong>Lần:</strong> {numberYear}</Typography>:<></>

                                }

                                <Typography><strong>Năm:</strong> {year}</Typography>
                                <Typography><strong>File:</strong> {fileName}</Typography>
                            </Grid>
                            <Grid item xs={12} md={6} class="w-full">
                                <Typography><strong>Nội dung báo cáo (10 dòng đầu):</strong></Typography>
                                <Box id="handsontable-preview" class="w-full overflowX "/>
                            </Grid>
                        </Grid>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setOpenDialog(false)}>Huỷ</Button>
                        <Button onClick={() => {
                            handleSubmitReport();
                            setOpenDialog(false);
                        }} variant="contained" color="primary">Xác nhận nộp</Button>
                    </DialogActions>
                </Dialog>
            </div>
        </TableHearder>
    );
}