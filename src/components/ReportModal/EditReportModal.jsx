// Thêm vào đầu file ReportHistory.js
const EditReportModal = ({
                             open,
                             onClose,
                             report,
                             fileTypes,
                             onUpdateSuccess
                         }) => {
    const [selectedFileType, setSelectedFileType] = useState(report?.id_loaibaocao || "");
    const [week, setWeek] = useState(report?.week_report || "");
    const [month, setMonth] = useState(report?.month_report || "");
    const [quarter, setQuarter] = useState(report?.quarterly_report || "");
    const [numberYear, setNumberYear] = useState(report?.number_report || "");
    const [year, setYear] = useState(report?.year_report || currentYear);
    const [fileName, setFileName] = useState("");
    const [previewData, setPreviewData] = useState([]);
    const [loading, setLoading] = useState(false);

    const inputRef = useRef(null);
    const datapost = useRef([]);
    const mergesRef = useRef([]);
    const selectedType = parseInt(selectedFileType);

    const handleFileChange = async (event) => {
        const file = event.target.files[0];
        if (file) {
            setFileName(file.name);
            const reader = new FileReader();
            reader.onload = async (e) => {
                const workbook = new ExcelJS.Workbook();
                await workbook.xlsx.load(e.target.result);
                const worksheet = workbook.worksheets[0];
                const jsonData = [];
                const totalRows = worksheet.rowCount;

                for (let i = 1; i <= totalRows; i++) {
                    const row = worksheet.getRow(i);
                    const rowData = [];
                    for (let j = 1; j <= row.cellCount; j++) {
                        rowData.push(row.getCell(j).value ?? "");
                    }
                    jsonData.push(rowData);
                }

                const maxCols = Math.max(...jsonData.map((row) => row.length));
                const normalized = jsonData.map((row) => {
                    const newRow = Array.from(row);
                    while (newRow.length < maxCols) {
                        newRow.push("");
                    }
                    return newRow;
                });

                setPreviewData(normalized.slice(0, 500));

                // Xử lý merge cells
                const merges = [];
                const mergeRanges = worksheet.model?.merges || [];
                mergeRanges.forEach((rangeStr) => {
                    const [start, end] = rangeStr.split(':');
                    const startCell = worksheet.getCell(start);
                    const endCell = worksheet.getCell(end);

                    merges.push({
                        row: startCell.row - 1,
                        col: startCell.col - 1,
                        rowspan: endCell.row - startCell.row + 1,
                        colspan: endCell.col - startCell.col + 1,
                    });
                });

                mergesRef.current = merges;

                // Xử lý dữ liệu để lưu vào database
                try {
                    const { data } = await api.get("/chitieu", {
                        params: {type: selectedFileType, year},
                    });

                    datapost.current = [];
                    const previrewExcel = jsonData.slice(8, 500);

                    for (let i = 0; i < data.length; i++) {
                        if(data[i].ten_chitieu === previrewExcel[i][1]) {
                            if(previrewExcel[i][3] != null && previrewExcel[i][3] !== "") {
                                datapost.current.push({
                                    id_report: report.id,
                                    id_chitieu: data[i].id,
                                    value1: String(previrewExcel[i][3] || "0"),
                                });
                            }

                            if(data[i].is_active) {
                                datapost.current.push({
                                    id_report: report.id,
                                    id_chitieu: data[i].id,
                                    value1: String(previrewExcel[i][3] || "0"),
                                    value2: String(previrewExcel[i][4] || "0"),
                                    value3: String(previrewExcel[i][5] || "0"),
                                });
                            }
                        }
                    }
                } catch (e) {
                    console.error("Lỗi khi tải cấu trúc tiệp:", e);
                }
            };
            reader.readAsArrayBuffer(file);
        }
    };

    const handleSubmit = async () => {
        if (!selectedFileType) {
            alert("Vui lòng chọn loại báo cáo");
            return;
        }

        setLoading(true);
        try {
            const formData = new FormData();
            const user = JSON.parse(localStorage.getItem("username"));
            const file = inputRef.current?.files[0];

            // Nếu có file mới, thêm vào formData
            if (file) {
                formData.append("filename", file);
            }

            formData.append("id_user", user.id);
            formData.append("id_xa", user.id_xa);
            formData.append("id_loaibaocao", selectedFileType);
            formData.append("year_report", year);
            formData.append("number_report", numberYear);

            if (week) formData.append("week_report", week);
            if (month) formData.append("month_report", month);
            if (quarter) formData.append("quarterly_report", quarter);
            if (numberYear) formData.append("number_report", numberYear);

            // Gửi yêu cầu cập nhật
            await api.put(`/reports/${report.id}`, formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            // Nếu có file mới, xóa dữ liệu cũ và thêm dữ liệu mới
            if (file) {
                await api.delete(`/report-data/${report.id}`);
                await api.post("/report-data-bulk-insert", { records: datapost.current });
            }

            alert("✅ Cập nhật báo cáo thành công!");
            onUpdateSuccess();
            onClose();
        } catch (err) {
            console.error("❌ Lỗi cập nhật báo cáo:", err);
            alert("❌ Cập nhật thất bại. Vui lòng thử lại.");
        } finally {
            setLoading(false);
        }
    };

    const handleClickUpload = () => inputRef.current.click();

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="lg"
            fullWidth
            TransitionComponent={Fade}
        >
            <DialogTitle>
                Cập nhật báo cáo
                <IconButton
                    onClick={onClose}
                    sx={{ position: 'absolute', right: 8, top: 8 }}
                >
                    <X size={20} />
                </IconButton>
            </DialogTitle>

            <DialogContent dividers>
                <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                        <FormControl fullWidth sx={{ mb: 2 }}>
                            <InputLabel>Loại báo cáo</InputLabel>
                            <Select
                                label="Loại báo cáo"
                                value={selectedFileType}
                                onChange={(e) => setSelectedFileType(e.target.value)}
                            >
                                {fileTypes.map((type) => (
                                    <MenuItem key={type.id} value={type.id}>
                                        {type.name}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        <Grid container spacing={2}>
                            {selectedType === 1 && (
                                <Grid item xs={6}>
                                    <FormControl fullWidth>
                                        <InputLabel>Tuần</InputLabel>
                                        <Select
                                            label="Tuần"
                                            value={week}
                                            onChange={(e) => setWeek(e.target.value)}
                                        >
                                            {weeks.map((w) => (
                                                <MenuItem key={w} value={w}>
                                                    Tuần {w}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Grid>
                            )}

                            {(selectedType === 1 || selectedType === 2) && (
                                <Grid item xs={6}>
                                    <FormControl fullWidth>
                                        <InputLabel>Tháng</InputLabel>
                                        <Select
                                            label="Tháng"
                                            value={month}
                                            onChange={(e) => setMonth(e.target.value)}
                                        >
                                            {months.map((m) => (
                                                <MenuItem key={m} value={m}>
                                                    Tháng {m}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Grid>
                            )}

                            {selectedType === 3 && (
                                <Grid item xs={6}>
                                    <FormControl fullWidth>
                                        <InputLabel>Quý</InputLabel>
                                        <Select
                                            label="Quý"
                                            value={quarter}
                                            onChange={(e) => setQuarter(e.target.value)}
                                        >
                                            {quarters.map((q) => (
                                                <MenuItem key={q} value={q}>
                                                    Quý {q}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Grid>
                            )}

                            {selectedType === 4 && (
                                <Grid item xs={6}>
                                    <FormControl fullWidth>
                                        <InputLabel>Lần</InputLabel>
                                        <Select
                                            label="Lần"
                                            value={numberYear}
                                            onChange={(e) => setNumberYear(e.target.value)}
                                        >
                                            {numberYears.map((n) => (
                                                <MenuItem key={n} value={n}>
                                                    Lần {n}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Grid>
                            )}

                            <Grid item xs={6}>
                                <FormControl fullWidth>
                                    <InputLabel>Năm</InputLabel>
                                    <Select
                                        label="Năm"
                                        value={year}
                                        onChange={(e) => setYear(e.target.value)}
                                    >
                                        {years.map((y) => (
                                            <MenuItem key={y} value={y}>
                                                Năm {y}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>
                        </Grid>

                        <Box mt={3}>
                            <input
                                type="file"
                                ref={inputRef}
                                style={{ display: 'none' }}
                                onChange={handleFileChange}
                                accept=".xlsx,.xls"
                            />
                            <Button
                                fullWidth
                                variant="outlined"
                                startIcon={<UploadFileIcon />}
                                onClick={handleClickUpload}
                            >
                                Chọn file mới
                            </Button>
                            {fileName && (
                                <Typography variant="caption" color="success.main">
                                    File mới: {fileName}
                                </Typography>
                            )}
                            {!fileName && (
                                <Typography variant="caption">
                                    File hiện tại: {report.filename}
                                </Typography>
                            )}
                        </Box>
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <Typography variant="subtitle1" gutterBottom>
                            Xem trước dữ liệu
                        </Typography>
                        <Box
                            id="handsontable-preview"
                            sx={{
                                height: 300,
                                border: '1px solid #ddd',
                                borderRadius: 1,
                                overflow: 'hidden'
                            }}
                        />
                    </Grid>
                </Grid>
            </DialogContent>

            <DialogActions>
                <Button onClick={onClose} disabled={loading}>
                    Hủy
                </Button>
                <Button
                    onClick={handleSubmit}
                    variant="contained"
                    color="primary"
                    disabled={loading}
                    startIcon={loading ? <CircularProgress size={20} /> : null}
                >
                    {loading ? 'Đang xử lý...' : 'Cập nhật'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

// Trong component ReportHistory, thay thế Modal hiện tại bằng:
