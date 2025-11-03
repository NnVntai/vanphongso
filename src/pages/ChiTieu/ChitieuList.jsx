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
  const [selectedFileType, setSelectedFileType] = useState(0);
  const [fileTypes, setFileTypes] = useState([]);
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
        console.log(data);
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

  const handleChange = (index, field, value) => {
    const clone = [...rows];
    clone[index] = { ...clone[index], [field]: value };
    setRows(clone);
  };

  /* --------------------------- ⬇ SAVE ALL ⬇ --------------------------- */
  const handleSaveAll = async () => {
    if (!rows.length) return;
    try {
      setLoading(true);

      // Gửi 1 lần thay vì vòng lặp put/post
      const { data } = await api.post("/chitieu/bulk", { rows });
      console.log(data);
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

  const handleAdd = () => setRows((prev) => [...prev, stubRow(prev.length + 1)]);

  /* ---------------------------- Render UI ---------------------------- */
  if (loading) return <p className="p-4 text-center">Đang tải danh sách...</p>;
  if (error) return <p className="p-4 text-red-600">Lỗi: {error.message}</p>;
  const options = rows.map((r) => ({
    label: r.ma_chitieu+r.ten_chitieu,
    value: r.id , // đảm bảo có key duy nhất
  }));

  return (
      <TableHearder title="Danh sách các chỉ tiêu">
     

        {/* Body */}
        <div className="p-4 mx-auto space-y-4 bg-white">
          {/*<h1 className="text-xl font-bold">Danh sách chỉ tiêu</h1>*/}
                  <Grid item xs={12} sm={4} sx={{ minWidth: 150 }}>
                      <FormControl fullWidth><InputLabel>Khóa chỉ tiêu theo loại</InputLabel>
                          <MUISelect  label="Khóa chỉ tiêu theo loại"  value={selectedFileType} onChange={(e) => setSelectedFileType(e.target.value)}>
                            <MenuItem value="0">Tất cả</MenuItem>
                            {fileTypes.map((type) => (
                                <MenuItem key={type.id} value={type.id}>{type.name}</MenuItem>
                            ))}
                          </MUISelect>
                      </FormControl>
                  </Grid>
          {/* Table */}
          <div className="overflow-x-auto rounded-2xl shadow">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 text-left text-sm font-medium">STT</th>
                <th className="px-3 py-2 text-left text-sm font-medium">Mã chỉ tiêu</th>
                <th className="px-3 py-2 text-left text-sm font-medium">Tên chỉ tiêu</th>
                <th className="px-3 py-2 text-left text-sm font-medium">Đơn vị</th>
                {/*<th className="px-3 py-2 text-left text-sm font-medium">Công thức</th>*/}
                {/*<th className="px-3 py-2 text-left text-sm font-medium">Đơn vị</th>*/}
                <th className="px-3 py-2 text-center text-sm font-medium">có trường dữ liệu</th>
                <th className="px-3 py-2 text-center text-sm font-medium">Khóa(Block)</th>
                <th
                    className="px-3 py-2 text-sm font-medium text-center"
                    colSpan={3}
                >
                  Hành động
                </th>
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
                        transition={{ duration: 0.15 }}
                        className="bg-white hover:bg-gray-50"
                    >
                      <td className="px-3 py-1 text-sm text-center w-14">
                        {idx + 1}
                      </td>
                      <td className="px-3 py-1 w-40">
                        <input
                            type="text"
                            className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                            value={row.ma_chitieu}
                            onChange={(e) =>
                                handleChange(idx, "ma_chitieu", e.target.value)
                            }
                        />
                      </td>
                      <td className="px-3 py-1">
                        <input
                            type="text"
                            className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                            value={row.ten_chitieu}
                            onChange={(e) =>
                                handleChange(idx, "ten_chitieu", e.target.value)
                            }
                        />
                      </td>
                      <td className="px-3 py-1 w-32">
                        <input
                            type="text"
                            className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                            value={row.dvt}
                            onChange={(e) => handleChange(idx, "dvt", e.target.value)}
                        />
                      </td>
                      {/*<td className="px-3 py-1">*/}
                      {/*  <Select*/}
                      {/*      isMulti*/}
                      {/*      options={options}*/}
                      {/*      className="text-sm"*/}
                      {/*      value={options.filter((opt) =>*/}
                      {/*          row.formular?.includes(opt.value)*/}
                      {/*      )}*/}
                      {/*      onChange={(selected) => {*/}
                      {/*        const selectedValues = selected.map((opt) => opt.value);*/}
                      {/*        handleChange(idx, "formular", selectedValues);*/}
                      {/*      }}*/}
                      {/*  />*/}
                      {/*</td>*/}
                      <td className="px-3 py-1 text-center w-20">
                        <input
                            type="checkbox"
                            className="h-4 w-4"
                            checked={row.is_active}
                            onChange={(e) =>
                                handleChange(idx, "is_active", e.target.checked)
                            }
                        />
                        </td>
                        <td className="px-3 py-1 text-center w-20">
                          <input
                              type="checkbox"
                              className="h-4 w-4"
                              checked={row.block}
                              onChange={(e) =>
                                  handleChange(idx, "is_block", e.target.block)
                              }
                          />
                      </td>
                      <td className="px-1 py-1 text-center w-10">
                        <button
                            onClick={() => moveRow(idx, -1)}
                            className="p-1 hover:bg-gray-200 rounded"
                            disabled={idx === 0}
                        >
                          <ArrowUp size={16} />
                        </button>
                      </td>
                      <td className="px-1 py-1 text-center w-10">
                        <button
                            onClick={() => moveRow(idx, 1)}
                            className="p-1 hover:bg-gray-200 rounded"
                            disabled={idx === rows.length - 1}
                        >
                          <ArrowDown size={16} />
                        </button>
                      </td>
                      <td className="px-1 py-1 text-center w-10">
                        <button
                            onClick={() => handleDelete(idx)}
                            className="p-1 hover:bg-red-100 rounded"
                        >
                          <Trash2 size={16} />
                        </button>
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
        </div>

      </TableHearder>
  );
}