const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

module.exports = async (req, res, next) => {
    try {
        // Token'ı al
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).json({ error: 'Token bulunamadı' });
        }

        const token = authHeader.split(' ')[1]; // "Bearer TOKEN" formatından TOKEN kısmını al
        if (!token) {
            return res.status(401).json({ error: 'Geçersiz token formatı' });
        }

        // Token'ı doğrula
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Kullanıcıyı kontrol et
        const user = await prisma.user.findUnique({
            where: { id: decoded.id }
        });

        if (!user) {
            return res.status(401).json({ error: 'Kullanıcı bulunamadı' });
        }

        if (user.isDeleted) {
            return res.status(401).json({ error: 'Hesap pasif durumda' });
        }

        // Kullanıcı bilgilerini request nesnesine ekle
        req.user = {
            id: user.id,
            email: user.email,
            role: user.role
        };

        next();
    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ error: 'Geçersiz token' });
        }
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ error: 'Token süresi doldu' });
        }
        next(error);
    }
}; 