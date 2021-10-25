const express = require("express");

const router = express.Router();

const FileCtrl = require("../controllers/files");
const AuthHelper = require("../Helpers/AuthHelper");

router.post("/upload-file", AuthHelper.VerifyToken, FileCtrl.UploadFile);

module.exports = router;
