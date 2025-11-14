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
    const account = [
        {
            fullName: "Nguyễn Văn Tài",
            email: "tai280501.tiengiang@gmail.com",
            role: "Hỗ trợ Bảo trì phần mềm",
            createdAt: "2024-01-15",
            zalo:''
        },
        {
            fullName: "Nguyễn Văn Tài",
            email: "nguyenvana@example.com",
            role: "Hỗ trợ Nghiệp vụ báo cáo",
            createdAt: "2024-01-15",
            zalo:''
        },
    ];

    return (
        <TableHearder title="Thông tin liên hệ">
            <Box mx="auto" className="w-full relative">
                <Card elevation={3} sx={{   mx: "auto", bgcolor: "#fff" }}>
                    <CardContent sx={{ mx: "auto", maxWidth:600}}>
                        <Typography variant="h6" gutterBottom>
                            Thông tin tài khoản
                        </Typography>
                        {account.map((value)=>{
                            return  ( 
                          <Card  
                                sx={{ 
                                    p: 3, 
                                    borderRadius: 3, 
                                    boxShadow: 3,
                                    width: "100%",
                                    bgcolor: "#fafafa",
                                    m:3
                                }}
                            >
                                <CardContent>
                                    <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                                        Thông tin người dùng
                                    </Typography>

                                    <Stack spacing={1.5}>
                                          <Stack direction="row" spacing={2}>
                                            <Typography variant="subtitle2" sx={{ minWidth: 120, color: "text.secondary" }}>
                                                Vai Trò:
                                            </Typography>
                                            <Typography>{value.role}</Typography>
                                        </Stack>
                                        <Stack direction="row" spacing={2}>
                                            <Typography variant="subtitle2" sx={{ minWidth: 120, color: "text.secondary" }}>
                                                Họ và tên:
                                            </Typography>
                                            <Typography>{value.fullName}</Typography>
                                        </Stack>

                                        <Stack direction="row" spacing={2}>
                                            <Typography variant="subtitle2" sx={{ minWidth: 120, color: "text.secondary" }}>
                                                Email:
                                            </Typography>
                                            <Typography>{value.email}</Typography>
                                        </Stack>
                                        <Stack direction="row" spacing={2}>
                                            <Typography variant="subtitle2" sx={{ minWidth: 120, color: "text.secondary" }}>
                                                Zalo:
                                            </Typography>
                                            <Typography>{value.zalo}</Typography>
                                        </Stack>
                                    </Stack>
                                </CardContent>
                            </Card>);
                            })
                        }
                       
                    </CardContent>
                </Card>
            </Box>
        </TableHearder>
    );
};

export default AccountInfo;
