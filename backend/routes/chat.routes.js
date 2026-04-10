const router = require("express").Router();
const { chatWithAssistant } = require("../controllers/chat.controller");

router.post("/", chatWithAssistant);

module.exports = router;
