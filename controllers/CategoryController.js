const categoryService = require('../services/CategoryService');

class CategoryController {
    async createCategory(req, res) {
        try {
            const category = await categoryService.createCategory(req.body, req.user.id);
            res.status(201).json(category);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    async getAllCategories(req, res) {
        try {
            const includeDeleted = req.query.includeDeleted === 'true' && req.user?.role === 'ADMIN';
            const categories = await categoryService.getAllCategories(includeDeleted);
            res.json(categories);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async getCategoryById(req, res) {
        try {
            const category = await categoryService.getCategoryById(req.params.id);
            res.json(category);
        } catch (error) {
            if (error.message === 'Category not found') {
                res.status(404).json({ error: error.message });
            } else {
                res.status(500).json({ error: error.message });
            }
        }
    }

    async updateCategory(req, res) {
        try {
            const category = await categoryService.updateCategory(req.params.id, req.body);
            res.json(category);
        } catch (error) {
            if (error.message === 'Category not found') {
                res.status(404).json({ error: error.message });
            } else {
                res.status(400).json({ error: error.message });
            }
        }
    }

    async deleteCategory(req, res) {
        try {
            await categoryService.deleteCategory(req.params.id);
            res.status(204).send();
        } catch (error) {
            if (error.message === 'Category not found') {
                res.status(404).json({ error: error.message });
            } else {
                res.status(500).json({ error: error.message });
            }
        }
    }
}

module.exports = new CategoryController(); 