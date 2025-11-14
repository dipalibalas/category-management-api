"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCategory = createCategory;
exports.getCategories = getCategories;
exports.updateCategory = updateCategory;
exports.deleteCategory = deleteCategory;
const mongoose_1 = __importDefault(require("mongoose"));
const Category_1 = __importDefault(require("../models/Category"));
const { Types } = mongoose_1.default;
// -----------------------------
// Build Tree (Recursive)
// -----------------------------
async function buildTree(parentId = null) {
    const categories = await Category_1.default.find({ parent: parentId });
    const tree = await Promise.all(categories.map(async (cat) => ({
        _id: cat._id,
        name: cat.name,
        status: cat.status,
        children: await buildTree(cat._id),
    })));
    return tree;
}
// -----------------------------
// Cascade Status
// -----------------------------
async function cascadeStatus(categoryId, status) {
    await Category_1.default.updateMany({ parent: categoryId }, { status });
    const children = await Category_1.default.find({ parent: categoryId });
    for (const child of children) {
        await cascadeStatus(child._id, status);
    }
}
// -----------------------------
// Create Category
// -----------------------------
async function createCategory(req, res) {
    try {
        const { name, parent, status } = req.body;
        let parentId = null;
        if (parent) {
            if (!Types.ObjectId.isValid(parent)) {
                return res.status(400).json({ message: 'Invalid parent category ID' });
            }
            parentId = new Types.ObjectId(parent);
            const parentCategory = await Category_1.default.findById(parentId);
            if (!parentCategory) {
                return res.status(400).json({ message: 'Parent category not found' });
            }
        }
        const category = new Category_1.default({
            name,
            parent: parentId,
            status: status || 'active',
        });
        await category.save();
        res.status(201).json(category);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
}
// -----------------------------
// Get All Categories (Tree)
// -----------------------------
async function getCategories(req, res) {
    try {
        const tree = await buildTree();
        res.json(tree);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
}
// -----------------------------
// Update Category
// -----------------------------
async function updateCategory(req, res) {
    try {
        const { id } = req.params;
        const { name, status } = req.body;
        if (!Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'Invalid category ID' });
        }
        const categoryId = new Types.ObjectId(id);
        const category = await Category_1.default.findById(categoryId);
        if (!category) {
            return res.status(404).json({ message: 'Category not found' });
        }
        if (name)
            category.name = name;
        if (status) {
            if (!['active', 'inactive'].includes(status)) {
                return res.status(400).json({ message: 'Invalid status value' });
            }
            category.status = status;
            if (status === 'inactive') {
                await cascadeStatus(category._id, 'inactive');
            }
        }
        await category.save();
        res.json(category);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
}
// -----------------------------
// Delete Category
// -----------------------------
async function deleteCategory(req, res) {
    try {
        const { id } = req.params;
        if (!Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'Invalid category ID' });
        }
        const categoryId = new Types.ObjectId(id);
        const category = await Category_1.default.findById(categoryId);
        if (!category) {
            return res.status(404).json({ message: 'Category not found' });
        }
        const parentId = category.parent || null;
        // Move children to parent
        await Category_1.default.updateMany({ parent: category._id }, { parent: parentId });
        await category.deleteOne();
        res.json({ message: 'Category deleted and subcategories reassigned' });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
}
