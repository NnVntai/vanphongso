
import React, { useState } from "react";
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
    Grid,
    TableCell,
    TableBody,
    Paper,
} from "@mui/material";
import ExcelDownloader from "@/components/REportModal/DownLoadTeamPlate.jsx";
// StepTwo.jsx
function StepTwo({year, quarter, month, week,numberYear, selectedFileType,   onDownloadComplete,}) {
    // const handleDownload = () => {
    //     // Khi người dùng tải xuống thành công
    //     if (onDownloadComplete) onDownloadComplete(false);
    //
    // };
    return (
        <Grid item xs={6}>
            <Box
                display="flex"
                flexDirection="column"
                alignItems="center"
                justifyContent="center"
                gap={1} // khoảng cách giữa label và nút
            >
                <Typography variant="subtitle2" align="center">
                    Tải file Excel và điền số liệu theo hướng dẫn
                </Typography>

                <ExcelDownloader
                    year={year}
                    idLoai={selectedFileType}
                    ten_xa={JSON.parse(localStorage.getItem("username"))?.xa?.ten_xa}
                    id_xa={JSON.parse(localStorage.getItem("username"))?.xa?.id}
                    username={JSON.parse(localStorage.getItem("username"))}
                    month={month}
                    week={week}
                    number={numberYear}
                    quarter={quarter}
                    // onDownloadSuccess={handleDownload}
                    apiEndpoint="/chitieu/sumtichly"
                    // onclick={handleDownload}
                />
            </Box>
        </Grid>

    );
}


export default StepTwo;
