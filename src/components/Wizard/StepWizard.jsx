// WizardWithStepper.jsx
import React, { useState,useEffect } from "react";
import {
    Box,
    Stepper,
    Step,
    StepLabel,
    Button,
    Typography,
    Table,
    TableHead,
    TableRow,
    TableCell,
    TableBody,
    Paper,
} from "@mui/material";
import StepOne from "./StepOne";
import StepThree from "./StepThree";
import StepTwo from "./StepTwo";


const steps = ["Chọn Báo cáo", "Tải xuống Bảng số liệu", "Xác nhận số liệu", ];


export default function WizardWithStepper({  selectedReports
                                              , selectIdChose,
                                              handleFileChange,
                                              handleClick,
                                              fileName,
                                              inputRef,
                                              checkClickSend,
                                              nextStep,
                                              setNextStep,
                                              reportCheck,
                                              handleSubmitReportPDF,
                                              year, month, week,quarter,numberYear, selectedFileType

                                          }) {
    const [activeStep, setActiveStep] = useState(0);
    const [isNextDisabled, setIsNextDisabled] = useState(true);
    const [hasDownloaded, setHasDownloaded] = useState(false);
    const [isBackDisabled, setIsBackDisabled] = useState(false);
    const handleNext = () => {
        if (activeStep === 2) {
            // gọi hàm nộp báo cáo ở Step 3 (index 2)
            checkClickSend()
        }else if (activeStep === 4) {

            handleSubmitReportPDF();
        }else {
            setActiveStep(prev => prev + 1);
        }
    };
    const handleReset = () => {
        setActiveStep(0);          // Quay về bước đầu
        setHasDownloaded(false);   // Chưa tải file
        setIsNextDisabled(true);   // Khoá nút Next lại
        setNextStep(false);        // Reset trạng thái chuyển bước (nếu có)
        setIsBackDisabled(true);   // Khoá nút Quay lại
    };
    useEffect(()=>{
        if(activeStep===0){
            setIsBackDisabled(true)
        }else if(activeStep!==0){
            setIsBackDisabled(false)
        }
    },[activeStep]);

    useEffect(()=>{
        if (activeStep === 2) {
            setActiveStep(prev => prev + 1);
            setNextStep(false);
        }
        if (activeStep === 4) {
            setActiveStep(prev => prev + 1);
            setNextStep(false);
        }
        if(reportCheck!==undefined&&reportCheck?.data.length>0){
            if(reportCheck.data[0]?.acceptfilename==null)
            {
                setActiveStep(3);
                setIsBackDisabled(true);
                setIsNextDisabled(false);
            }else if(reportCheck.data[0]?.acceptfilename!=null){
                setActiveStep(5)
                setNextStep(false);
            }
        }
    },[nextStep, reportCheck])
    const handleBack = () => setActiveStep(prev => prev - 1);
    // const handleReset = () => setActiveStep(0);
    const handleReportsChange = (reports) => {
        // console.log("📥 Wizard nhận dữ liệu từ StepOne:", reports);
        setIsNextDisabled(reports.length === 0);
        // 🔥 Gửi ngược lên Page chính
        if (typeof selectedReports === "function") {
            selectedReports(reports);
        }
    };
    const renderStepContent = (step) => {
        switch (step) {
            case 0:
                return <StepOne  year={year} month={month} week={week} quarter={quarter} selectedReports={handleReportsChange}  />;
            case 1:
                return <StepTwo formData={selectIdChose} year={year} month={month} week={week} quarter={quarter} numberYear={numberYear} selectedFileType={selectedFileType}   onDownloadComplete={setHasDownloaded}/>;
            case 2:
                return <StepThree  handleFileChange={handleFileChange}   handleClick={handleClick}  fileName={fileName}  inputRef={inputRef} year={year} month={month} week={week} quarter={quarter} numberYear={numberYear} selectedFileType={selectedFileType}/>;
            default:
                return "Đã có lỗi xảy ra";
        }
    }


    // const isNextDisabled =
    //     (activeStep === 0 && (!selectedReports || selectedReports.length === 0));

    return (
        <Box sx={{ width: "80%", margin: "40px auto" }}>
            <Stepper activeStep={activeStep} alternativeLabel>
                {steps.map(label => (
                    <Step key={label}>
                        <StepLabel  sx={{
                            "& .MuiStepLabel-label.Mui-active": { color: "#22c55e" }, // màu hồng
                            "& .MuiStepIcon-root.Mui-active": { color: "#22c55e" },   // icon màu hồng
                            "& .MuiStepIcon-root.Mui-completed": { color: "#1976d2" } // màu hoàn thành
                        }} >{label}</StepLabel>
                    </Step>
                ))}
            </Stepper>

            {activeStep === steps.length ? (
                <Box sx={{ textAlign: "center", mt: 5 }}>
                    <Typography variant="h5" gutterBottom>
                        🎉Bạn đã hoàn tất nộp báo cáo
                    </Typography>
                    <Button onClick={handleReset} variant="outlined">
                        Tạo một báo cáo mới
                    </Button>
                </Box>
            ) : (
                <Box sx={{ mt: 4 }}>
                    {renderStepContent(activeStep)}
                    <Box sx={{ display: "flex", justifyContent: "space-between", mt: 4 }}>
                        <Button
                            disabled={isBackDisabled}
                            onClick={handleBack}
                            variant="outlined"
                            // style={{ color: "#22c55e", border : "1px solid #22c55e" }}
                        >
                            Quay lại
                        </Button>
                        <Button
                            variant="contained"
                            disabled={isNextDisabled||hasDownloaded}
                            onClick={handleNext}
                            // style={{ color: "#fff", backgroundColor: "#22c55e" }}
                            color={activeStep === steps.length - 1 ? "success" : "primary"}
                        >
                            {activeStep === steps.length - 1 ? "Nộp báo cáo" : "Tiếp tục"}
                        </Button>
                    </Box>
                </Box>
            )}
        </Box>
    );
}
