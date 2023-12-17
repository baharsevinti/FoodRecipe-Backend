const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user');

// Kullanıcı Kaydıs
router.post('/register', async (req, res) => {
  try {
    console.log(req.body);
    const { username, password ,email} = req.body;

  
    // Şifreyi hashleme
    const hashedPassword = await bcrypt.hash(password, 10);

    // Yeni kullanıcı oluştur
    const user = new User({ username, password: hashedPassword, email });
    await user.save();

    res.status(201).json({ message: 'Kullanıcı başarıyla kaydoldu' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Kullanıcı Girişi
router.post('/login', async (req, res) => {
  try {
    const { username, password,email} = req.body;

    // Kullanıcıyı bulma
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ message: 'Geçersiz kimlik bilgileri' });
    }

    // Şifre kontrolüs
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Geçersiz kimlik bilgileri' });
    }

    // JWT oluşturma
    const token = jwt.sign({ userId: user._id }, 'secret-key', { expiresIn: '1h' });

    res.status(200).json({ token });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
