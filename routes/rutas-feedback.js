const express = require("express");
const { check } = require("express-validator");
const controladorFeedback = require("../controllers/controlador-feedback");
const checkAuth = require("../middleware/check-auth");
const router = express.Router();

// consulta todos los feedbacks
router.get("/", controladorFeedback.getAllFeedbacks);

// consulta por id
router.get("/id/:id", controladorFeedback.getFeedbackById);

// consulta por category
router.get("/:category", controladorFeedback.getFeedbackByCategory);

// consulta por status
router.get("/status/:status", controladorFeedback.getFeedbackByStatus);

// crear nuevo feedback
router.post(
  "/",
  [
    check("title").not().isEmpty(),
    check("category").not().isEmpty(),
    check("details").not().isEmpty(),
    check("creator").not().isEmpty(),
  ],
  controladorFeedback.createFeedback
);

// increment votes feedback por su id
router.patch("/increment/:fid/:uid", controladorFeedback.incrementFeedback);

// decrement votes feedback por su id y push idUser
router.patch("/decrement/:fid/:uid", controladorFeedback.decrementFeedback);

// modificar feedback por su id
router.patch(
  "/:id",
  [
    check("title").not().isEmpty(),
    check("category").not().isEmpty(),
    check("details").not().isEmpty(),
    check("status").not().isEmpty(),
  ],
  controladorFeedback.modifyFeedback
);

router.use(checkAuth);

// eliminar feedback por id
router.delete("/:id", controladorFeedback.deleteFeedback);

module.exports = router;
