import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2, Edit2, Save, X, History } from 'lucide-react';
import rentalInventoryItemService from '../../services/rentalInventoryItemService';
import rentalProductService from '../../services/rentalProductService';
import accessoryService from '../../services/accessoryService';

const ManageRentalItems = () => {
    const { productId } = useParams();
    const navigate = useNavigate();
    const [product, setProduct] = useState(null);
    const [items, setItems] = useState([]);
    const [availableAccessories, setAvailableAccessories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    // Modal state for Add/Edit
    const [showModal, setShowModal] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [formData, setFormData] = useState({
        uniqueIdentifier: '',
        status: 'available',
        condition: 'good',
        purchaseDate: '',
        purchaseCost: '',
        batchNumber: '',
        notes: '',
        hourlyRent: '',
        dailyRent: '',
        monthlyRent: '',
        accessories: []
    });

    useEffect(() => {
        fetchData();
    }, [productId]);

    const fetchData = async () => {
        try {
            setLoading(true);
            // Fetch product details
            const productData = await rentalProductService.getRentalProductById(productId);
            setProduct(productData);

            // Fetch items
            const itemsData = await rentalInventoryItemService.getItemsByRentalProduct(productId);
            setItems(itemsData);

            // Fetch accessories
            const accessoriesData = await accessoryService.getAccessoriesByProduct(productId);
            setAvailableAccessories(accessoriesData);
        } catch (err) {
            setError('Failed to fetch data');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (item) => {
        setEditingItem(item);
        setFormData({
            uniqueIdentifier: item.uniqueIdentifier,
            status: item.status,
            condition: item.condition,
            purchaseDate: item.purchaseDate ? item.purchaseDate.split('T')[0] : '',
            purchaseCost: item.purchaseCost || '',
            batchNumber: item.batchNumber || '',
            notes: item.notes || '',
            hourlyRent: item.hourlyRent || '',
            dailyRent: item.dailyRent || '',
            monthlyRent: item.monthlyRent || '',
            accessories: item.accessories || []
        });
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this rental item?')) {
            try {
                await rentalInventoryItemService.deleteItem(id);
                setSuccess('Rental item deleted successfully');
                setTimeout(() => setSuccess(''), 3000);
                fetchData();
            } catch (err) {
                setError('Failed to delete rental item');
                setTimeout(() => setError(''), 3000);
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingItem) {
                await rentalInventoryItemService.updateItem(editingItem._id, formData);
                setSuccess('Rental item updated successfully');
            } else {
                await rentalInventoryItemService.addItem(productId, formData);
                setSuccess('Rental item added successfully');
            }
            setTimeout(() => setSuccess(''), 3000);
            setShowModal(false);
            resetForm();
            fetchData();
        } catch (err) {
            setError(err.message || 'Operation failed');
            setTimeout(() => setError(''), 3000);
        }
    };

    const resetForm = () => {
        setEditingItem(null);
        setFormData({
            uniqueIdentifier: '',
            status: 'available',
            condition: 'good',
            purchaseDate: '',
            purchaseCost: '',
            batchNumber: '',
            notes: '',
            hourlyRent: '',
            dailyRent: '',
            monthlyRent: '',
            accessories: []
        });
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'available': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
            case 'rented': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
            case 'maintenance': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
            case 'scrap': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
            case 'missing': return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    // Pagination calculations
    const totalItems = items.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentItems = items.slice(startIndex, endIndex);

    // Pagination handlers
    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
        }
    };

    const handleItemsPerPageChange = (newItemsPerPage) => {
        setItemsPerPage(newItemsPerPage);
        setCurrentPage(1); // Reset to first page when changing items per page
    };

    if (loading) return <div className="p-6 text-gray-900 dark:text-white">Loading...</div>;

    return (
        <div className="p-6 bg-gray-50 dark:bg-slate-900 min-h-screen">
            <button
                onClick={() => navigate('/rentals/products')}
                className="mb-4 flex items-center text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
            >
                <ArrowLeft className="w-4 h-4 mr-1" /> Back to Rental Products
            </button>

            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                        Manage Rental Items
                    </h1>
                    {product && (
                        <p className="text-gray-600 dark:text-gray-400 mt-1">
                            {product.name} - Total: {product.totalQuantity || 0} | Available: {product.availableQuantity || 0}
                        </p>
                    )}
                </div>
                <button
                    onClick={() => { resetForm(); setShowModal(true); }}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center"
                >
                    <Plus className="w-4 h-4 mr-2" /> Add Item
                </button>
            </div>

            {error && <div className="bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded mb-4">{error}</div>}
            {success && <div className="bg-green-100 dark:bg-green-900/30 border border-green-400 dark:border-green-800 text-green-700 dark:text-green-300 px-4 py-3 rounded mb-4">{success}</div>}

            {/* Pagination Controls - Top */}
            {totalItems > 0 && (
                <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-4 mb-4 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <label className="text-sm text-gray-700 dark:text-gray-300">Items per page:</label>
                        <select
                            value={itemsPerPage}
                            onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
                            className="p-2 border rounded dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                        >
                            <option value={10}>10</option>
                            <option value={25}>25</option>
                            <option value={50}>50</option>
                            <option value={100}>100</option>
                        </select>
                    </div>
                    <div className="text-sm text-gray-700 dark:text-gray-300">
                        Showing {startIndex + 1}-{Math.min(endIndex, totalItems)} of {totalItems}
                    </div>
                </div>
            )}

            <div className="bg-white dark:bg-slate-800 rounded-lg shadow overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-slate-700">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Unique ID</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Condition</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Purchase Date</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Purchase Cost</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {currentItems.length === 0 ? (
                            <tr>
                                <td colSpan="6" className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">No rental items found</td>
                            </tr>
                        ) : (
                            currentItems.map((item) => (
                                <tr key={item._id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{item.uniqueIdentifier}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(item.status)}`}>
                                            {item.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300 capitalize">{item.condition}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                                        {item.purchaseDate ? new Date(item.purchaseDate).toLocaleDateString() : 'N/A'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                                        ₹{item.purchaseCost || 0}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button onClick={() => handleEdit(item)} className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 mr-3">
                                            <Edit2 className="w-4 h-4" />
                                        </button>
                                        <button onClick={() => handleDelete(item._id)} className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination Controls - Bottom */}
            {totalPages > 1 && (
                <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-4 mt-4 flex justify-between items-center">
                    <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className={`px-4 py-2 rounded flex items-center gap-2 ${currentPage === 1
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-slate-700 dark:text-gray-600'
                            : 'bg-blue-600 text-white hover:bg-blue-700'
                            }`}
                    >
                        ← Previous
                    </button>
                    <div className="text-sm text-gray-700 dark:text-gray-300">
                        Page {currentPage} of {totalPages}
                    </div>
                    <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className={`px-4 py-2 rounded flex items-center gap-2 ${currentPage === totalPages
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-slate-700 dark:text-gray-600'
                            : 'bg-blue-600 text-white hover:bg-blue-700'
                            }`}
                    >
                        Next →
                    </button>
                </div>
            )}

            {/* Add/Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
                    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-2xl my-8 max-h-[90vh] flex flex-col">
                        <div className="flex justify-between items-center p-6 border-b dark:border-slate-700 flex-shrink-0">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                {editingItem ? 'Edit Rental Item' : 'Add New Rental Item'}
                            </h3>
                            <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-500">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
                            <div className="p-6 space-y-4 overflow-y-auto flex-1">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Unique Identifier {!editingItem && '*'}</label>
                                    <input
                                        type="text"
                                        required={!editingItem}
                                        value={formData.uniqueIdentifier}
                                        onChange={(e) => setFormData({ ...formData, uniqueIdentifier: e.target.value })}
                                        className="w-full p-2 border rounded dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                                        placeholder="Leave empty for auto-generation"
                                        disabled={editingItem}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
                                    <select
                                        value={formData.status}
                                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                        className="w-full p-2 border rounded dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                                    >
                                        <option value="available">Available</option>
                                        <option value="rented">Rented</option>
                                        <option value="maintenance">Maintenance</option>
                                        <option value="scrap">Scrap</option>
                                        <option value="missing">Missing</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Condition</label>
                                    <select
                                        value={formData.condition}
                                        onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
                                        className="w-full p-2 border rounded dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                                    >
                                        <option value="new">New</option>
                                        <option value="good">Good</option>
                                        <option value="fair">Fair</option>
                                        <option value="poor">Poor</option>
                                        <option value="damaged">Damaged</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Purchase Date</label>
                                    <input
                                        type="date"
                                        value={formData.purchaseDate}
                                        onChange={(e) => setFormData({ ...formData, purchaseDate: e.target.value })}
                                        className="w-full p-2 border rounded dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Purchase Cost (₹)</label>
                                    <input
                                        type="number"
                                        value={formData.purchaseCost}
                                        onChange={(e) => setFormData({ ...formData, purchaseCost: e.target.value })}
                                        className="w-full p-2 border rounded dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                                        min="0"
                                        step="0.01"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Batch Number</label>
                                    <input
                                        type="text"
                                        value={formData.batchNumber}
                                        onChange={(e) => setFormData({ ...formData, batchNumber: e.target.value })}
                                        className="w-full p-2 border rounded dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                                    />
                                </div>

                                {/* Rental Rates Section */}
                                <div className="border-t dark:border-slate-700 pt-4">
                                    <h4 className="font-medium text-gray-900 dark:text-white mb-3">Rental Rates</h4>
                                    <div className="grid grid-cols-3 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Hourly Rate (₹)</label>
                                            <input
                                                type="number"
                                                value={formData.hourlyRent}
                                                onChange={(e) => setFormData({ ...formData, hourlyRent: e.target.value })}
                                                className="w-full p-2 border rounded dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                                                min="0"
                                                step="0.01"
                                                placeholder="0.00"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Daily Rate (₹)</label>
                                            <input
                                                type="number"
                                                value={formData.dailyRent}
                                                onChange={(e) => setFormData({ ...formData, dailyRent: e.target.value })}
                                                className="w-full p-2 border rounded dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                                                min="0"
                                                step="0.01"
                                                placeholder="0.00"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Monthly Rate (₹)</label>
                                            <input
                                                type="number"
                                                value={formData.monthlyRent}
                                                onChange={(e) => setFormData({ ...formData, monthlyRent: e.target.value })}
                                                className="w-full p-2 border rounded dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                                                min="0"
                                                step="0.01"
                                                placeholder="0.00"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Notes</label>
                                    <textarea
                                        value={formData.notes}
                                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                        className="w-full p-2 border rounded dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                                        rows="2"
                                    />
                                </div>

                                {availableAccessories.length > 0 && (
                                    <div className="border-t dark:border-slate-700 pt-4">
                                        <h4 className="font-medium text-gray-900 dark:text-white mb-3">Accessories</h4>
                                        <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                                            {availableAccessories.map(acc => {
                                                const isSelected = formData.accessories.some(a => a.accessoryId === acc._id);
                                                const selectedAccessory = formData.accessories.find(a => a.accessoryId === acc._id) || {};

                                                return (
                                                    <div key={acc._id} className="p-3 bg-gray-50 dark:bg-slate-700/50 rounded-lg border dark:border-slate-600">
                                                        <div className="flex items-start gap-3">
                                                            <input
                                                                type="checkbox"
                                                                checked={isSelected}
                                                                onChange={(e) => {
                                                                    if (e.target.checked) {
                                                                        setFormData({
                                                                            ...formData,
                                                                            accessories: [...formData.accessories, {
                                                                                accessoryId: acc._id,
                                                                                name: acc.name,
                                                                                isIncluded: true,
                                                                                condition: 'good',
                                                                                status: 'with_item'
                                                                            }]
                                                                        });
                                                                    } else {
                                                                        setFormData({
                                                                            ...formData,
                                                                            accessories: formData.accessories.filter(a => a.accessoryId !== acc._id)
                                                                        });
                                                                    }
                                                                }}
                                                                className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                                            />
                                                            <div className="flex-1">
                                                                <div className="flex justify-between">
                                                                    <label className="font-medium text-gray-900 dark:text-white text-sm">
                                                                        {acc.name}
                                                                        {acc.isRequired && <span className="text-red-500 ml-1">*</span>}
                                                                    </label>
                                                                    <span className="text-xs text-gray-500 dark:text-gray-400">₹{acc.replacementCost}</span>
                                                                </div>

                                                                {isSelected && (
                                                                    <div className="mt-2 grid grid-cols-2 gap-2">
                                                                        <input
                                                                            type="text"
                                                                            placeholder="Serial Number"
                                                                            value={selectedAccessory.serialNumber || ''}
                                                                            onChange={(e) => {
                                                                                const newAccessories = formData.accessories.map(a =>
                                                                                    a.accessoryId === acc._id ? { ...a, serialNumber: e.target.value } : a
                                                                                );
                                                                                setFormData({ ...formData, accessories: newAccessories });
                                                                            }}
                                                                            className="text-xs p-1 border rounded dark:bg-slate-800 dark:border-slate-600 dark:text-white"
                                                                        />
                                                                        <select
                                                                            value={selectedAccessory.condition || 'good'}
                                                                            onChange={(e) => {
                                                                                const newAccessories = formData.accessories.map(a =>
                                                                                    a.accessoryId === acc._id ? { ...a, condition: e.target.value } : a
                                                                                );
                                                                                setFormData({ ...formData, accessories: newAccessories });
                                                                            }}
                                                                            className="text-xs p-1 border rounded dark:bg-slate-800 dark:border-slate-600 dark:text-white"
                                                                        >
                                                                            <option value="new">New</option>
                                                                            <option value="good">Good</option>
                                                                            <option value="fair">Fair</option>
                                                                            <option value="poor">Poor</option>
                                                                        </select>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}
                            </div>
                            <div className="flex justify-end gap-3 p-6 border-t dark:border-slate-700 bg-gray-50 dark:bg-slate-800/50 flex-shrink-0">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded hover:bg-gray-200 dark:bg-slate-700 dark:text-gray-300 dark:hover:bg-slate-600"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 text-white bg-blue-600 rounded hover:bg-blue-700 flex items-center"
                                >
                                    <Save className="w-4 h-4 mr-2" /> Save
                                </button>
                            </div>
                        </form>
                    </div >
                </div >
            )}
        </div >
    );
};

export default ManageRentalItems;
