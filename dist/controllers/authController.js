"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.register = register;
exports.login = login;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = __importDefault(require("../models/User"));
async function register(req, res) {
    const { name, email, password } = req.body;
    try {
        const existing = await User_1.default.findOne({ email });
        if (existing)
            return res.status(400).json({ message: 'User already exists' });
        const hashed = await bcryptjs_1.default.hash(password, 10);
        const user = new User_1.default({ name, email, password: hashed });
        await user.save();
        res.status(201).json({ message: 'User registered successfully' });
    }
    catch (e) {
        res.status(500).json({ message: e.message });
    }
}
async function login(req, res) {
    const { email, password } = req.body;
    try {
        const user = await User_1.default.findOne({ email });
        if (!user)
            return res.status(400).json({ message: 'Invalid credentials' });
        const isValid = await bcryptjs_1.default.compare(password, user.password);
        if (!isValid)
            return res.status(400).json({ message: 'Invalid credentials' });
        const token = jsonwebtoken_1.default.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.json({ token });
    }
    catch (e) {
        res.status(500).json({ message: e.message });
    }
}
