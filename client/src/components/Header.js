import React from 'react';
import { Link } from 'react-router-dom';
import { MenuItem } from '@mui/material';

const Header = () => {
    const handleMenuClose = () => {
        // Handle menu close
    };

    const handleLogout = () => {
        // Handle logout
    };

    return (
        <div>
            <MenuItem onClick={handleMenuClose}>
                <Link to="/profile" style={{ textDecoration: 'none', color: 'inherit' }}>
                    Profilim
                </Link>
            </MenuItem>
            <MenuItem onClick={handleLogout}>Çıkış Yap</MenuItem>
        </div>
    );
};

export default Header; 