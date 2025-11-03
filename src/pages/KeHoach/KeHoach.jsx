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
    TablePagination
} from "@mui/material";

import { Save, ArrowUpward, ArrowDownward, Delete } from "@mui/icons-material";
import api from "@/config";
import TableHearder from "../../components/Table/TableHearder";

export default function ChitieuList() {
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(true);
    const [year, setYear] = useState(new Date().getFullYear());
    const [years, setYears] = useState([]);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(0);
    const rowsPerPage = 10;

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
                let list = Array.isArray(data.data) ? data.data : data.data.rows || [];
                list.sort((a, b) => (a.stt ?? 0) - (b.stt ?? 0));

                const emptyRow = () => ({
                    id: null,
                    id_chitieu: null,
                    ma_chitieu: "",
                    ten_chitieu: "",
                    dvt: "",
                    kehoach: "",
                    stt: null,
                });

                while (list.length < 20) {
                    list.push(emptyRow());
                }

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
            const payload = rows
                .filter((row) => !!row.id && row.kehoach !== "" && row.kehoach>0)
                .map((row) => ({
                    id: row.kehoachs[0]?.id ?? null,
                    id_chitieu: row.id,
                    year,
                    kehoach: parseFloat(row.kehoach) || 0,
                }));
            if (!payload.length) {

                alert("Không có dữ liệu hợp lệ để lưu.");
                return;
            }
            const { data } = await api.post("/kehoach/bulk-upsert", { rows: payload,year });
            // console.log(data)
            const list = Array.isArray(data.data) ? data.data : data.data.rows || [];
            list.sort((a, b) => (a.stt ?? 0) - (b.stt ?? 0));

            // Đảm bảo vẫn có 20 dòng sau khi lưu
            const emptyRow = () => ({
                id: null,
                id_chitieu: null,
                ma_chitieu: "",
                ten_chitieu: "",
                dvt: "",
                kehoach: "",
                stt: null,
            });
            while (list.length < 20) {
                list.push(emptyRow());
            }

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
        while (clone.length < 20) {
            clone.push({
                id: null,
                id_chitieu: null,
                ma_chitieu: "",
                ten_chitieu: "",
                dvt: "",
                kehoach: "",
                stt: null,
            });
        }
        setRows(renumber(clone));
    };

    if (error) return <Box p={3} color="error.main">Lỗi: {error.message}</Box>;

    return (
    <TableHearder title="Nhập số liệu kế hoạch thủ công">
        <div className="p-6 bg-gray-50 min-h-screen">
        <Box p={3}>
            <Box mb={2} display="flex" gap={2} alignItems="center">
                <Button onClick={handleSaveAll} color="success" variant="contained" startIcon={<Save />} disabled={loading}>
                    Lưu tất cả
                </Button>
                <FormControl size="small">
                    <InputLabel id="year-select-label">Chọn năm</InputLabel>
                    <Select
                        labelId="year-select-label"
                        value={year}
                        onChange={(e) => setYear(Number(e.target.value))}
                        label="Chọn năm"
                        disabled={loading}
                    >
                        {years.map((y) => (
                            <MenuItem key={y} value={y}>{y}</MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </Box>

            <TableContainer component={Paper} sx={{ position: "relative" }}>
                {loading && (
                    <Box
                        sx={{
                            position: "absolute",
                            top: 0, left: 0, right: 0, bottom: 0,
                            backgroundColor: "rgba(255,255,255,0.7)",
                            zIndex: 2,
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                        }}
                    >
                        <CircularProgress />
                    </Box>
                )}

                <Table size="small" sx={{ opacity: loading ? 0.4 : 1 }}>
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
                        {rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row, idx) => {
                            const actualIndex = page * rowsPerPage + idx;
                            return (
                                <TableRow key={actualIndex}>
                                    <TableCell align="center">{actualIndex + 1}</TableCell>
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
                                            value={row.kehoach ?? row.kehoachs[0]?.kehoach}
                                            onChange={(e) => handleChange(actualIndex, "kehoach", e.target.value)}
                                        />
                                    </TableCell>
                                    <TableCell align="center">
                                        <Button onClick={() => moveRow(actualIndex, -1)} disabled={actualIndex === 0}>
                                            <ArrowUpward fontSize="small" />
                                        </Button>
                                    </TableCell>
                                    <TableCell align="center">
                                        <Button onClick={() => moveRow(actualIndex, 1)} disabled={actualIndex === rows.length - 1}>
                                            <ArrowDownward fontSize="small" />
                                        </Button>
                                    </TableCell>
                                    <TableCell align="center">
                                        <Button onClick={() => handleDelete(actualIndex)} color="error">
                                            <Delete fontSize="small" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </TableContainer>
            <TablePagination
                component="div"
                count={rows.length}
                page={page}
                onPageChange={(e, newPage) => setPage(newPage)}
                rowsPerPage={rowsPerPage}
                rowsPerPageOptions={[rowsPerPage]}
                labelRowsPerPage=""
            />
        </Box>
        </div>
    </TableHearder>
    );
}
