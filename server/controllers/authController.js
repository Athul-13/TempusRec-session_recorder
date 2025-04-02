const User = require("../models/User");
const {generateAccessToken} = require('../utils/tokenUtils')

exports.register = async (req, res) => {
    try {
        const { fullName, email, password, tel } = req.body;

        if (!fullName) {
            return res.status(400).json({ message: "Name is required" });
        }

        if (!email) {
            return res.status(400).json({ message: "Email is required" });
        }

        if (!password) {
            return res.status(400).json({ message: "Password is required" });
        }

        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }

        const user = new User({
            fullName,
            email,
            password,
            phoneNo: tel,
            profilePicture: null,
            role: "user",
        });

        await user.save();

        res.status(201).json({
            success: true,
            user: {
                id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                phoneNo: user.phoneNo,
                profilePicture: user.profilePicture,
                role: user.role,
                createdAt: user.createdAt,
            },
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

exports.login = async(req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({email});

        // If user is not found, return an error response
        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        if (user.status === 'inactive') {
            return res.status(403).json({
                message: 'User has been blocked from logging in',
                showToast: true, 
            });
        }

        if(!user || !(await user.matchPassword(password))) {
            return res.status(401).json({message: 'Invalid email or password'});
        }

        const accessToken = generateAccessToken(user._id, user.role);

        res.cookie('token', accessToken, {
            httpOnly: true,
            secure: true, 
            sameSite: 'none', 
            maxAge: 24 * 60 * 60 * 1000 // 1 day
        });

        res.json({
            _id: user._id,
            fullName: user.fullName,
            profilePicture: user.profilePicture,
            phoneNo: user.phoneNo,
            email: user.email,
            role: user.role,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({message: err.message});
    }
}

exports.logout = async (req, res) => {
    try {   
        res.clearCookie('token', {
            httpOnly: true,
            secure: true,
            sameSite: 'None',
            path: '/',
        });

        res.json({ message: 'Logout successful' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};