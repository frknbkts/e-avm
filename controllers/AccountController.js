const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class AccountController {
    async login(req, res) {
        try {
            const { email, password } = req.body;

            const user = await prisma.user.findUnique({
                where: { email }
            });

            if (!user) {
                return res.status(401).json({ error: 'Kullanıcı bulunamadı' });
            }

            const validPassword = await bcrypt.compare(password, user.password);
            if (!validPassword) {
                return res.status(401).json({ error: 'Geçersiz şifre' });
            }

            const token = jwt.sign(
                { id: user.id, email: user.email, role: user.role },
                process.env.JWT_SECRET,
                { expiresIn: '24h' }
            );

            res.json({
                token,
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role
                }
            });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async register(req, res) {
        try {
            const { name, email, password } = req.body;

            const existingUser = await prisma.user.findUnique({
                where: { email }
            });

            if (existingUser) {
                return res.status(400).json({ error: 'Bu e-posta adresi zaten kullanılıyor' });
            }

            const hashedPassword = await bcrypt.hash(password, 10);
            const user = await prisma.user.create({
                data: {
                    name,
                    email,
                    password: hashedPassword,
                    role: 'USER'
                }
            });

            const token = jwt.sign(
                { id: user.id, email: user.email, role: user.role },
                process.env.JWT_SECRET,
                { expiresIn: '24h' }
            );

            res.status(201).json({
                token,
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role
                }
            });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async updateProfile(req, res) {
        try {
            const { name, email } = req.body;
            const userId = req.user.id;

            // Validasyon
            if (!name || !email) {
                return res.status(400).json({ error: 'Ad ve e-posta alanları zorunludur' });
            }

            // E-posta değişiyorsa, başka bir kullanıcı tarafından kullanılıyor mu kontrol et
            if (email !== req.user.email) {
                const existingUser = await prisma.user.findFirst({
                    where: { 
                        email,
                        id: { not: userId }
                    }
                });

                if (existingUser) {
                    return res.status(400).json({ error: 'Bu e-posta adresi zaten kullanılıyor' });
                }
            }

            const user = await prisma.user.update({
                where: { id: userId },
                data: { name, email }
            });

            // Hassas bilgileri çıkar
            const userResponse = {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role
            };

            res.json(userResponse);
        } catch (error) {
            console.error('Profil güncelleme hatası:', error);
            res.status(500).json({ error: 'Profil güncellenirken bir hata oluştu' });
        }
    }

    async changePassword(req, res) {
        try {
            const { currentPassword, newPassword } = req.body;
            const userId = req.user.id;

            const user = await prisma.user.findUnique({
                where: { id: userId }
            });

            const validPassword = await bcrypt.compare(currentPassword, user.password);
            if (!validPassword) {
                return res.status(401).json({ error: 'Mevcut şifre yanlış' });
            }

            const hashedPassword = await bcrypt.hash(newPassword, 10);
            await prisma.user.update({
                where: { id: userId },
                data: { password: hashedPassword }
            });

            res.json({ message: 'Şifre başarıyla değiştirildi' });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async getAddresses(req, res) {
        try {
            const addresses = await prisma.address.findMany({
                where: { userId: req.user.id },
                orderBy: { isDefault: 'desc' }
            });
            res.json(addresses);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async addAddress(req, res) {
        try {
            const { title, fullName, phone, city, district, address } = req.body;
            const userId = req.user.id;

            // Eğer ilk adres ise varsayılan yap
            const existingAddresses = await prisma.address.count({
                where: { userId }
            });

            const newAddress = await prisma.address.create({
                data: {
                    userId,
                    title,
                    fullName,
                    phone,
                    city,
                    district,
                    address,
                    isDefault: existingAddresses === 0
                }
            });

            res.status(201).json(newAddress);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async updateAddress(req, res) {
        try {
            const { id } = req.params;
            const { title, fullName, phone, city, district, address } = req.body;
            const userId = req.user.id;

            const updatedAddress = await prisma.address.update({
                where: {
                    id: parseInt(id),
                    userId // Sadece kullanıcının kendi adresini güncelleyebilmesi için
                },
                data: {
                    title,
                    fullName,
                    phone,
                    city,
                    district,
                    address
                }
            });

            res.json(updatedAddress);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async deleteAddress(req, res) {
        try {
            const { id } = req.params;
            const userId = req.user.id;

            await prisma.address.delete({
                where: {
                    id: parseInt(id),
                    userId // Sadece kullanıcının kendi adresini silebilmesi için
                }
            });

            res.status(204).send();
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async setDefaultAddress(req, res) {
        try {
            const { id } = req.params;
            const userId = req.user.id;

            // Önce tüm adreslerin varsayılan özelliğini kaldır
            await prisma.address.updateMany({
                where: { userId },
                data: { isDefault: false }
            });

            // Seçilen adresi varsayılan yap
            const updatedAddress = await prisma.address.update({
                where: {
                    id: parseInt(id),
                    userId
                },
                data: { isDefault: true }
            });

            res.json(updatedAddress);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}

module.exports = new AccountController();
