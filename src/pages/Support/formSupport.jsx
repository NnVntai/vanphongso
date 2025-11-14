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
export default function UpdateUserInfo() {
    const [form, setForm] = useState({
        title: "",
        content: "",
        id_user:""
    });
    const [loading, setLoading] = useState(false);
    const handleChange = (field, value) => {
        setForm((prev) => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async () => {
        if ( !form.title || !form.content) {
            confirmAlert({
                title: "Thiếu thông tin",
                message: "Vui lòng nhập đầy đủ Tiêu đề, Nội dung.",
                buttons: [{ label: "OK", onClick: () => {} }],
            });
            return;
        }
        confirmAlert({
            title: "Xác nhận",
            message: "Bạn có chắc muốn gửi thông tin không?",
            buttons: [
                {
                    label: "Có",
                    onClick: async () => {
                        try {
                            form.id_user=JSON.parse(localStorage.getItem("username")).id;
                            setLoading(true);
                            // console.log(form);
                            await api.post(`/supports`, form);
                            confirmAlert({
                                title: "Thành công",
                                message: "Đã gửi thành công",
                                buttons: [{ label: "OK", onClick: () => {} }],
                            });
                        } catch (err) {
                            console.log(err);
                            confirmAlert({
                                title: "Lỗi",
                                message: "Gửi thất bại: " + err.message,
                                buttons: [{ label: "OK", onClick: () => {} }],
                            });
                        } finally {
                            setLoading(false);
                        }
                    },
                },
                {
                    label: "Không",
                    onClick: () => {},
                },
            ],
        });
    };

    return (
        <TableHearder title="Đóng góp ý kiến & Báo lỗi" backlink="/telephone">

            <Box  mx="auto"  class="w-full relative">
                <Card elevation={3} maxWidth={600} mx="auto" class="bg-white ">
                    <CardContent>

                        <Stack spacing={1}>
                            <Stack direction="row" spacing={2}>
                                <TextField
                                    fullWidth
                                    required
                                    label="Tiêu đề gửi"

                                    onChange={(e) => handleChange("title", e.target.value)}
                                />
                            </Stack>
                            <Stack direction="row" spacing={2}>
                                <TextField
                                    label="Nội dung gửi"
                                    fullWidth
                                    required
                                    multiline
                                    minRows={3}
                                    maxRows={10}
                                    onChange={(e) => handleChange("content", e.target.value)}
                                />
                            </Stack>
                            <Stack direction="row" spacing={2} justifyContent="flex-end">
                                <Button
                                    variant="contained"
                                    color="primary"
                                    startIcon={<Save size={18} />}
                                    onClick={handleSubmit}
                                    disabled={loading}
                                >
                                    {loading ? "Đang cập nhật..." : "Gửi ý kiến"}
                                </Button>
                            </Stack>
                        </Stack>
                    </CardContent>
                </Card>
            </Box>
        </TableHearder>
    );
}
