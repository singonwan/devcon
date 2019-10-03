const express = require("express");
const router = express.Router();
const { check, validationResult } = require("express-validator/check");

// @route   POST api/users
// @desc    Register Users
// @access  Public (no token neede)
router.post(
    "/",
    [
        check("name", "Name is a Required field")
            .not()
            .isEmpty(),
        check("email", "please use a valid email").isEmail(),
        check(
            "password",
            "please enter a password of 6 or more characters"
        ).isLength({ min: 6 })
    ],
    (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        res.send("User route");
    }
);

module.exports = router;
