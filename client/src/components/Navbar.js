import React, { useState } from 'react';
import {
    AppBar,
    Toolbar,
    Typography,
    Button,
    IconButton,
    Box,
    Menu,
    MenuItem,
    Badge
} from '@mui/material';
import {
    ShoppingCart as CartIcon,
    Person as PersonIcon,
    Menu as MenuIcon
} from '@mui/icons-material';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Navbar = () => {
    const { user, logout, isAdmin } = useAuth();
    const navigate = useNavigate();
    const [anchorEl, setAnchorEl] = useState(null);

    const handleMenu = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleLogout = () => {
        logout();
        handleClose();
        navigate('/login');
    };

    return (
        <AppBar position="sticky">
            <Toolbar>
                <Typography
                    variant="h6"
                    component={Link}
                    to="/"
                    sx={{ flexGrow: 1, textDecoration: 'none', color: 'inherit' }}
                >
                    E-AVM
                </Typography>

                {user ? (
                    <>
                        <IconButton
                            component={Link}
                            to="/cart"
                            color="inherit"
                            sx={{ mr: 2 }}
                        >
                            <CartIcon />
                        </IconButton>

                        <IconButton
                            onClick={handleMenu}
                            color="inherit"
                        >
                            <PersonIcon />
                        </IconButton>
                        <Menu
                            anchorEl={anchorEl}
                            open={Boolean(anchorEl)}
                            onClose={handleClose}
                        >
                            <MenuItem
                                component={Link}
                                to="/profile"
                                onClick={handleClose}
                            >
                                Profilim
                            </MenuItem>
                            {isAdmin && (
                                <>
                                    <MenuItem
                                        component={Link}
                                        to="/admin/products"
                                        onClick={handleClose}
                                    >
                                        Ürün Yönetimi
                                    </MenuItem>
                                    <MenuItem
                                        component={Link}
                                        to="/admin/categories"
                                        onClick={handleClose}
                                    >
                                        Kategori Yönetimi
                                    </MenuItem>
                                </>
                            )}
                            <MenuItem onClick={handleLogout}>
                                Çıkış Yap
                            </MenuItem>
                        </Menu>
                    </>
                ) : (
                    <Box>
                        <Button
                            color="inherit"
                            component={Link}
                            to="/login"
                            sx={{ mr: 1 }}
                        >
                            Giriş Yap
                        </Button>
                        <Button
                            color="inherit"
                            component={Link}
                            to="/register"
                        >
                            Kayıt Ol
                        </Button>
                    </Box>
                )}
            </Toolbar>
        </AppBar>
    );
};

export default Navbar; 