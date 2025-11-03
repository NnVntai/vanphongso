import React, { useState, useEffect } from "react";
import {
    Box,
    Typography,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Grid,
    Button,
    Table,
    TableHead,
    TableBody,
    TableCell,
    TableRow,
    Modal,
    IconButton,
    CircularProgress,
} from "@mui/material";
import { Download, X } from "lucide-react";
import TableHearder from "../../components/Table/TableHearder";
import axios from "axios";
import api from "@/config";
import XlsxPreview from "@/components/XlsxPreview";

// Constants for filter selectors

// Axios instance with auth header interceptor
export default function ReportAdmin() {
    /* -------------------- Local state -------------------- */
    // Filter state
    const [supports, setSupports] = useState([]);
    const [loadingSupports, setLoadingSupports] = useState(false);
    const [openSupportDetail, setOpenSupportDetail] = useState(false);
    const [selectedSupport, setSelectedSupport] = useState(null);

// 2. Hàm gọi API lấy danh sách hỗ trợ
    const fetchSupports = async () => {
        setLoadingSupports(true);
        try {
            const { data } = await api.get("/supports");
            setSupports(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error("Lỗi khi tải danh sách hỗ trợ:", err);
            setSupports([]);
        } finally {
            setLoadingSupports(false);
        }
    };

// 3. Gọi API khi component mount
    useEffect(() => {
        fetchSupports();
    }, []);

    /* -------------------- JSX -------------------- */
    return (
    <TableHearder title="Danh sách Người giử hỗ trợ" className="bg-white" >
        {/*<div className="bg-gray-50">*/}
            <Modal open={openSupportDetail} onClose={() => setOpenSupportDetail(false)}>
                <Box className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white p-6 rounded-2xl shadow w-[90vw] md:w-[50vw] max-h-[90vh] overflow-auto">
                    {selectedSupport ? (
                        <>
                            <Typography variant="h6" gutterBottom>
                                {selectedSupport.title}
                            </Typography>
                            <Typography variant="body2" color="textSecondary" gutterBottom>
                                Người gửi: {selectedSupport.user?.name || "Không rõ"}
                            </Typography>
                            <Typography variant="body2" gutterBottom>
                                Ngày tạo: {new Date(selectedSupport.created_at).toLocaleString("vi-VN")}
                            </Typography>
                            <Typography variant="body1" className="mt-4 whitespace-pre-line">
                                {selectedSupport.content}
                            </Typography>
                        </>
                    ) : (
                        <Typography>Không có dữ liệu.</Typography>
                    )}
                </Box>
            </Modal>


            <Box  className="bg-white" >
            {loadingSupports ? (
                <Box textAlign="center" p={4}><CircularProgress /></Box>
            ) : (
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell className="font-semibold">Tiêu đề</TableCell>
                            <TableCell className="font-semibold">Người gửi</TableCell>
                            <TableCell className="font-semibold">Ngày tạo</TableCell>
                            <TableCell className="font-semibold text-center">Hành động</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {supports.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} align="center">
                                    Không có yêu cầu hỗ trợ nào.
                                </TableCell>
                            </TableRow>
                        ) : (
                            supports.map((s) => (
                                <TableRow key={s.id}>
                                    <TableCell>{s.title}</TableCell>
                                    <TableCell>{s.user?.name || "Ẩn danh"}</TableCell>
                                    <TableCell>{new Date(s.created_at).toLocaleString("vi-VN")}</TableCell>
                                    <TableCell className="text-center">
                                        <Button
                                            variant="outlined"
                                            size="small"
                                            onClick={() => {
                                                setSelectedSupport(s);
                                                setOpenSupportDetail(true);
                                            }}
                                        >
                                            Xem
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            )}
        </Box>
         {/*</div>*/}
     </TableHearder>
    );
}
