import React, { useEffect, useState } from "react";
import {
    Box,
    Button,
    CircularProgress,
    FormControl,
    InputLabel,
    MenuItem,
    Select,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Paper,
} from "@mui/material";
import { Save, Add, ArrowUpward, ArrowDownward, Delete } from "@mui/icons-material";
import api from "@/config";

export default function ChitieuList() {
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(true);
    const [year, setYear] = useState(new Date().getFullYear());
    const [years, setYears] = useState([]);
    const [error, setError] = useState(null);

    // Danh sách năm
    useEffect(() => {
        const current = new Date().getFullYear();
        const list = [];
        for (let y = 2020; y <= current + 2; y++) {
            list.push(y);
        }
        setYears(list.reverse());
    }, []);

    // Load dữ liệu kế hoạch theo năm
    useEffect(() => {
        const fetchRows = async () => {
            try {
                setLoading(true);
                const { data } = await api.get(`/kehoach2/${year}`);
                const list = Array.isArray(data.data) ? data.data : data.data.rows || [];
                list.sort((a, b) => (a.stt ?? 0) - (b.stt ?? 0));
                setRows(list);
            } catch (err) {
                setError(err);
            } finally {
                setLoading(false);
            }
        };
        fetchRows();
    }, [year]);

    const renumber = (arr) => arr.map((r, i) => ({ ...r, stt: i + 1 }));

    const moveRow = (index, direction) => {
        const target = index + direction;
        if (target < 0 || target >= rows.length) return;
        const clone = [...rows];
        [clone[index], clone[target]] = [clone[target], clone[index]];
        setRows(renumber(clone));
    };

    const handleChange = (index, field, value) => {
        const clone = [...rows];
        clone[index] = { ...clone[index], [field]: value };
        setRows(clone);
    };
    const handleSaveAll = async () => {
        if (!rows.length) return;
        try {
            setLoading(true);

            const payload = rows.map((row) => ({
                id: row.id ?? null,
                id_chitieu: row.id_chitieu,
                year,
                kehoach: parseFloat(row.kehoach) || 0,
            }));

            const { data } = await api.post("/kehoach/bulk-upsert", { rows: payload });
            const list = Array.isArray(data.data) ? data.data : data.data.rows || [];
            list.sort((a, b) => (a.stt ?? 0) - (b.stt ?? 0));
            setRows(list);
            alert("Đã lưu danh sách thành công!");
        } catch (err) {
            console.error(err);
            alert("Lỗi khi lưu: " + (err.response?.data?.message || err.message));
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = (index) => {
        const clone = [...rows];
        clone.splice(index, 1);
        setRows(renumber(clone));
    };

    if (loading) return <Box p={3}><CircularProgress /></Box>;
    if (error) return <Box p={3} color="error.main">Lỗi: {error.message}</Box>;

    return (
        <Box p={3}>
            <Box mb={2} display="flex" gap={2} alignItems="center">
                <Button onClick={handleSaveAll} color="success" variant="contained" startIcon={<Save />}>
                    Lưu tất cả
                </Button>
                <FormControl size="small">
                    <InputLabel id="year-select-label">Chọn năm</InputLabel>
                    <Select
                        labelId="year-select-label"
                        value={year}
                        onChange={(e) => setYear(Number(e.target.value))}
                        label="Chọn năm"
                    >
                        {years.map((y) => (
                            <MenuItem key={y} value={y}>{y}</MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </Box>

            <TableContainer component={Paper}>
                <Table size="small">
                    <TableHead>
                        <TableRow>
                            <TableCell align="center">STT</TableCell>
                            <TableCell align="center">Mã chỉ tiêu</TableCell>
                            <TableCell align="center">Tên chỉ tiêu</TableCell>
                            <TableCell align="center">Đơn vị</TableCell>
                            <TableCell align="center">Kế hoạch</TableCell>
                            <TableCell align="center" colSpan={3}>Hành động</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {rows.map((row, idx) => (
                            <TableRow key={row.id ?? `row-${idx}`}>
                                <TableCell align="center">{idx + 1}</TableCell>
                                <TableCell align="center">
                                    <TextField fullWidth size="small" value={row.ma_chitieu} disabled />
                                </TableCell>
                                <TableCell align="center">
                                    <TextField fullWidth size="small" value={row.ten_chitieu} disabled />
                                </TableCell>
                                <TableCell align="center">
                                    <TextField fullWidth size="small" value={row.dvt} disabled />
                                </TableCell>
                                <TableCell align="center">
                                    <TextField
                                        fullWidth
                                        size="small"
                                        type="number"
                                        value={row.kehoach!=null?row.kehoach ?? "":""}
                                        onChange={(e) => handleChange(idx, "kehoach", e.target.value)}
                                    />
                                </TableCell>
                                <TableCell align="center">
                                    <Button onClick={() => moveRow(idx, -1)} disabled={idx === 0}>
                                        <ArrowUpward fontSize="small" />
                                    </Button>
                                </TableCell>
                                <TableCell align="center">
                                    <Button onClick={() => moveRow(idx, 1)} disabled={idx === rows.length - 1}>
                                        <ArrowDownward fontSize="small" />
                                    </Button>
                                </TableCell>
                                <TableCell align="center">
                                    <Button onClick={() => handleDelete(idx)} color="error">
                                        <Delete fontSize="small" />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
}
