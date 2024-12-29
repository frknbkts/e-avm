const accountRepository = require("../repositories/AccountRepository");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

class AccountService {
    // Kullanıcı kaydı yap
    async register(name, email, password) {
        // Kullanıcının zaten mevcut olup olmadığını kontrol et
        const existingUser = await accountRepository.findByEmail(email);
        if (existingUser) {
            throw new Error("Email already in use");
        }

        // Şifreyi hashle
        const hashedPassword = await bcrypt.hash(password, 10);

        // Yeni kullanıcı oluştur
        const user = await accountRepository.create({
            name,
            email,
            password: hashedPassword,
        });

        return user;
    }

    // Kullanıcı girişi yap
    async login(email, password) {
        const user = await accountRepository.findByEmail(email);
        if (!user) {
            throw new Error("Invalid email or password");
        }
    
        const isPasswordCorrect = await bcrypt.compare(password, user.password);
        if (!isPasswordCorrect) {
            throw new Error("Invalid email or password");
        }
    
        const token = jwt.sign(
            { userId: user.id },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        );
    
        // Şifreyi istemciye göndermemek için destructuring kullanarak çıkarıyoruz
        const { password: _, ...userWithoutPassword } = user;
    
        return { token, user: userWithoutPassword };
    }
}

module.exports = new AccountService();
