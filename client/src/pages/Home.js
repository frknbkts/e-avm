import React, { useState, useEffect } from 'react';
import {
    Container,
    Grid,
    Card,
    CardContent,
    CardMedia,
    Typography,
    Button,
    TextField,
    Box,
    CircularProgress,
    Alert
} from '@mui/material';
import { products } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';
import { cart } from '../services/api';

const Home = () => {
    const [productList, setProductList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { user } = useAuth();

    useEffect(() => {
        loadProducts();
    }, []);

    const loadProducts = async () => {
        try {
            const response = await products.getAll();
            setProductList(response.data);
            setError(null);
        } catch (err) {
            setError('Ürünler yüklenirken bir hata oluştu');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleAddToCart = async (productId) => {
        try {
            await cart.add(productId);
            toast.success('Ürün sepete eklendi');
        } catch (err) {
            toast.error(err.response?.data?.error || 'Ürün sepete eklenirken bir hata oluştu');
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
            <Typography variant="h4" component="h1" gutterBottom>
                Ürünlerimiz
            </Typography>
            <Grid container spacing={4}>
                {productList.map((product) => (
                    <Grid item key={product.id} xs={12} sm={6} md={4}>
                        <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                            <CardMedia
                                component="img"
                                height="200"
                                image={product.image || 'https://via.placeholder.com/200'}
                                alt={product.name}
                            />
                            <CardContent sx={{ flexGrow: 1 }}>
                                <Typography gutterBottom variant="h5" component="h2">
                                    {product.name}
                                </Typography>
                                <Typography>
                                    {product.description}
                                </Typography>
                                <Typography variant="h6" color="primary" sx={{ mt: 2 }}>
                                    {product.price.toFixed(2)} TL
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Stok: {product.stock}
                                </Typography>
                            </CardContent>
                            <Box sx={{ p: 2 }}>
                                <Button
                                    fullWidth
                                    variant="contained"
                                    onClick={() => handleAddToCart(product.id)}
                                    disabled={!user || product.stock === 0}
                                >
                                    {product.stock === 0 ? 'Stokta Yok' : 'Sepete Ekle'}
                                </Button>
                            </Box>
                        </Card>
                    </Grid>
                ))}
            </Grid>
        </Container>
    );
};

export default Home; 