const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');

const Profile = require('../../models/Profile');
const User = require('../../models/Users');

// @route   GET api/profile/me
// @desc    get current user's profile
// @access  Private(token needed)
router.get('/me', auth, async (req, res) => {
    try {
        const profile = await Profile.findOne({ user: req.user.id }).populate(
            //set profile model user object to req.user.id
            'user',
            ['name', 'avatar']
        );
        if (!profile) {
            return res
                .status(400)
                .json({ msg: 'there is no profile for this user' });
        }
        //if there is a profile
        res.json(profile);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
