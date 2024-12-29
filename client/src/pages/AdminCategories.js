import React, { useState, useEffect } from 'react';
import {
    Container,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    IconButton,
    Typography,
    Box,
    Alert,
    CircularProgress,
    Select,
    MenuItem,
    FormControl,
    InputLabel
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon, Add as AddIcon } from '@mui/icons-material';
import { categories } from '../services/api';
import { toast } from 'react-toastify';

const AdminCategories = () => {
    const [categoryList, setCategoryList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [openDialog, setOpenDialog] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        parentId: ''
    });

    useEffect(() => {
        loadCategories();
    }, []);

    const loadCategories = async () => {
        try {
            const response = await categories.getAll(true);
            setCategoryList(response.data);
            setError(null);
        } catch (err) {
            setError('Kategoriler yüklenirken bir hata oluştu');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenDialog = (category = null) => {
        if (category) {
            setSelectedCategory(category);
            setFormData({
                name: category.name,
                description: category.description || '',
                parentId: category.parentId?.toString() || ''
            });
        } else {
            setSelectedCategory(null);
            setFormData({
                name: '',
                description: '',
                parentId: ''
            });
        }
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setSelectedCategory(null);
        setFormData({
            name: '',
            description: '',
            parentId: ''
        });
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const data = {
                ...formData,
                parentId: formData.parentId ? parseInt(formData.parentId) : null
            };

            if (selectedCategory) {
                await categories.update(selectedCategory.id, data);
                toast.success('Kategori güncellendi');
            } else {
                await categories.create(data);
                toast.success('Kategori oluşturuldu');
            }

            handleCloseDialog();
            loadCategories();
        } catch (err) {
            toast.error(err.response?.data?.error || 'Bir hata oluştu');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Bu kategoriyi silmek istediğinizden emin misiniz? Alt kategoriler de silinecektir.')) {
            try {
                await categories.delete(id);
                toast.success('Kategori silindi');
                loadCategories();
            } catch (err) {
                toast.error(err.response?.data?.error || 'Kategori silinirken bir hata oluştu');
            }
        }
    };

    const renderCategoryRow = (category, level = 0) => {
        return (
            <React.Fragment key={category.id}>
                <TableRow>
                    <TableCell style={{ paddingLeft: `${level * 2}rem` }}>
                        {category.name}
                    </TableCell>
                    <TableCell>{category.description}</TableCell>
                    <TableCell>{category._count?.products || 0}</TableCell>
                    <TableCell>
                        {category.isDeleted ? (
                            <Typography color="error">Silinmiş</Typography>
                        ) : (
                            <Typography color="success">Aktif</Typography>
                        )}
                    </TableCell>
                    <TableCell align="right">
                        <IconButton
                            color="primary"
                            onClick={() => handleOpenDialog(category)}
                        >
                            <EditIcon />
                        </IconButton>
                        <IconButton
                            color="error"
                            onClick={() => handleDelete(category.id)}
                        >
                            <DeleteIcon />
                        </IconButton>
                    </TableCell>
                </TableRow>
                {category.children?.map(child => renderCategoryRow(child, level + 1))}
            </React.Fragment>
        );
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Container>
                <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>
            </Container>
        );
    }

    return (
        <Container sx={{ py: 4 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h4" component="h1">
                    Kategori Yönetimi
                </Typography>
                <Button
                    variant="contained"
                    color="primary"
                    startIcon={<AddIcon />}
                    onClick={() => handleOpenDialog()}
                >
                    Yeni Kategori Ekle
                </Button>
            </Box>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Kategori Adı</TableCell>
                            <TableCell>Açıklama</TableCell>
                            <TableCell>Ürün Sayısı</TableCell>
                            <TableCell>Durum</TableCell>
                            <TableCell align="right">İşlemler</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {categoryList.map(category => renderCategoryRow(category))}
                    </TableBody>
                </Table>
            </TableContainer>

            <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
                <DialogTitle>
                    {selectedCategory ? 'Kategori Düzenle' : 'Yeni Kategori Ekle'}
                </DialogTitle>
                <form onSubmit={handleSubmit}>
                    <DialogContent>
                        <TextField
                            fullWidth
                            label="Kategori Adı"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            margin="normal"
                            required
                        />
                        <TextField
                            fullWidth
                            label="Açıklama"
                            name="description"
                            value={formData.description}
                            onChange={handleInputChange}
                            margin="normal"
                            multiline
                            rows={3}
                        />
                        <FormControl fullWidth margin="normal">
                            <InputLabel>Üst Kategori</InputLabel>
                            <Select
                                name="parentId"
                                value={formData.parentId}
                                onChange={handleInputChange}
                                label="Üst Kategori"
                            >
                                <MenuItem value="">Ana Kategori</MenuItem>
                                {categoryList.map(category => (
                                    <MenuItem
                                        key={category.id}
                                        value={category.id}
                                        disabled={selectedCategory?.id === category.id}
                                    >
                                        {category.name}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleCloseDialog}>İptal</Button>
                        <Button type="submit" variant="contained" color="primary">
                            {selectedCategory ? 'Güncelle' : 'Ekle'}
                        </Button>
                    </DialogActions>
                </form>
            </Dialog>
        </Container>
    );
};

export default AdminCategories; 