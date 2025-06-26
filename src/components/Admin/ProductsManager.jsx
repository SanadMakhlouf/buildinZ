import React, { useState } from 'react';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Button, TextField, Dialog, DialogActions, DialogContent,
  DialogTitle, IconButton, FormControl, InputLabel, Select, MenuItem
} from '@mui/material';
import { Add, Edit, Delete } from '@mui/icons-material';
import dataService from '../../services/dataService';
import './AdminStyles.css';

const ProductsManager = ({ products, categories, units, onDataChange }) => {
  const [openDialog, setOpenDialog] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(null);
  const [form, setForm] = useState({
    name: '',
    description: '',
    price: 0,
    currency: 'SAR',
    category_id: '',
    image_url: '',
    unit: '',
    coverage: 1
  });

  // Dialog Handlers
  const handleOpenDialog = (product = null) => {
    if (product) {
      setForm({
        name: product.name,
        description: product.description,
        price: product.price,
        currency: product.currency,
        category_id: product.category_id,
        image_url: product.image_url || '',
        unit: product.unit || '',
        coverage: product.coverage || 1
      });
      setCurrentProduct(product);
    } else {
      setForm({
        name: '',
        description: '',
        price: 0,
        currency: 'SAR',
        category_id: categories.length > 0 ? categories[0].id : '',
        image_url: '',
        unit: '',
        coverage: 1
      });
      setCurrentProduct(null);
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleSaveProduct = () => {
    if (currentProduct) {
      // Update existing product
      dataService.updateProduct(currentProduct.id, form);
    } else {
      // Create new product
      dataService.createProduct(form);
    }
    handleCloseDialog();
    onDataChange();
  };

  const handleDeleteProduct = (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      dataService.deleteProduct(productId);
      onDataChange();
    }
  };

  return (
    <div className="products-manager">
      <div className="section-header">
        <h2>Products</h2>
        <Button 
          variant="contained" 
          color="primary" 
          startIcon={<Add />}
          onClick={() => handleOpenDialog()}
        >
          Add Product
        </Button>
      </div>

      {/* Products List */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Price</TableCell>
              <TableCell>Category</TableCell>
              <TableCell>Unit</TableCell>
              <TableCell>Coverage</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {products.map(product => (
              <TableRow key={product.id}>
                <TableCell>{product.id}</TableCell>
                <TableCell>{product.name}</TableCell>
                <TableCell>{product.description}</TableCell>
                <TableCell>{product.price} {product.currency}</TableCell>
                <TableCell>
                  {categories.find(c => c.id === product.category_id)?.name || 'Unknown'}
                </TableCell>
                <TableCell>{product.unit}</TableCell>
                <TableCell>{product.coverage}</TableCell>
                <TableCell>
                  <IconButton 
                    size="small" 
                    onClick={() => handleOpenDialog(product)}
                  >
                    <Edit fontSize="small" />
                  </IconButton>
                  <IconButton 
                    size="small" 
                    onClick={() => handleDeleteProduct(product.id)}
                  >
                    <Delete fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Product Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>{currentProduct ? 'Edit Product' : 'Add Product'}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Product Name"
            fullWidth
            value={form.name}
            onChange={(e) => setForm({...form, name: e.target.value})}
          />
          <TextField
            margin="dense"
            label="Description"
            fullWidth
            multiline
            rows={2}
            value={form.description}
            onChange={(e) => setForm({...form, description: e.target.value})}
          />
          <div className="form-row">
            <TextField
              margin="dense"
              label="Price"
              type="number"
              value={form.price}
              onChange={(e) => setForm({...form, price: parseFloat(e.target.value) || 0})}
              sx={{ mr: 2 }}
            />
            <TextField
              margin="dense"
              label="Currency"
              value={form.currency}
              onChange={(e) => setForm({...form, currency: e.target.value})}
            />
          </div>
          <FormControl fullWidth margin="dense">
            <InputLabel>Category</InputLabel>
            <Select
              value={form.category_id}
              onChange={(e) => setForm({...form, category_id: e.target.value})}
              label="Category"
            >
              {categories.map(category => (
                <MenuItem key={category.id} value={category.id}>
                  {category.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <div className="form-row">
            <FormControl sx={{ minWidth: 150, mr: 2 }}>
              <InputLabel>Unit</InputLabel>
              <Select
                value={form.unit}
                onChange={(e) => setForm({...form, unit: e.target.value})}
                label="Unit"
              >
                <MenuItem value="">
                  <em>None</em>
                </MenuItem>
                {units.map(unit => (
                  <MenuItem key={unit.id} value={unit.name}>
                    {unit.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              margin="dense"
              label="Coverage"
              type="number"
              value={form.coverage}
              onChange={(e) => setForm({...form, coverage: parseFloat(e.target.value) || 1})}
              helperText="Area covered by one unit"
            />
          </div>
          <TextField
            margin="dense"
            label="Image URL"
            fullWidth
            value={form.image_url}
            onChange={(e) => setForm({...form, image_url: e.target.value})}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSaveProduct} color="primary">Save</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default ProductsManager; 