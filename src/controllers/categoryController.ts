import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Category, { ICategory } from '../models/Category';

const { Types } = mongoose;

// -----------------------------
// Type for Tree Node
// -----------------------------
export interface CategoryTree {
  _id: mongoose.Types.ObjectId;
  name: string;
  status: 'active' | 'inactive';
  children: CategoryTree[];
}

// -----------------------------
// Build Tree (Recursive)
// -----------------------------
async function buildTree(
  parentId: mongoose.Types.ObjectId | null = null
): Promise<CategoryTree[]> {
  const categories = await Category.find({ parent: parentId });

  const tree: CategoryTree[] = await Promise.all(
    categories.map(async (cat: ICategory) => ({
      _id: cat._id,
      name: cat.name,
      status: cat.status,
      children: await buildTree(cat._id),
    }))
  );

  return tree;
}

// -----------------------------
// Cascade Status
// -----------------------------
async function cascadeStatus(
  categoryId: mongoose.Types.ObjectId,
  status: 'active' | 'inactive'
): Promise<void> {
  await Category.updateMany({ parent: categoryId }, { status });

  const children = await Category.find({ parent: categoryId });
  for (const child of children) {
    await cascadeStatus(child._id, status);
  }
}

// -----------------------------
// Create Category
// -----------------------------
export async function createCategory(req: Request, res: Response) {
  try {
    const { name, parent, status } = req.body;

    let parentId: mongoose.Types.ObjectId | null = null;

    if (parent) {
      if (!Types.ObjectId.isValid(parent)) {
        return res.status(400).json({ message: 'Invalid parent category ID' });
      }

      parentId = new Types.ObjectId(parent);

      const parentCategory = await Category.findById(parentId);
      if (!parentCategory) {
        return res.status(400).json({ message: 'Parent category not found' });
      }
    }

    const category = new Category({
      name,
      parent: parentId,
      status: status || 'active',
    });

    await category.save();

    res.status(201).json(category);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}

// -----------------------------
// Get All Categories (Tree)
// -----------------------------
export async function getCategories(req: Request, res: Response) {
  try {
    const tree = await buildTree();
    res.json(tree);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}

// -----------------------------
// Update Category
// -----------------------------
export async function updateCategory(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { name, status } = req.body;

    if (!Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid category ID' });
    }

    const categoryId = new Types.ObjectId(id);
    const category = await Category.findById(categoryId);

    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    if (name) category.name = name;

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
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}

// -----------------------------
// Delete Category
// -----------------------------
export async function deleteCategory(req: Request, res: Response) {
  try {
    const { id } = req.params;

    if (!Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid category ID' });
    }

    const categoryId = new Types.ObjectId(id);

    const category = await Category.findById(categoryId);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    const parentId = category.parent || null;

    // Move children to parent
    await Category.updateMany({ parent: category._id }, { parent: parentId });

    await category.deleteOne();

    res.json({ message: 'Category deleted and subcategories reassigned' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}
