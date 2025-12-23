import React, { useState, useEffect } from 'react';
import ProductSelector from './ProductSelector';

const PurchaseForm = ({
  purchase,
  suppliers,
  products,
  onSubmit,
  onCancel,
  isEditMode,
  isLoading
}) => {
  const [formData, setFormData] = useState({
    supplier: '',
    supplierInvoiceNumber: '',
    items: [{ product: '', quantity: 0, unitCost: 0 }],
    expectedDeliveryDate: '',
    notes: ''
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (purchase) {
      setFormData({
        supplier: purchase.supplier?._id || '',
        supplierInvoiceNumber: purchase.supplierInvoiceNumber || '',
        items: purchase.items?.map(item => ({
          product: item.product._id,
          quantity: item.quantity || 0,
          unitCost: item.unitCost || 0
        })) || [{ product: '', quantity: 0, unitCost: 0 }],
        expectedDeliveryDate: purchase.expectedDeliveryDate ? purchase.expectedDeliveryDate.split('T')[0] : '',
        notes: purchase.notes || ''
      });
    }
  }, [purchase]);

  // Debug: Log products received as props
  useEffect(() => {
    console.log('🔧 PurchaseForm received products:', products);
    console.log('🔧 PurchaseForm products type:', Array.isArray(products) ? 'Array' : typeof products);
    console.log('🔧 PurchaseForm products length:', Array.isArray(products) ? products.length : 'N/A');
  }, [products]);

  const addItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { product: '', quantity: 0, unitCost: 0 }]
    });
  };

  const removeItem = (index) => {
    if (formData.items.length > 1) {
      const newItems = formData.items.filter((_, i) => i !== index);
      setFormData({ ...formData, items: newItems });
    }
  };

  const updateItem = (index, field, value) => {
    const newItems = formData.items.map((item, i) =>
      i === index ? { ...item, [field]: value } : item
    );
    setFormData({ ...formData, items: newItems });
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.supplier) {
      newErrors.supplier = 'Supplier is required';
    }

    formData.items.forEach((item, index) => {
      if (!item.product || item.product.trim() === '') {
        newErrors[`item_${index}_product`] = 'Product is required';
      }
      if (!item.quantity || item.quantity <= 0) {
        newErrors[`item_${index}_quantity`] = 'Quantity must be greater than 0';
      }
      if (!item.unitCost || item.unitCost < 0) {
        newErrors[`item_${index}_unitCost`] = 'Unit cost must be 0 or greater';
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const calculateItemTotal = (item) => {
    return item.quantity * item.unitCost;
  };

  const calculateGrandTotal = () => {
    return formData.items.reduce((total, item) => total + calculateItemTotal(item), 0);
  };

  const handleProductChange = (index, productValue) => {
    updateItem(index, 'product', productValue);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="bg-gray-100 shadow-md rounded-lg p-6">
      <h2 className="text-xl font-bold mb-6">
        {isEditMode ? 'Edit Purchase Order' : 'Create New Purchase Order'}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Supplier *
            </label>
            <select
              value={formData.supplier}
              onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-ring ${errors.supplier ? 'border-red-500' : 'border-gray-300'
                }`}
            >
              <option value="">Select Supplier</option>
              {Array.isArray(suppliers) && suppliers.length > 0 ? (
                suppliers.map((supplier) => (
                  <option key={supplier._id} value={supplier._id}>
                    {supplier.name}
                  </option>
                ))
              ) : (
                <option value="" disabled>
                  {suppliers.length === 0 ? 'No suppliers available' : 'Loading suppliers...'}
                </option>
              )}
            </select>
            {errors.supplier && <p className="text-red-500 text-sm mt-1">{errors.supplier}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Expected Delivery Date
            </label>
            <input
              type="date"
              value={formData.expectedDeliveryDate}
              onChange={(e) => setFormData({ ...formData, expectedDeliveryDate: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        </div>

        {/* Supplier Invoice Number */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Supplier Invoice Number
          </label>
          <input
            type="text"
            value={formData.supplierInvoiceNumber}
            onChange={(e) => setFormData({ ...formData, supplierInvoiceNumber: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
            placeholder="Enter invoice number if available"
          />
        </div>

        {/* Items */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">Items</h3>
            <button
              type="button"
              onClick={addItem}
              className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
            >
              Add Item
            </button>
          </div>

          <div className="space-y-4">
            {formData.items.map((item, index) => (
              <div key={index} className="border border-gray-300 rounded-lg p-4">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="font-medium">Item {index + 1}</h4>
                  {formData.items.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeItem(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      Remove
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Product *
                    </label>
                    <ProductSelector
                      products={products}
                      value={item.product}
                      onChange={(productValue) => handleProductChange(index, productValue)}
                      placeholder="Type to search products or enter new product name"
                      error={errors[`item_${index}_product`]}
                      supplierId={formData.supplier}
                      showAddNew={true}
                    />
                    {errors[`item_${index}_product`] && (
                      <p className="text-red-500 text-sm mt-1">{errors[`item_${index}_product`]}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Quantity *
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={item.quantity}
                      onChange={(e) => updateItem(index, 'quantity', parseFloat(e.target.value) || 0)}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-ring ${errors[`item_${index}_quantity`] ? 'border-red-500' : 'border-gray-300'
                        }`}
                    />
                    {errors[`item_${index}_quantity`] && (
                      <p className="text-red-500 text-sm mt-1">{errors[`item_${index}_quantity`]}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Unit Cost *
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={item.unitCost}
                      onChange={(e) => updateItem(index, 'unitCost', parseFloat(e.target.value) || 0)}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-ring ${errors[`item_${index}_unitCost`] ? 'border-red-500' : 'border-gray-300'
                        }`}
                    />
                    {errors[`item_${index}_unitCost`] && (
                      <p className="text-red-500 text-sm mt-1">{errors[`item_${index}_unitCost`]}</p>
                    )}
                  </div>
                </div>

                <div className="mt-2 text-sm text-gray-600">
                  Total: ₹{calculateItemTotal(item).toFixed(2)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Notes
          </label>
          <textarea
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
            placeholder="Enter any additional notes..."
          />
        </div>

        {/* Summary */}
        <div className="bg-gray-200 p-4 rounded-lg">
          <h3 className="text-lg font-medium mb-2">Summary</h3>
          <div className="text-xl font-bold">
            Grand Total: ₹{calculateGrandTotal().toFixed(2)}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <button
            type="submit"
            className="px-6 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 shadow-sm transition-colors"
          >
            {isEditMode ? 'Update Purchase Order' : 'Create Purchase Order'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2 bg-muted text-muted-foreground rounded-md hover:bg-muted/80 transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default PurchaseForm;
