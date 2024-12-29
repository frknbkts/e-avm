const express = require('express');
const path = require('path');
const accountRoutes = require('./routes/account.routes');
const productRoutes = require('./routes/product.routes');
const categoryRoutes = require('./routes/category.routes');

const app = express();

// Middleware'ler
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS middleware
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    next();
});

// API route'ları
app.use('/api/account', accountRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);

// React uygulaması için statik dosyalar
if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, 'client/build')));
    app.get('*', (req, res) => {
        res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
    });
}

// Hata yakalama middleware'i
app.use((err, req, res, next) => {
    console.error('Hata detayı:', {
        message: err.message,
        stack: err.stack,
        path: req.path,
        method: req.method,
        body: req.body,
        query: req.query,
        params: req.params,
        headers: req.headers
    });
    
    // Prisma hataları için özel mesajlar
    if (err.code) {
        switch (err.code) {
            case 'P2002':
                return res.status(400).json({ error: 'Bu kayıt zaten mevcut.' });
            case 'P2025':
                return res.status(404).json({ error: 'Kayıt bulunamadı.' });
            case 'P2003':
                return res.status(400).json({ error: 'İlişkili kayıt bulunamadı.' });
            default:
                console.error('Prisma Error Code:', err.code);
        }
    }

    // JWT hataları için özel mesajlar
    if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({ error: 'Geçersiz token.' });
    }
    if (err.name === 'TokenExpiredError') {
        return res.status(401).json({ error: 'Oturum süresi doldu. Lütfen tekrar giriş yapın.' });
    }

    res.status(500).json({ 
        error: 'Sunucu hatası!',
        details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server ${PORT} portunda çalışıyor`);
});

module.exports = app;
