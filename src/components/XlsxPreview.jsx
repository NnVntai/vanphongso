// components/XlsxPreview.jsx
import React, { useEffect, useRef, useState } from "react";
import Handsontable from "handsontable";
import { CircularProgress, Box } from "@mui/material";
import "handsontable/dist/handsontable.full.min.css";
import api from "@/config";

export default function XlsxPreview({ fileUrl, filename, report }) {
  const containerRef = useRef(null);
  const hotInstanceRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [excelData, setExcelData] = useState(null);

  // 🔹 1. Fetch dữ liệu từ API
  useEffect(() => {
    if (!filename) return;
    let canceled = false;

    const fetchAndParseExcel = async () => {
      try {
        setLoading(true);
        const res = await api.post("/excel/read", { filename });
        if (!canceled) {
          setExcelData(res.data);
        }
      } catch (err) {
        console.error("Lỗi đọc file Excel:", err);
      } finally {
        if (!canceled) setLoading(false);
      }
    };

    fetchAndParseExcel();

    return () => {
      canceled = true;
    };
  }, [filename]);

  // 🔹 2. Render Handsontable khi cả dữ liệu & DOM sẵn sàng
  useEffect(() => {
    if (!excelData || !containerRef.current) return;

    try {
      const sheetName = Object.keys(excelData.sheets)[0];
      const sheetData = excelData.sheets[sheetName];
      const columns = ["A", "B", "C", "D", "E", "F", "G"];

      const rows = Object.keys(sheetData)
        .sort((a, b) => Number(a) - Number(b))
        .map((rowKey) =>
          columns.map((colKey) => sheetData[rowKey][colKey] ?? "")
        );

      const maxCols = Math.max(...rows.map((r) => r.length));
      const normalized = rows.map((r) => {
        const newRow = [...r];
        while (newRow.length < maxCols) newRow.push("");
        return newRow;
      });

      // 🔸 Hủy bảng cũ nếu có
      if (hotInstanceRef.current) {
        hotInstanceRef.current.destroy();
      }

      // 🔸 Tạo Handsontable mới
      hotInstanceRef.current = new Handsontable(containerRef.current, {
        data: normalized,
        rowHeaders: true,
        colHeaders: true,
        licenseKey: "non-commercial-and-evaluation",
        stretchH: "all",
        width: "100%",
        height: 500,
        maxCols:
          report.id_loaibaocao === 1 || report.id_loaibaocao === 2 ? 7 : 6,
        manualColumnResize: true,
        manualRowResize: true,
        columnSorting: true,
        filters: true,
        dropdownMenu: true,
        readOnly: true,
      });
    } catch (err) {
      console.error("Lỗi hiển thị dữ liệu từ API:", err);
    }

    return () => {
      if (hotInstanceRef.current) {
        hotInstanceRef.current.destroy();
        hotInstanceRef.current = null;
      }
    };
  }, [excelData, report]);

  // 🔹 3. Loading UI
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={4}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <div
      ref={containerRef}
      id="handsontable-preview"
      className="w-full overflow-x-auto"
    />
  );
}
