const express = require("express");
const { check } = require("express-validator");
const controladorReply = require("../controllers/controlador-reply");
const checkAuth = require("../middleware/check-auth");
const router = express.Router();

// consulta todos los replies
router.get("/", controladorReply.getAllReplies);

// consulta por id
router.get("/:id", controladorReply.getReplyById);

// crear nuevo reply
router.post(
  "/",
  [
    check("details").not().isEmpty(),
    check("inResponseToUser").not().isEmpty(),
    check("creator").not().isEmpty(),
    check("comment_ref").not().isEmpty()
  ],
  controladorReply.createReply
);

router.use(checkAuth);

// modificar reply details por su id
router.patch(
  "/:id",
  [
    check("details").not().isEmpty()
  ],
  controladorReply.modifyReply
);

// eliminar reply por id
router.delete("/:id", controladorReply.deleteReply);

module.exports = router;