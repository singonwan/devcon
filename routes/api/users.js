const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');
const User = require('../../models/Users');

// @route   POST api/users
// @desc    Register Users
// @access  Public (no token neede)
router.post(
    '/',
    [
        check('name', 'Name is a Required field')
            .not()
            .isEmpty(),
        check('email', 'please use a valid email').isEmail(),
        check(
            'password',
            'please enter a password of 6 or more characters'
        ).isLength({ min: 6 })
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const { name, email, password } = req.body; // destructure

        //because async/await => we need try/catch
        try {
            // check if user exists
            let user = await User.findOne({ email });

            if (user) {
                return res.status(400).json({
                    errors: [{ msg: 'User already exists' }]
                });
            }
            // get users gravatar
            const avatar = gravatar.url(email, {
                s: '200',
                r: 'pg',
                d: 'mm'
            });

            user = new User({
                name,
                email,
                avatar,
                password
            });
            // encrypt password
            // note: everything that returns a promise, just put await before it.
            // if we didnt use async/await we would have to use .then after every async call and it would look messy.
            // ie .then inside .then inside .then
            const salt = await bcrypt.genSalt(10);

            user.password = await bcrypt.hash(password, salt);

            await user.save();
            // return JWT
            res.send('User Registered');
        } catch (err) {
            console.error(err.message);
            res.status(500).send('Server Error');
        }
    }
);

module.exports = router;
