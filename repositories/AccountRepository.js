const prisma = require("../config/prisma");

class AccountRepository {
    //Kullanıcıyı e-posta ile bul
    async findByEmail(email) {
        return await prisma.user.findUnique({ where: { email } });
    }

    //Yeni bir kullanıcı oluştur
    async create(user) {
        return await prisma.user.create({ data: user });
    }
}
module.exports = new AccountRepository();
