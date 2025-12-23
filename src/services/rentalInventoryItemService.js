import instance from './instance';

const rentalInventoryItemService = {
    // Get items by rental product ID
    getItemsByRentalProduct: async (rentalProductId) => {
        try {
            const response = await instance.get(`/rental-inventory-items/rental-product/${rentalProductId}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Failed to fetch rental inventory items' };
        }
    },

    // Get all items
    getAllItems: async () => {
        try {
            const response = await instance.get('/rental-inventory-items');
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Failed to fetch all inventory items' };
        }
    },

    // Add a new item
    addItem: async (rentalProductId, itemData) => {
        try {
            const response = await instance.post(`/rental-inventory-items/rental-product/${rentalProductId}`, itemData);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Failed to add rental item' };
        }
    },

    // Update item
    updateItem: async (id, itemData) => {
        try {
            const response = await instance.put(`/rental-inventory-items/${id}`, itemData);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Failed to update rental item' };
        }
    },

    // Delete item
    deleteItem: async (id) => {
        try {
            const response = await instance.delete(`/rental-inventory-items/${id}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Failed to delete rental item' };
        }
    },

    // Get item history
    getItemHistory: async (id) => {
        try {
            const response = await instance.get(`/rental-inventory-items/${id}/history`);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Failed to fetch item history' };
        }
    }
};

export default rentalInventoryItemService;
