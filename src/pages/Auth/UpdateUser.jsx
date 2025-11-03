import React, { useEffect, useState } from "react";
import {
  TextField,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Box,
} from "@mui/material";
import { Save } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { confirmAlert } from "react-confirm-alert";
import "react-confirm-alert/src/react-confirm-alert.css";
import api from "@/config"; // axios base config
import TableHearder from "@/components/Table/TableHearder";
export default function UpdateUserInfo() {
  const [form, setForm] = useState({
    id:"",
    email: "",
    name: "",
    phone: "",
    position:""
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data } = await api.get("/me");
        setForm({
          id:data.id,
          email: data.email || "",
          name: data.name || "",
          phone: data.phone || "",
          position: data.position || "",
        });
      } catch (err) {
        confirmAlert({
          title: "Lỗi",
          message: "Không thể tải thông tin tài khoản.",
          buttons: [{ label: "OK", onClick: () => {} }],
        });
      }
    };
    fetchUser();
  }, []);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!form.email || !form.name || !form.phone) {
      confirmAlert({
        title: "Thiếu thông tin",
        message: "Vui lòng nhập đầy đủ Họ tên, Email và Số điện thoại.",
        buttons: [{ label: "OK", onClick: () => { } }],
      });
      return;
    }

    confirmAlert({
      title: "Xác nhận",
      message: "Bạn có chắc muốn cập nhật thông tin?",
      buttons: [
        {
          label: "Có",
          onClick: async () => {
            try {
              setLoading(true);
              const user=await api.put(`/users/update/${form.id}`, form);
              localStorage.setItem('username',JSON.stringify(user.data));
              confirmAlert({
                title: "Thành công",
                message: "Đã cập nhật thông tin thành công!",
                buttons: [{ label: "OK", onClick: () => {navigate("/")} }],
              });

            } catch (err) {
              confirmAlert({
                title: "Lỗi",
                message: "Cập nhật thất bại: " + err.message,
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
    <TableHearder title="Thay đổi thông tin tài khoản" >
      <h3 className="text-2xl text-red-500 bg-red-50">Đối với tài khoản lần đầu đăng nhập vui lòng cập nhật thông tin mới được sử dụng các chức năng tiếp theo</h3>
      <Box  mx="auto"  class="w-full relative">
        <Card elevation={3} maxWidth={600} mx="auto" class="bg-white ">
          <CardContent>


            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  required
                  label="Họ và tên"
                  value={form.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  required
                  label="Email"
                  type="email"
                  value={form.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  required
                  label="Số điện thoại"
                  value={form.phone}
                  onChange={(e) => handleChange("phone", e.target.value)}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                    fullWidth
                    required
                    label="Chức vụ"
                    value={form.position}
                    onChange={(e) => handleChange("position", e.target.value)}
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
                  {loading ? "Đang cập nhật..." : "Cập nhật"}
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Box>
    </TableHearder>
  );
}
