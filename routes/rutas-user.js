const express = require("express");
const router = express.Router();
const { check } = require("express-validator");
const upload = require("../utils/multer");
const checkAuth = require("../middleware/check-auth");

const controladorUser = require("../controllers/controlador-user");

// create new user
router.post(
  "/",
  upload.single("image"),
  [
    check("name").not().isEmpty(),
    check("userName").not().isEmpty(),
    check("email").not().isEmpty(),
    check("password").not().isEmpty(),
    check("email").normalizeEmail().isEmail(),
    check("password").isLength({ min: 6 }),
  ],
  controladorUser.createUser
);

// consulta todos los Usuarios
router.get("/", controladorUser.getAllUsers);

// consulta usuario por su id
router.get("/:id", controladorUser.getUserById);

// login usuario
router.post(
  "/login",
  [
    check("email").not().isEmpty(),
    check("password").not().isEmpty(),
    check("email").normalizeEmail().isEmail(),
    check("password").isLength({ min: 6 }),
  ],
  controladorUser.loginUser
);

router.use(checkAuth);

// eliminar user por id
router.delete("/:id", controladorUser.deleteUser);


module.exports = router;
