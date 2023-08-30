const express = require('express');
const router = express.Router();

router.use('/', (_,res) => {
    res.status(200).json({
        version: "v1",
        status: "OK",
    });
})

module.exports = router;
