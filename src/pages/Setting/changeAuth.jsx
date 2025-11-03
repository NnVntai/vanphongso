import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
    TextField,
  Checkbox,
  FormControlLabel,
  Switch,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Box,
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form'

import { Link } from 'react-router-dom';
const ChangeAuth = () => {
     const {
        handleSubmit,
        control,
        reset,
        formState: { errors }
    } = useForm()

    const onSubmit = (data) => {
        console.log('Dữ liệu form:', data)
        alert(JSON.stringify(data, null, 2))
    }

    return(
       <div class=" min-h-screen container m-auto mt-6 max-w-7xl rounded-xl overflow-hidden ">
            <div class="flex items-center justify-between py-3 px-3 shadow-md rounded-4xl bg-gradient-to-r from-green-500 to-white">
                <div class="text-3xl font-semibold text-gray-50">Tiêu đề Trang</div>
                  <Link to="/" class="px-4 py-2 rounded bg-gray-200 text-sm text-black font-medium border-spacing-0 border-sx-lime-950  shadow-md hover:bg-gray-300 transition duration-300 ease-in-out transform hover:scale-105"   onclick="history.back()">
                    Quay Lại Trang Chủ
                </Link>
    
            </div>
            <div class="p-6  bg-white">
      
                {/* <h2 class="text-2xl font-bold mb-4 absolute opacity-">Nội dung chính</h2> */}
                <div class="m-2 mx-auto bg-white">
                    <Box
                        component="form"
                        onSubmit={handleSubmit(onSubmit)}
                        sx={{ maxWidth: 400, mx: 'auto', mt: 5, p: 3, boxShadow: 3, borderRadius: 2 }}
                        >
                        <h2 style={{ fontWeight: 'bold', marginBottom: '1rem' }}>Form Đăng Ký</h2>

                        {/* Họ tên */}
                        <Controller
                            name="name"
                            control={control}
                            defaultValue=""
                            rules={{ required: 'Vui lòng nhập tên' }}
                            render={({ field }) => (
                            <TextField
                                label="Họ và tên"
                                fullWidth
                                margin="normal"
                                error={!!errors.name}
                                helperText={errors.name?.message}
                                {...field}
                            />
                            )}
                        />

                        {/* Email */}
                        <Controller
                            name="email"
                            control={control}
                            defaultValue=""
                            rules={{
                            required: 'Vui lòng nhập email',
                            pattern: {
                                value: /^\S+@\S+$/i,
                                message: 'Email không hợp lệ'
                            }
                            }}
                            render={({ field }) => (
                            <TextField
                                label="Email"
                                fullWidth
                                margin="normal"
                                error={!!errors.email}
                                helperText={errors.email?.message}
                                {...field}
                            />
                            )}
                        />

                        {/* Giới tính */}
                        <FormControl fullWidth margin="normal">
                            <InputLabel id="gender-label">Giới tính</InputLabel>
                            <Controller
                            name="gender"
                            control={control}
                            defaultValue=""
                            rules={{ required: 'Chọn giới tính' }}
                            render={({ field }) => (
                                <Select
                                labelId="gender-label"
                                label="Giới tính"
                                {...field}
                                error={!!errors.gender}
                                >
                                <MenuItem value="male">Nam</MenuItem>
                                <MenuItem value="female">Nữ</MenuItem>
                                <MenuItem value="other">Khác</MenuItem>
                                </Select>
                            )}
                            />
                            {errors.gender && (
                            <span style={{ color: 'red', fontSize: 12 }}>{errors.gender.message}</span>
                            )}
                        </FormControl>

                        {/* Đồng ý điều khoản */}
                        <Controller
                            name="acceptTerms"
                            control={control}
                            defaultValue={false}
                            rules={{ required: true }}
                            render={({ field }) => (
                            <FormControlLabel
                                control={<Checkbox {...field} checked={field.value} />}
                                label="Tôi đồng ý điều khoản"
                            />
                            )}
                        />
                        {errors.acceptTerms && (
                            <span style={{ color: 'red', fontSize: 12 }}>Bạn cần đồng ý điều khoản</span>
                        )}

                        {/* Đăng ký nhận email */}
                        <Controller
                            name="subscribe"
                            control={control}
                            defaultValue={false}
                            render={({ field }) => (
                            <FormControlLabel
                                control={<Switch {...field} checked={field.value} />}
                                label="Nhận email khuyến mãi"
                            />
                            )}
                        />

                        <Box mt={2}>
                            <Button variant="contained" color="primary" type="submit" fullWidth>
                            Gửi thông tin
                            </Button>
                        </Box>
                    </Box>
                </div>
            </div>
        </div>
    )
};
export default ChangeAuth;