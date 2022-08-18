const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const multer = require("../middleware/multer-config");

const saucesCtrl = require("../controllers/sauces");

router.get("/", auth, multer, saucesCtrl.getAllSauces);
router.get("/:id", auth, multer, saucesCtrl.getOneSauce);
router.post("/", auth, multer, saucesCtrl.createSauces);
router.put("/:id", auth, multer, saucesCtrl.updateSauce);
router.delete("/:id", auth, multer, saucesCtrl.deleteSauce);
router.post("/:id/like", auth, multer, saucesCtrl.likeSauce);

module.exports = router;
