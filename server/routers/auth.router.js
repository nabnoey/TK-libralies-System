const router = require("express").Router();
const { googleLogin, adminRegister, adminLogin } = require("../controllers/auth.controller");

router.post("/google", googleLogin); // POST /auth/google
router.post('/admin/register', adminRegister)
router.post('/admin/login', adminLogin)

module.exports = router;
