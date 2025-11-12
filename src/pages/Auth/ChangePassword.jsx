import React, { useState } from "react";
import {
    TextField,
    Grid,
    Card,
    CardContent,
    Button,
    Box,
} from "@mui/material";
import { Save } from "lucide-react";
import { confirmAlert } from "react-confirm-alert";
import "react-confirm-alert/src/react-confirm-alert.css";
import api from "@/config"; // axios base config
import TableHearder from "@/components/Table/TableHearder";

export default function ChangePasswordForm() {
    const [form, setForm] = useState({
        current_password: "",
        new_password: "",
        new_password_confirmation: "",
    });
    const [loading, setLoading] = useState(false);

    const handleChange = (field, value) => {
        setForm((prev) => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async () => {
        const { current_password, new_password, new_password_confirmation } = form;

        if (!current_password || !new_password || !new_password_confirmation) {
            return confirmAlert({
                title: "Thiếu thông tin",
                message: "Vui lòng nhập đầy đủ các trường mật khẩu.",
                buttons: [{ label: "OK" }],
            });
        }

        if (new_password !== new_password_confirmation) {
            return confirmAlert({
                title: "Lỗi",
                message: "Xác nhận mật khẩu không khớp.",
                buttons: [{ label: "OK" }],
            });
        }

        confirmAlert({
            title: "Xác nhận",
            message: "Bạn có chắc muốn thay đổi mật khẩu?",
            buttons: [
                {
                    label: "Có",
                    onClick: async () => {
                        try {
                            setLoading(true);
                            await api.put("/users/change-password", form);
                            confirmAlert({
                                title: "Thành công",
                                message: "Mật khẩu đã được thay đổi!",
                                buttons: [{ label: "OK" }],
                            });
                            setForm({ current_password: "", new_password: "", new_password_confirmation: "" });
                        } catch (err) {
                            const msg = err.response?.data?.message || "Lỗi không xác định.";
                            confirmAlert({
                                title: "Lỗi",
                                message: msg,
                                buttons: [{ label: "OK" }],
                            });
                        } finally {
                            setLoading(false);
                        }
                    },
                },
                { label: "Không" },
            ],
        });
    };

    return (
        <TableHearder title="Thay đổi mật khẩu" backlink="/setting">
            <Box mx="auto" className="w-full relative">
                <Card sx={{ mx: "auto", backgroundColor: "#fff" }}>
                    <CardContent>
                        <Grid container spacing={2}>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    required
                                    type="password"
                                    label="Mật khẩu hiện tại"
                                    value={form.current_password}
                                    onChange={(e) => handleChange("current_password", e.target.value)}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    required
                                    type="password"
                                    label="Mật khẩu mới"
                                    value={form.new_password}
                                    onChange={(e) => handleChange("new_password", e.target.value)}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    required
                                    type="password"
                                    label="Xác nhận mật khẩu mới"
                                    value={form.new_password_confirmation}
                                    onChange={(e) => handleChange("new_password_confirmation", e.target.value)}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <Button
                                    variant="contained"
                                    color="primary"
                                    startIcon={<Save size={18} />}
                                    onClick={handleSubmit}
                                    disabled={loading}
                                >
                                    {loading ? "Đang cập nhật..." : "Đổi mật khẩu"}
                                </Button>
                            </Grid>
                        </Grid>
                    </CardContent>
                </Card>
            </Box>
        </TableHearder>
    );
}
