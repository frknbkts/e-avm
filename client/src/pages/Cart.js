import React, { useState, useEffect } from 'react';
import {
    Container,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    IconButton,
    Button,
    Box,
    CircularProgress,
    Alert
} from '@mui/material';
import { Add as AddIcon, Remove as RemoveIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { cart } from '../services/api';
import { toast } from 'react-toastify';

const Cart = () => {
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        loadCart();
    }, []);

    const loadCart = async () => {
        try {
            const response = await cart.get();
            setCartItems(response.data.items || []);
            setError(null);
        } catch (err) {
            setError('Sepet yüklenirken bir hata oluştu');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateQuantity = async (productId, currentQuantity, increment) => {
        const newQuantity = currentQuantity + (increment ? 1 : -1);
        if (newQuantity < 1) return;

        try {
            await cart.updateQuantity(productId, newQuantity);
            await loadCart();
            toast.success('Miktar güncellendi');
        } catch (err) {
            toast.error(err.response?.data?.error || 'Miktar güncellenirken bir hata oluştu');
        }
    };

    const handleRemoveItem = async (productId) => {
        try {
            await cart.remove(productId);
            await loadCart();
            toast.success('Ürün sepetten kaldırıldı');
        } catch (err) {
            toast.error(err.response?.data?.error || 'Ürün kaldırılırken bir hata oluştu');
        }
    };

    const calculateTotal = () => {
        return cartItems.reduce((total, item) => total + (item.product.price * item.quantity), 0);
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

    if (cartItems.length === 0) {
        return (
            <Container sx={{ py: 4 }}>
                <Typography variant="h5" align="center">
                    Sepetiniz boş
                </Typography>
            </Container>
        );
    }

    return (
        <Container sx={{ py: 4 }}>
            <Typography variant="h4" component="h1" gutterBottom>
                Sepetim
            </Typography>
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Ürün</TableCell>
                            <TableCell align="right">Fiyat</TableCell>
                            <TableCell align="center">Miktar</TableCell>
                            <TableCell align="right">Toplam</TableCell>
                            <TableCell align="center">İşlemler</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {cartItems.map((item) => (
                            <TableRow key={item.productId}>
                                <TableCell component="th" scope="row">
                                    {item.product.name}
                                </TableCell>
                                <TableCell align="right">
                                    {item.product.price.toFixed(2)} TL
                                </TableCell>
                                <TableCell align="center">
                                    <Box display="flex" alignItems="center" justifyContent="center">
                                        <IconButton
                                            size="small"
                                            onClick={() => handleUpdateQuantity(item.productId, item.quantity, false)}
                                        >
                                            <RemoveIcon />
                                        </IconButton>
                                        <Typography sx={{ mx: 2 }}>
                                            {item.quantity}
                                        </Typography>
                                        <IconButton
                                            size="small"
                                            onClick={() => handleUpdateQuantity(item.productId, item.quantity, true)}
                                        >
                                            <AddIcon />
                                        </IconButton>
                                    </Box>
                                </TableCell>
                                <TableCell align="right">
                                    {(item.product.price * item.quantity).toFixed(2)} TL
                                </TableCell>
                                <TableCell align="center">
                                    <IconButton
                                        color="error"
                                        onClick={() => handleRemoveItem(item.productId)}
                                    >
                                        <DeleteIcon />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                        <TableRow>
                            <TableCell colSpan={3}>
                                <Typography variant="h6">
                                    Toplam
                                </Typography>
                            </TableCell>
                            <TableCell align="right">
                                <Typography variant="h6">
                                    {calculateTotal().toFixed(2)} TL
                                </Typography>
                            </TableCell>
                            <TableCell />
                        </TableRow>
                    </TableBody>
                </Table>
            </TableContainer>
            <Box sx={{ mt: 4, textAlign: 'right' }}>
                <Button
                    variant="contained"
                    color="primary"
                    size="large"
                >
                    Siparişi Tamamla
                </Button>
            </Box>
        </Container>
    );
};

export default Cart; 