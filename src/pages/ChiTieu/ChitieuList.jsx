import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Select as MUISelect,
  MenuItem,
  FormControl,
  InputLabel,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Modal,
  IconButton,
    Dialog, DialogTitle, DialogContent, DialogActions,
  Box,
} from "@mui/material";
// import Select from "react-select";
import { ArrowUp, ArrowDown, Save, Plus, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
// import {Select} from "react-select";
import api from "@/config";
import { Link } from "react-router-dom";
import  TableHearder from '../../components/Table/TableHearder';
// import {MenuItem} from "@mui/material";
import { Info } from "lucide-react";

const stubRow = (stt) => ({
  id: null,
  ma_chitieu: "",
  ten_chitieu: "",
  dvt: "",
  is_active: false,
  stt,
  formular: [],
});


export default function ChitieuList() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [loadingGlobal, setLoadingGlobal] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [selectedFileType, setSelectedFileType] = useState(0);
  const [fileTypes, setFileTypes] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);
  const fetchFileTypes = async () => {
    try {
      const { data } = await api.get("/loaibaocao");
      setFileTypes(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Lỗi khi tải loại báo cáo:", err);
    }
  };
  /* ------------------------------ Fetch list ------------------------------ */
  useEffect(() => {
    const fetchRows = async () => {
      try {
        const { data } = await api.get(`/chitieu/${selectedFileType}`);
        // console.log(data);
        //
        const list = Array.isArray(data) ? data : data.rows || [];
        list.sort((a, b) => (a.stt ?? 0) - (b.stt ?? 0));
        setRows(list);

      } catch (err) {
        console.log(err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };
    fetchRows();
    fetchFileTypes();
  }, [selectedFileType]);

  /* --------------------------- Helper functions --------------------------- */
  const renumber = (arr) => arr.map((r, i) => ({ ...r, stt: i + 1 }));

  const moveRow = (index, direction) => {
    const target = index + direction;
    if (target < 0 || target >= rows.length) return;
    const clone = [...rows];
    [clone[index], clone[target]] = [clone[target], clone[index]];
    setRows(renumber(clone));
  };
    const handleOpen = (row,index) => {
        // console.log(row)
        setSelectedRow(row);
        setOpenDialog(true);
        setSelectedIndex(index); 

    };

    const handleClose = () => {
        setOpenDialog(false);
        setSelectedRow(null);
    };
  const handleChange = (index, field, value) => {
    const clone = [...rows];
    clone[index] = { ...clone[index], [field]: value };
    setRows(clone);
      if (selectedIndex === index) {
          setSelectedRow((prev) => ({ ...prev, [field]: value }));
      }
  };

  /* --------------------------- ⬇ SAVE ALL ⬇ --------------------------- */
  const handleSaveAll = async () => {
    if (!rows.length) return;
    try {
      setLoading(true);
      // Gửi 1 lần thay vì vòng lặp put/post
      const { data } = await api.post("/chitieu/bulk", { rows });
      // console.log(data);
      // Server trả về danh sách đã upsert kèm id mới
      const list = Array.isArray(data) ? data : data.rows || [];
      list.sort((a, b) => (a.stt ?? 0) - (b.stt ?? 0));
      setRows(list);
      // console.log( rows);
      alert("Đã lưu toàn bộ danh sách!");
    } catch (err) {
      alert("Đã có lỗi khi lưu dữ liệu: " + err.message);
    } finally {
      setLoading(false);
    }
  };
  /* ----------------------------------------------------------------------- */

  const handleDelete = async (index) => {
    const row = rows[index];
    if (row.id) {
      if (!window.confirm("Xóa chỉ tiêu này?")) return;
      try {
        await api.delete(`/chitieu/${row.id}`);
      } catch (err) {
        alert("Không thể xóa: " + err.message);
        return;
      }
    }
    const clone = [...rows];
    clone.splice(index, 1);
    setRows(renumber(clone));
  };
const handleAddBelow = (index) => {
        setRows((prev) => {
            const newRow = stubRow(prev.length + 1);
            const updated = [...prev];
            updated.splice(index + 1, 0, newRow); // ✅ chèn ngay sau dòng hiện tại
            return updated;
        });
};
  const handleAdd = () => setRows((prev) => [...prev, stubRow(prev.length + 1)]);

  /* ---------------------------- Render UI ---------------------------- */
  if (loading) return <p className="p-4 text-center">Đang tải danh sách...</p>;
  if (error) return <p className="p-4 text-red-600">Lỗi: {error.message}</p>;
  const options = rows.map((r) => ({
    label: r.ma_chitieu+r.ten_chitieu,
    value: r.id , // đảm bảo có key duy nhất
  }));
  return (

      <TableHearder title="Danh sách các chỉ tiêu" backlink="/indexchitieu">
        {/* Body */}    
        {loadingGlobal && (
          <Box
              sx={{
                  position: "fixed",
                  top: 0,
                  left: 0,
                  width: "100vw",
                  height: "100vh",
                  backgroundColor: "rgba(0,0,0,0)",
                  zIndex: 2000,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#fff"
              }}
          >
              <img
                  src="https://i.gifer.com/ZKZg.gif"
                  alt="loading"
                  width="100"
                  style={{ marginBottom: 10 }}
              />
              <Typography variant="h6" sx={{ color: "#fff" }}>
                  Đang xử lý, vui lòng chờ...
              </Typography>
          </Box>
      )}
        <div className="p-4 mx-auto space-y-4 bg-white">
          <div className="overflow-x-auto rounded-2xl shadow">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 text-left text-sm font-medium">STT</th>
                <th className="px-3 py-2 text-left text-sm font-medium">Mã chỉ tiêu</th>
                <th className="px-3 py-2 text-left text-sm font-medium">Tên chỉ tiêu</th>
                <th className="px-3 py-2 text-left text-sm font-medium">Đơn vị</th>
                <th className="px-3 py-2 text-center text-sm font-medium w-[100px]">Cho phép nhập</th>
                <th className="px-3 py-2 text-center text-sm font-medium w-[100px]">Hiện báo cáo</th>
                <th className="px-3 py-2 text-center text-sm font-medium w-[250px]">Nút chức năng</th>
                <th className="px-3 py-2 text-sm font-medium text-center w-[250px]" colSpan={3}>Hành động</th>
              </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
              <AnimatePresence initial={false}>
                  {rows.map((row, idx) => (
                      <motion.tr
                          key={row.id ?? `new-${idx}`}
                          exit={{ opacity: 0, y: -10 }}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.1 }}
                          className="bg-white hover:bg-gray-50 border-b border-gray-100 text-[13px]"
                      >
                          {/* STT */}
                          <td className="px-1 py-0.5 text-center w-10">{idx + 1}</td>
                          {/* Mã chỉ tiêu */}
                          <td className="px-1 py-0.5 w-[90px]">
                              <input
                                  type="text"
                                  className="w-full border border-gray-200 rounded px-1 py-[2px] text-[13px] focus:ring-1 focus:ring-blue-300 focus:outline-none"
                                  value={row.ma_chitieu}
                                  onChange={(e) => handleChange(idx, "ma_chitieu", e.target.value)}
                              />
                          </td>
                          {/* Tên chỉ tiêu */}
                          <td className="px-1 py-0.5 min-w-[150px]">
                              <input
                                  type="text"
                                  className="w-full border border-gray-200 rounded px-1 py-[2px] text-[13px] focus:ring-1 focus:ring-blue-300 focus:outline-none"
                                  value={row.ten_chitieu}
                                  onChange={(e) => handleChange(idx, "ten_chitieu", e.target.value)}
                              />
                          </td>
                          {/* ĐVT */}
                          <td className="px-1 py-0.5 w-[70px]">
                              <input
                                  type="text"
                                  className="w-full border border-gray-200 rounded px-1 py-[2px] text-[13px] focus:ring-1 focus:ring-blue-300 focus:outline-none"
                                  value={row.dvt}
                                  onChange={(e) => handleChange(idx, "dvt", e.target.value)}
                              />
                          </td>
                          <td className="px-1 py-0.5 w-[70px]">
                              <td>{row.is_active?"Nhập":"Không nhập"}</td>
                          </td>
                          <td className="px-1 py-0.5 w-[70px]">
                              <td>{row.is_week?"Báo cáo tuần":"Tất cả"}</td>
                          </td>
                          <td className="px-1 py-0.5 text-center w-[100px]">
                              <button
                                  onClick={() => handleOpen(row,idx)}
                                  className={`p-1 mx-1 rounded text-xs font-medium transition-all
                                         ${selectedRow?.id === row.id
                                      ? "bg-blue-600 text-white"              // ✅ đang chọn
                                      : "bg-blue-50 text-blue-600 hover:bg-blue-100" // 🌈 mặc định + hover
                                  }`}
                              >
                                  <Info size={14} className="inline-block mr-1" />
                                  Chi tiết
                              </button>
                              <button
                                  onClick={() => handleAddBelow(idx)}
                                  className="p-1 bg-blue-50 mx-1 hover:bg-blue-100 text-blue-600 rounded text-xs"
                              >
                                  + Thêm dòng dưới
                              </button>
                          </td>

                          {/* Hành động */}
                          <td className="px-1 py-1  text-center w-[100px]">
                              <div className="flex justify-center gap-0.5">
                                  <button
                                      onClick={() => moveRow(idx, -1)}
                                      className="p-1 hover:bg-gray-200 rounded disabled:opacity-30 w-[25px]"
                                      disabled={idx === 0}
                                      title="Lên"
                                  >
                                      <ArrowUp size={13} />
                                  </button>
                                  <button
                                      onClick={() => moveRow(idx, 1)}
                                      className="p-1 hover:bg-gray-200 rounded disabled:opacity-30 w-[25px]"
                                      disabled={idx === rows.length - 1}
                                      title="Xuống"
                                  >
                                      <ArrowDown size={13} />
                                  </button>
                                  <button
                                      onClick={() => handleDelete(idx)}
                                      className="p-1 hover:bg-red-100 rounded text-red-600 w-[25px]"
                                      title="Xóa"
                                  >
                                      <Trash2 size={13} />
                                  </button>
                              </div>
                          </td>
                      </motion.tr>
                  ))}
              </AnimatePresence>
              </tbody>
            </table>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap gap-2 pt-4">
            <button
                onClick={handleAdd}
                className="inline-flex items-center gap-1 px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700"
            >
              <Plus size={18} /> Thêm mới
            </button>

            {rows.length > 0 && (
                <button
                    onClick={handleSaveAll}
                    className="inline-flex items-center gap-1 px-4 py-2 bg-green-600 text-white rounded-lg shadow hover:bg-green-700"
                >
                  <Save size={18} /> Lưu danh sách
                </button>
            )}
          </div>
            <Dialog open={openDialog} onClose={handleClose} maxWidth="sm" fullWidth>
                <DialogTitle>Thông tin chi tiết</DialogTitle>
                <DialogContent dividers>
                    {selectedRow ? (
                            <div className="space-y-2 text-sm">
                                <div>
                                    <label className="font-semibold">Mã chỉ tiêu:</label>
                                    <input
                                        type="text"
                                        className="w-full border rounded px-2 py-1 text-sm"
                                        value={selectedRow.ma_chitieu}
                                        disabled={true}
                                    />
                                </div>
                                <div>
                                    <label className="font-semibold">Tên chỉ tiêu:</label>
                                    <input
                                        type="text"
                                        className="w-full border rounded px-2 py-1 text-sm"
                                        value={selectedRow.ten_chitieu}
                                        disabled={true}
                                    />
                                </div>
                                <div>
                                    <label className="font-semibold">Đơn vị:</label>
                                    <input
                                        type="text"
                                        className="w-full border rounded px-2 py-1 text-sm"
                                        value={selectedRow.dvt}
                                        disabled={true}
                                    />
                                </div>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        className="h-4 w-4 accent-green-500"
                                        checked={selectedRow.is_active}
                                        onChange={(e) => handleChange(selectedIndex, "is_active", e.target.checked)}
                                    />
                                    <span>Cho phép nhập số liệu</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        className="h-4 w-4 accent-green-500"
                                        checked={selectedRow.writte_309}
                                        onChange={(e) => handleChange(selectedIndex, "writte_309", e.target.checked)}
                                    />
                                    <span>Chu kỳ Từ 1/10 đến 30/9</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        className="h-4 w-4 accent-green-500"
                                        checked={selectedRow.is_week}
                                        onChange={(e) => handleChange(selectedIndex, "is_week", e.target.checked)}
                                    />
                                    <span>Hiển thị ở báo cáo tuần</span>
                                </div>
                            </div>
                    ) : (
                        <p>Không có dữ liệu</p>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}>Đóng</Button>
                </DialogActions>
            </Dialog>
        </div>

      </TableHearder>
  );
}