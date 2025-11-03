// StepThree.jsx
import React, { useState } from "react";
import {
    Box,
    Stepper,
    Step,
    StepLabel,
    Button,
    Grid,
    Typography,
    Table,
    TableHead,
    TableRow,
    TableCell,
    TableBody,
    Paper,
} from "@mui/material";

import UploadFileIcon from "@mui/icons-material/UploadFile";


function StepThree({handleFileChange, handleClick, fileName, inputRef  }) {

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
                    Chọn file số liệu và tải lên
                </Typography>

                <input
                    type="file"
                    ref={inputRef}
                    style={{ display: "none" }}
                    onChange={handleFileChange}
                />

                <Button
                    size="small" // 👉 nút nhỏ lại
                    variant="contained"
                    startIcon={<UploadFileIcon />}
                    onClick={handleClick}
                    // sx={{ width: px }} // 👉 chỉnh kích thước nút
                >
                    Tải lên file số liệu
                </Button>

                {fileName && (
                    <Typography variant="caption" color="success.main" align="center">
                        Đã chọn: {fileName}
                    </Typography>
                )}
            </Box>
        </Grid>
        // <Grid item xs={6}>
        //     <input type="file" ref={inputRef} style={{display: 'none'}} onChange={handleFileChange}/>
        //     <Button fullWidth variant="contained" startIcon={<UploadFileIcon/>} onClick={handleClick}>Tải
        //         lên</Button>
        //     {fileName &&
        //         <Typography variant="caption" color="success.main">Đã chọn: {fileName}</Typography>}
        // </Grid>
    );
}

export default StepThree;
