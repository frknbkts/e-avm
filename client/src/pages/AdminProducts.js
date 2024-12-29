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
    CircularProgress
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { products } from '../services/api';
import { toast } from 'react-toastify';

const AdminProducts = () => {
    const [productList, setProductList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [openDialog, setOpenDialog] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        price: '',
        stock: '',
        description: '',
        categoryId: ''
    });

    useEffect(() => {
        loadProducts();
    }, []);

    const loadProducts = async () => {
        try {
            const response = await products.getAll(true); // true ile silinmiş ürünleri de getir
            setProductList(response.data);
            setError(null);
        } catch (err) {
            setError('Ürünler yüklenirken bir hata oluştu');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenDialog = (product = null) => {
        if (product) {
            setSelectedProduct(product);
            setFormData({
                name: product.name,
                price: product.price.toString(),
                stock: product.stock.toString(),
                description: product.description || '',
                categoryId: product.categoryId.toString()
            });
        } else {
            setSelectedProduct(null);
            setFormData({
                name: '',
                price: '',
                stock: '',
                description: '',
                categoryId: ''
            });
        }
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setSelectedProduct(null);
        setFormData({
            name: '',
            price: '',
            stock: '',
            description: '',
            categoryId: ''
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
                price: parseFloat(formData.price),
                stock: parseInt(formData.stock),
                categoryId: parseInt(formData.categoryId)
            };

            if (selectedProduct) {
                await products.update(selectedProduct.id, data);
                toast.success('Ürün güncellendi');
            } else {
                await products.create(data);
                toast.success('Ürün oluşturuldu');
            }

            handleCloseDialog();
            loadProducts();
        } catch (err) {
            toast.error(err.response?.data?.error || 'Bir hata oluştu');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Bu ürünü silmek istediğinizden emin misiniz?')) {
            try {
                await products.delete(id);
                toast.success('Ürün silindi');
                loadProducts();
            } catch (err) {
                toast.error(err.response?.data?.error || 'Ürün silinirken bir hata oluştu');
            }
        }
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
                    Ürün Yönetimi
                </Typography>
                <Button
                    variant="contained"
                    color="primary"
                    onClick={() => handleOpenDialog()}
                >
                    Yeni Ürün Ekle
                </Button>
            </Box>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>ID</TableCell>
                            <TableCell>Ürün Adı</TableCell>
                            <TableCell align="right">Fiyat</TableCell>
                            <TableCell align="right">Stok</TableCell>
                            <TableCell>Durum</TableCell>
                            <TableCell align="center">İşlemler</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {productList.map((product) => (
                            <TableRow key={product.id}>
                                <TableCell>{product.id}</TableCell>
                                <TableCell>{product.name}</TableCell>
                                <TableCell align="right">{product.price.toFixed(2)} TL</TableCell>
                                <TableCell align="right">{product.stock}</TableCell>
                                <TableCell>
                                    {product.isDeleted ? (
                                        <Typography color="error">Silinmiş</Typography>
                                    ) : (
                                        <Typography color="success">Aktif</Typography>
                                    )}
                                </TableCell>
                                <TableCell align="center">
                                    <IconButton
                                        color="primary"
                                        onClick={() => handleOpenDialog(product)}
                                    >
                                        <EditIcon />
                                    </IconButton>
                                    <IconButton
                                        color="error"
                                        onClick={() => handleDelete(product.id)}
                                    >
                                        <DeleteIcon />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
                <DialogTitle>
                    {selectedProduct ? 'Ürün Düzenle' : 'Yeni Ürün Ekle'}
                </DialogTitle>
                <form onSubmit={handleSubmit}>
                    <DialogContent>
                        <TextField
                            fullWidth
                            label="Ürün Adı"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            margin="normal"
                            required
                        />
                        <TextField
                            fullWidth
                            label="Fiyat"
                            name="price"
                            type="number"
                            value={formData.price}
                            onChange={handleInputChange}
                            margin="normal"
                            required
                        />
                        <TextField
                            fullWidth
                            label="Stok"
                            name="stock"
                            type="number"
                            value={formData.stock}
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
                        <TextField
                            fullWidth
                            label="Kategori ID"
                            name="categoryId"
                            type="number"
                            value={formData.categoryId}
                            onChange={handleInputChange}
                            margin="normal"
                            required
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleCloseDialog}>İptal</Button>
                        <Button type="submit" variant="contained" color="primary">
                            {selectedProduct ? 'Güncelle' : 'Ekle'}
                        </Button>
                    </DialogActions>
                </form>
            </Dialog>
        </Container>
    );
};

export default AdminProducts; 