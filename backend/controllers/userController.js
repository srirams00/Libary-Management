const User = require('../models/User');

// @desc    Get all users
// @route   GET /api/users
// @access  Admin
const getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select('-password').sort({ createdAt: -1 });
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Add new user
// @route   POST /api/users
// @access  Admin
const addUser = async (req, res) => {
    try {
        const { username, password, role } = req.body;

        if (!username || !password) {
            return res
                .status(400)
                .json({ message: 'Username and password are required' });
        }

        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ message: 'Username already exists' });
        }

        const user = await User.create({
            username,
            password,
            role: role || 'user',
            status: 'active',
        });

        res.status(201).json({
            _id: user._id,
            username: user.username,
            role: user.role,
            status: user.status,
            createdAt: user.createdAt,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Block or unblock user
// @route   PUT /api/users/block/:id
// @access  Admin
const toggleBlockUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (user.role === 'admin') {
            return res.status(400).json({ message: 'Cannot block an admin user' });
        }

        user.status = user.status === 'active' ? 'blocked' : 'active';
        await user.save();

        res.json({
            _id: user._id,
            username: user.username,
            role: user.role,
            status: user.status,
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Admin
const deleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (user.role === 'admin') {
            return res.status(400).json({ message: 'Cannot delete an admin user' });
        }

        await User.findByIdAndDelete(req.params.id);
        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = { getAllUsers, addUser, toggleBlockUser, deleteUser };
