const express = require("express");
const { check } = require("express-validator");
const controladorComment = require("../controllers/controlador-comment");
const checkAuth = require("../middleware/check-auth");
const router = express.Router();

// consulta todos los comments
router.get("/", controladorComment.getAllComments);

// consulta por id
router.get("/:id", controladorComment.getCommentById);

// get comments for feedback by id feedback
router.get("/feedbackId/:fid", controladorComment.getCommentsByFeedbackId);

// crear nuevo comment
router.post(
  "/",
  [
    check("details").not().isEmpty(),
    check("creator").not().isEmpty(),
    check("feedback_ref").not().isEmpty()
  ],
  controladorComment.createComment
);

router.use(checkAuth);

// modificar comment details por su id
router.patch(
  "/:id",
  [
    check("details").not().isEmpty()
  ],
  controladorComment.modifyComment
);

// eliminar comment por id
router.delete("/:id", controladorComment.deleteComment);

module.exports = router;