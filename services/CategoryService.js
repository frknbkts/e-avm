const categoryRepository = require('../repositories/CategoryRepository');

class CategoryService {
    async createCategory(data, userId) {
        try {
            // Aynı isimde kategori var mı kontrol et
            const existingCategory = await categoryRepository.findByName(data.name);
            if (existingCategory) {
                throw new Error('Bu isimde bir kategori zaten mevcut');
            }

            // Üst kategori varsa kontrol et
            if (data.parentId) {
                const parentCategory = await categoryRepository.findById(data.parentId);
                if (!parentCategory) {
                    throw new Error('Üst kategori bulunamadı');
                }
            }

            return await categoryRepository.create(data);
        } catch (error) {
            throw new Error(`Error creating category: ${error.message}`);
        }
    }

    async getAllCategories(includeDeleted = false) {
        try {
            const categories = await categoryRepository.findAll(includeDeleted);
            return this.buildCategoryTree(categories);
        } catch (error) {
            throw new Error(`Error fetching categories: ${error.message}`);
        }
    }

    async getCategoryById(id) {
        try {
            const category = await categoryRepository.findById(parseInt(id));
            if (!category) {
                throw new Error('Category not found');
            }
            return category;
        } catch (error) {
            throw new Error(`Error fetching category: ${error.message}`);
        }
    }

    async updateCategory(id, data) {
        try {
            const category = await categoryRepository.findById(parseInt(id));
            if (!category) {
                throw new Error('Category not found');
            }

            // İsim değişiyorsa, yeni isimde başka kategori var mı kontrol et
            if (data.name && data.name !== category.name) {
                const existingCategory = await categoryRepository.findByName(data.name);
                if (existingCategory) {
                    throw new Error('Bu isimde bir kategori zaten mevcut');
                }
            }

            // Üst kategori değişiyorsa kontrol et
            if (data.parentId && data.parentId !== category.parentId) {
                // Kendisini veya kendi alt kategorisini üst kategori yapamaz
                if (data.parentId === id) {
                    throw new Error('Kategori kendisini üst kategori olarak alamaz');
                }

                const children = await this.getAllSubcategories(parseInt(id));
                if (children.some(child => child.id === data.parentId)) {
                    throw new Error('Alt kategori, üst kategori olarak atanamaz');
                }

                const parentCategory = await categoryRepository.findById(data.parentId);
                if (!parentCategory) {
                    throw new Error('Üst kategori bulunamadı');
                }
            }

            return await categoryRepository.update(parseInt(id), data);
        } catch (error) {
            throw new Error(`Error updating category: ${error.message}`);
        }
    }

    async deleteCategory(id) {
        try {
            const category = await categoryRepository.findById(parseInt(id));
            if (!category) {
                throw new Error('Category not found');
            }

            // Alt kategorileri de sil
            const children = await this.getAllSubcategories(parseInt(id));
            for (const child of children) {
                await categoryRepository.delete(child.id);
            }

            return await categoryRepository.delete(parseInt(id));
        } catch (error) {
            throw new Error(`Error deleting category: ${error.message}`);
        }
    }

    // Yardımcı metodlar
    async getAllSubcategories(categoryId) {
        const result = [];
        const children = await categoryRepository.findChildren(categoryId);
        
        for (const child of children) {
            result.push(child);
            const grandChildren = await this.getAllSubcategories(child.id);
            result.push(...grandChildren);
        }

        return result;
    }

    buildCategoryTree(categories) {
        const categoryMap = new Map();
        const roots = [];

        // Önce tüm kategorileri map'e ekle
        categories.forEach(category => {
            categoryMap.set(category.id, { ...category, children: [] });
        });

        // Sonra parent-child ilişkilerini kur
        categories.forEach(category => {
            if (category.parentId) {
                const parent = categoryMap.get(category.parentId);
                if (parent) {
                    parent.children.push(categoryMap.get(category.id));
                }
            } else {
                roots.push(categoryMap.get(category.id));
            }
        });

        return roots;
    }
}

module.exports = new CategoryService(); 