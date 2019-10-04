const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const User = require('../../models/Users');
const { check, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const config = require('config');

// @route   GET api/auth
// @desc    Test route
// @access  Public (no token neede)
router.get('/', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        res.json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   POST api/auth
// @desc    Authenticate user and get token
// @access  Public (no token neede)
router.post(
    '/',
    [
        check('email', 'please use a valid email').isEmail(),
        check('password', 'password is required').exists()
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const { email, password } = req.body; // destructure

        // because async/await => we need try/catch
        try {
            // check if user exists
            let user = await User.findOne({ email });

            if (!user) {
                return res.status(400).json({
                    errors: [{ msg: 'Invalid Credentials' }]
                });
            }
            // user found... now need to see if the password matches
            const isMatch = await bcrypt.compare(password, user.password);

            if (!isMatch) {
                return res.status(400).json({
                    // using same message as above for security issues.
                    // dont want people to know exactly what went wrong.
                    errors: [{ msg: 'Invalid Credentials' }]
                });
            }

            // return JWT
            const payload = {
                user: {
                    id: user.id //note: mongoose abstracts mongos _id to id
                }
            };

            jwt.sign(
                payload,
                config.get('jwtSecret'),
                { expiresIn: 360000 }, // change back to 3600 in production
                (err, token) => {
                    if (err) throw err;
                    res.json({ token }); //give 200 response by default if not specified with .status
                }
            );
        } catch (err) {
            console.error(err.message);
            res.status(500).send('Server Error');
        }
    }
);

module.exports = router;
