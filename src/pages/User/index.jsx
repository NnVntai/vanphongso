// File: src/pages/UserHistory.jsx
import React, { useState, useEffect } from "react";
import {
    Box, Typography, Grid, Button, Table, TableHead, TableBody, TableCell, TableRow,
    Dialog, DialogTitle, DialogContent, DialogActions, IconButton, TextField, CircularProgress, MenuItem, Select, InputLabel, FormControl, Pagination
} from "@mui/material";
import { Edit, Delete, RefreshCw, Save, Plus, X, Download } from "lucide-react";
import api from "@/config";
import TableHearder from "../../components/Table/TableHearder";
import ExportExcelButton from "@/components/UserComponemt/ExcelUser";

const defaultUser = {
    id: null,
    full_name: "",
    email: "",
    phone: "",
    username: "",
    is_active: true,
};

function EditUserModal({ open, onClose, user, onSave }) {
    const [form, setForm] = useState(defaultUser);
    const [selectedXa, setSelectedXa] = useState(defaultUser);
    const [loading, setLoading] = useState(false);
    const [xaList, setXaList] = useState([]);
    const fetchXaList = async () => {
        try {
            const { data } = await api.get("/xas");
            setXaList(data);
        } catch (err) {
            console.error("Lỗi khi tải danh sách xã:", err);
        }
    };
    useEffect(() => {
        if (user) setForm(user);
    }, [user]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));
    };

    const handleSubmit = async () => {
        setLoading(true);
        try {
            await api.post("/users/upsert", form);
            onSave();
            onClose();
        } catch (err) {
            alert("Lỗi lưu người dùng: " + err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>
                {form?.id ? "Chỉnh sửa người dùng" : "Thêm người dùng"}
                <IconButton onClick={onClose} sx={{ position: 'absolute', right: 8, top: 8 }}>
                    <X size={20} />
                </IconButton>
            </DialogTitle>
            <DialogContent dividers>
                <Grid container spacing={2}>
                    <Grid item xs={12}><TextField fullWidth label="Họ tên" name="full_name" value={form.full_name} onChange={handleChange} /></Grid>
                    <Grid item xs={12}><TextField fullWidth label="Email" name="email" value={form.email} onChange={handleChange} /></Grid>
                    <Grid item xs={12}><TextField fullWidth label="Số điện thoại" name="phone" value={form.phone} onChange={handleChange} /></Grid>
                    <Grid item xs={12}><TextField fullWidth label="Username" name="username" value={form.username} onChange={handleChange} /></Grid>
                    <Grid item xs={12}>
                        <Select value={selectedXa} label="Xã" >
                            <MenuItem value="">Tất cả</MenuItem>
                            {xaList.map((xa) => (
                                <MenuItem key={xa.id} value={xa.id}>{xa.ten_xa}</MenuItem>
                            ))}
                        </Select>
                    </Grid>
                </Grid>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Hủy</Button>
                <Button onClick={handleSubmit} variant="contained" disabled={loading} startIcon={loading ? <CircularProgress size={20} /> : <Save />}>
                    {loading ? "Đang lưu..." : "Lưu"}
                </Button>
            </DialogActions>
        </Dialog>
    );
}


export default function UserHistory() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [xaList, setXaList] = useState([]);
    const [selectedXa, setSelectedXa] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [searchKeyword, setSearchKeyword] = useState("");
    const itemsPerPage = 10;

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const params = {};
            if (selectedXa) params.id_xa = selectedXa;
            if (searchKeyword) params.keyword = searchKeyword;

            const { data } = await api.get("/users/search", { params });
            console.log(data);
            setUsers(data.data); // <- lấy từ data.data vì Laravel trả về { data: [...] }
        } catch (err) {
            alert("Không thể tải danh sách: " + err.message);
        } finally {
            setLoading(false);
        }
    };

    const fetchXaList = async () => {
        try {
            const { data } = await api.get("/xas");
            setXaList(data);
        } catch (err) {
            console.error("Lỗi khi tải danh sách xã:", err);
        }
    };

    const handleDelete = async (user) => {
        if (!window.confirm("Bạn có chắc muốn xóa người dùng này?")) return;
        try {
            await api.delete(`/users/${user.id}`);
            setUsers((prev) => prev.filter((u) => u.id !== user.id));
        } catch (err) {
            alert("Lỗi khi xóa người dùng: " + err.message);
        }
    };

    const handleResetPassword = async (user) => {
        if (!window.confirm("Reset mật khẩu người dùng này về mặc định (123456)?")) return;
        try {
            await api.post(`/users/${user.id}/reset-password`);
            alert("✅ Đặt lại mật khẩu thành công!");
        } catch (err) {
            alert("❌ Lỗi khi reset mật khẩu: " + err.message);
        }
    };

    const handleEdit = (user) => {
        setSelectedUser(user);
        setModalOpen(true);
    };
    useEffect(() => {
        fetchXaList();
    }, []);
    useEffect(() => {
        const delayDebounce = setTimeout(() => {
            fetchUsers(); // Chỉ gọi sau 2 giây không gõ
        }, 2000); // 2 giây

        return () => clearTimeout(delayDebounce); // Clear timeout nếu người dùng vẫn đang gõ
    }, [searchKeyword, selectedXa]);
    const paginatedUsers = users.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    return (
        <TableHearder title="Danh sách người dùng">
            <Box className="p-6 bg-gray-50 min-h-screen">
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                    {/*<Typography variant="h5">Người dùng</Typography>*/}
                    <Box display="flex" gap={1}>
                        <FormControl size="small" sx={{ minWidth: 200 }}>
                            {/*<InputLabel>Tên/SDT/Email</InputLabel>*/}
                            <TextField
                                label="Tìm kiếm (tên, email, điện thoại...)"
                                value={searchKeyword}
                                onChange={(e) => setSearchKeyword(e.target.value)}
                                size="small"
                            />
                        </FormControl>

                        <FormControl size="small" sx={{ minWidth: 200 }}>
                            <InputLabel>Xã</InputLabel>
                            <Select value={selectedXa} label="Xã" onChange={(e) => setSelectedXa(e.target.value)}>
                                <MenuItem value="">Tất cả</MenuItem>
                                {xaList.map((xa) => (
                                    <MenuItem key={xa.id} value={xa.id}>{xa.ten_xa}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        <ExportExcelButton data={users} fileName="danh-sach-nguoi-dung" />
                        <Button variant="outlined" startIcon={<RefreshCw />} onClick={fetchUsers}>Làm mới</Button>
                        {/*<Button variant="contained" startIcon={<Plus />} onClick={() => handleEdit(null)}>Thêm người dùng</Button>*/}
                    </Box>
                </Box>

                <Table>
                    <TableHead className="bg-gray-100">
                        <TableRow>
                            <TableCell>Họ tên</TableCell>
                            <TableCell>Email</TableCell>
                            <TableCell>Điện thoại</TableCell>
                            <TableCell>Username</TableCell>
                            <TableCell align="center">Hành động</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {loading ? (
                            <TableRow><TableCell colSpan={5} align="center"><CircularProgress /></TableCell></TableRow>
                        ) : paginatedUsers.length === 0 ? (
                            <TableRow><TableCell colSpan={5} align="center">Không có người dùng.</TableCell></TableRow>
                        ) : paginatedUsers.map((user) => (
                            <TableRow key={user.id}>
                                <TableCell>{user.name}</TableCell>
                                <TableCell>{user.email}</TableCell>
                                <TableCell>{user.phone}</TableCell>
                                <TableCell>{user.username}</TableCell>
                                <TableCell align="center">
                                    <Button size="small" color="error" onClick={() => handleDelete(user)}>Xóa</Button>{' '}
                                    <Button size="small" color="warning" onClick={() => handleResetPassword(user)}>Reset mật khẩu</Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>

                <Box display="flex" justifyContent="center" mt={3}>
                    <Pagination
                        count={Math.ceil(users.length / itemsPerPage)}
                        page={currentPage}
                        onChange={(e, value) => setCurrentPage(value)}
                        color="primary"
                    />
                </Box>

                <EditUserModal
                    open={modalOpen}
                    onClose={() => setModalOpen(false)}
                    user={selectedUser || defaultUser}
                    onSave={fetchUsers}
                />
            </Box>
        </TableHearder>
    );
}
