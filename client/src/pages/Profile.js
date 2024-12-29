import React, { useState, useEffect } from 'react';
import {
    Container,
    Typography,
    Box,
    TextField,
    Button,
    Grid,
    Paper,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    IconButton,
    Card,
    CardContent,
    Alert
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon, Home as HomeIcon } from '@mui/icons-material';
import { auth } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';

const Profile = () => {
    const { user, setUser } = useAuth();
    const [loading, setLoading] = useState(false);
    const [addresses, setAddresses] = useState([]);
    const [openPasswordDialog, setOpenPasswordDialog] = useState(false);
    const [openAddressDialog, setOpenAddressDialog] = useState(false);
    const [selectedAddress, setSelectedAddress] = useState(null);
    
    const [profileData, setProfileData] = useState({
        name: user?.name || '',
        email: user?.email || ''
    });

    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    const [addressData, setAddressData] = useState({
        title: '',
        fullName: '',
        phone: '',
        city: '',
        district: '',
        address: ''
    });

    useEffect(() => {
        loadAddresses();
    }, []);

    const loadAddresses = async () => {
        try {
            const response = await auth.getAddresses();
            setAddresses(response.data);
        } catch (err) {
            toast.error('Adresler yüklenirken bir hata oluştu');
        }
    };

    const handleProfileSubmit = async (e) => {
        e.preventDefault();
        
        // Validasyon
        if (!profileData.name || !profileData.email) {
            toast.error('Ad ve e-posta alanları zorunludur');
            return;
        }

        // E-posta formatı kontrolü
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(profileData.email)) {
            toast.error('Geçerli bir e-posta adresi giriniz');
            return;
        }

        setLoading(true);
        try {
            const response = await auth.updateProfile(profileData);
            setUser(response.data);
            toast.success('Profil güncellendi');
        } catch (err) {
            console.error('Profil güncelleme hatası:', err);
            toast.error(err.response?.data?.error || 'Profil güncellenirken bir hata oluştu');
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            toast.error('Yeni şifreler eşleşmiyor');
            return;
        }
        setLoading(true);
        try {
            await auth.changePassword(passwordData.currentPassword, passwordData.newPassword);
            toast.success('Şifre değiştirildi');
            setOpenPasswordDialog(false);
            setPasswordData({
                currentPassword: '',
                newPassword: '',
                confirmPassword: ''
            });
        } catch (err) {
            toast.error(err.response?.data?.error || 'Şifre değiştirilirken bir hata oluştu');
        } finally {
            setLoading(false);
        }
    };

    const handleAddressSubmit = async (e) => {
        e.preventDefault();
        if (!addressData.title || !addressData.fullName || !addressData.phone || !addressData.city || !addressData.district || !addressData.address) {
            toast.error('Lütfen tüm alanları doldurun');
            return;
        }
        setLoading(true);
        try {
            if (selectedAddress) {
                await auth.updateAddress(selectedAddress.id, addressData);
                toast.success('Adres güncellendi');
            } else {
                await auth.addAddress(addressData);
                toast.success('Adres eklendi');
            }
            await loadAddresses();
            handleCloseAddressDialog();
        } catch (err) {
            console.error('Hata:', err);
            toast.error(err.response?.data?.error || 'Adres kaydedilirken bir hata oluştu');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteAddress = async (id) => {
        if (window.confirm('Bu adresi silmek istediğinizden emin misiniz?')) {
            try {
                await auth.deleteAddress(id);
                toast.success('Adres silindi');
                loadAddresses();
            } catch (err) {
                toast.error(err.response?.data?.error || 'Adres silinirken bir hata oluştu');
            }
        }
    };

    const handleSetDefaultAddress = async (id) => {
        try {
            await auth.setDefaultAddress(id);
            toast.success('Varsayılan adres güncellendi');
            loadAddresses();
        } catch (err) {
            toast.error(err.response?.data?.error || 'Varsayılan adres güncellenirken bir hata oluştu');
        }
    };

    const handleOpenAddressDialog = (address = null) => {
        if (address) {
            setSelectedAddress(address);
            setAddressData({
                title: address.title,
                fullName: address.fullName,
                phone: address.phone,
                city: address.city,
                district: address.district,
                address: address.address
            });
        } else {
            setSelectedAddress(null);
            setAddressData({
                title: '',
                fullName: '',
                phone: '',
                city: '',
                district: '',
                address: ''
            });
        }
        setOpenAddressDialog(true);
    };

    const handleCloseAddressDialog = () => {
        setOpenAddressDialog(false);
        setSelectedAddress(null);
        setAddressData({
            title: '',
            fullName: '',
            phone: '',
            city: '',
            district: '',
            address: ''
        });
    };

    return (
        <Container sx={{ py: 4 }}>
            <Typography variant="h4" component="h1" gutterBottom>
                Profil Bilgilerim
            </Typography>

            <Grid container spacing={4}>
                {/* Profil Bilgileri */}
                <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 3 }}>
                        <Typography variant="h6" gutterBottom>
                            Kişisel Bilgiler
                        </Typography>
                        <form onSubmit={handleProfileSubmit}>
                            <TextField
                                fullWidth
                                label="Ad Soyad"
                                name="name"
                                value={profileData.name}
                                onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                                margin="normal"
                            />
                            <TextField
                                fullWidth
                                label="E-posta"
                                name="email"
                                value={profileData.email}
                                onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                                margin="normal"
                                type="email"
                            />
                            <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
                                <Button
                                    variant="contained"
                                    type="submit"
                                    disabled={loading}
                                >
                                    Bilgileri Güncelle
                                </Button>
                                <Button
                                    variant="outlined"
                                    onClick={() => setOpenPasswordDialog(true)}
                                >
                                    Şifre Değiştir
                                </Button>
                            </Box>
                        </form>
                    </Paper>
                </Grid>

                {/* Adres Bilgileri */}
                <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 3 }}>
                        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                            <Typography variant="h6">
                                Adres Bilgilerim
                            </Typography>
                            <Button
                                variant="contained"
                                onClick={() => handleOpenAddressDialog()}
                            >
                                Yeni Adres Ekle
                            </Button>
                        </Box>
                        
                        {addresses.map((address) => (
                            <Card key={address.id} sx={{ mb: 2 }}>
                                <CardContent>
                                    <Box display="flex" justifyContent="space-between" alignItems="center">
                                        <Typography variant="subtitle1" gutterBottom>
                                            {address.title}
                                            {address.isDefault && (
                                                <Typography component="span" color="primary" sx={{ ml: 1 }}>
                                                    (Varsayılan)
                                                </Typography>
                                            )}
                                        </Typography>
                                        <Box>
                                            {!address.isDefault && (
                                                <IconButton
                                                    onClick={() => handleSetDefaultAddress(address.id)}
                                                    title="Varsayılan Yap"
                                                >
                                                    <HomeIcon />
                                                </IconButton>
                                            )}
                                            <IconButton
                                                onClick={() => handleOpenAddressDialog(address)}
                                                title="Düzenle"
                                            >
                                                <EditIcon />
                                            </IconButton>
                                            <IconButton
                                                onClick={() => handleDeleteAddress(address.id)}
                                                title="Sil"
                                                color="error"
                                            >
                                                <DeleteIcon />
                                            </IconButton>
                                        </Box>
                                    </Box>
                                    <Typography variant="body1">{address.fullName}</Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        {address.phone}
                                    </Typography>
                                    <Typography variant="body2">
                                        {address.address}, {address.district}/{address.city}
                                    </Typography>
                                </CardContent>
                            </Card>
                        ))}
                    </Paper>
                </Grid>
            </Grid>

            {/* Şifre Değiştirme Dialog */}
            <Dialog open={openPasswordDialog} onClose={() => setOpenPasswordDialog(false)}>
                <form onSubmit={handlePasswordSubmit}>
                    <DialogTitle>Şifre Değiştir</DialogTitle>
                    <DialogContent>
                        <TextField
                            fullWidth
                            label="Mevcut Şifre"
                            type="password"
                            value={passwordData.currentPassword}
                            onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                            margin="normal"
                        />
                        <TextField
                            fullWidth
                            label="Yeni Şifre"
                            type="password"
                            value={passwordData.newPassword}
                            onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                            margin="normal"
                        />
                        <TextField
                            fullWidth
                            label="Yeni Şifre (Tekrar)"
                            type="password"
                            value={passwordData.confirmPassword}
                            onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                            margin="normal"
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setOpenPasswordDialog(false)}>İptal</Button>
                        <Button type="submit" variant="contained" disabled={loading}>
                            Şifre Değiştir
                        </Button>
                    </DialogActions>
                </form>
            </Dialog>

            {/* Adres Dialog */}
            <Dialog open={openAddressDialog} onClose={handleCloseAddressDialog}>
                <form onSubmit={handleAddressSubmit}>
                    <DialogTitle>
                        {selectedAddress ? 'Adres Düzenle' : 'Yeni Adres Ekle'}
                    </DialogTitle>
                    <DialogContent>
                        <TextField
                            fullWidth
                            label="Adres Başlığı"
                            value={addressData.title}
                            onChange={(e) => setAddressData({ ...addressData, title: e.target.value })}
                            margin="normal"
                        />
                        <TextField
                            fullWidth
                            label="Ad Soyad"
                            value={addressData.fullName}
                            onChange={(e) => setAddressData({ ...addressData, fullName: e.target.value })}
                            margin="normal"
                        />
                        <TextField
                            fullWidth
                            label="Telefon"
                            value={addressData.phone}
                            onChange={(e) => setAddressData({ ...addressData, phone: e.target.value })}
                            margin="normal"
                        />
                        <TextField
                            fullWidth
                            label="İl"
                            value={addressData.city}
                            onChange={(e) => setAddressData({ ...addressData, city: e.target.value })}
                            margin="normal"
                        />
                        <TextField
                            fullWidth
                            label="İlçe"
                            value={addressData.district}
                            onChange={(e) => setAddressData({ ...addressData, district: e.target.value })}
                            margin="normal"
                        />
                        <TextField
                            fullWidth
                            label="Açık Adres"
                            value={addressData.address}
                            onChange={(e) => setAddressData({ ...addressData, address: e.target.value })}
                            margin="normal"
                            multiline
                            rows={3}
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleCloseAddressDialog}>İptal</Button>
                        <Button type="submit" variant="contained" disabled={loading}>
                            {selectedAddress ? 'Güncelle' : 'Ekle'}
                        </Button>
                    </DialogActions>
                </form>
            </Dialog>
        </Container>
    );
};

export default Profile; 