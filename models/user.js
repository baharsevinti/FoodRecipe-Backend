const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  role: { type: String, default: 'user' }
});

const User = mongoose.model('User', userSchema);

// Admin kullanıcısı oluşturma fonksiyonu
const createAdminUser = async () => {
  try {
    const adminUser = await User.findOne({ role: 'admin' });

    if (!adminUser) {
      const hashedPassword = await bcrypt.hash('adminpassword', 10); // Güvenli bir şifre kullanın
      await User.create({
        username: 'admin',
        password: hashedPassword,
        email: 'admin@example.com',
        role: 'admin',
      });

      console.log('Admin kullanıcısı başarıyla oluşturuldu.');
    }
  } catch (error) {
    console.error('Admin kullanıcısı oluşturma hatası:', error.message);
  }
};

// Admin kullanıcısı oluşturma fonksiyonunu çağır
createAdminUser();

module.exports = User;
