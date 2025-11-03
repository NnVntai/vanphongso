import React, { useEffect, useState } from "react";
import {
    TextField,
    Grid,
    Card,
    CardContent,
    Typography,
    Button,
    Box,
    Stack
} from "@mui/material";
import { Save } from "lucide-react";
import { confirmAlert } from "react-confirm-alert";
import "react-confirm-alert/src/react-confirm-alert.css";
import api from "@/config"; // axios base config
import TableHearder from "@/components/Table/TableHearder";
const AccountInfo = () => {
    const account = {
        fullName: "Nguyễn Văn A",
        email: "nguyenvana@example.com",
        role: "Quản trị viên",
        createdAt: "2024-01-15",
    };

    return (
        <TableHearder title="Thông tin liên hệ">
            <Box mx="auto" className="w-full relative">
                <Card elevation={3} sx={{   mx: "auto", bgcolor: "#fff" }}>
                    <CardContent sx={{ mx: "auto", maxWidth:600}}>
                        <Typography variant="h6" gutterBottom>
                            Thông tin tài khoản
                        </Typography>
                        <Stack spacing={1}>
                            <Stack direction="row" spacing={2}>
                                <Typography variant="subtitle2" sx={{ minWidth: 100 }}>Họ và tên:</Typography>
                                <Typography>{account.fullName}</Typography>
                            </Stack>

                            <Stack direction="row" spacing={2}>
                                <Typography variant="subtitle2" sx={{ minWidth: 100 }}>Email:</Typography>
                                <Typography>{account.email}</Typography>
                            </Stack>
                        </Stack>
                        <Stack spacing={1}>
                            <Stack direction="row" spacing={2}>
                                <Typography variant="subtitle2" sx={{ minWidth: 100 }}>Họ và tên:</Typography>
                                <Typography>{account.fullName}</Typography>
                            </Stack>

                            <Stack direction="row" spacing={2}>
                                <Typography variant="subtitle2" sx={{ minWidth: 100 }}>Email:</Typography>
                                <Typography>{account.email}</Typography>
                            </Stack>
                        </Stack>
                        <Stack spacing={1}>
                            <Stack direction="row" spacing={2}>
                                <Typography variant="subtitle2" sx={{ minWidth: 100 }}>Họ và tên:</Typography>
                                <Typography>{account.fullName}</Typography>
                            </Stack>

                            <Stack direction="row" spacing={2}>
                                <Typography variant="subtitle2" sx={{ minWidth: 100 }}>Email:</Typography>
                                <Typography>{account.email}</Typography>
                            </Stack>
                        </Stack>
                    </CardContent>
                </Card>
            </Box>
        </TableHearder>
    );
};

export default AccountInfo;
