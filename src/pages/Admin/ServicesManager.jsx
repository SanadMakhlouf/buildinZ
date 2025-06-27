import React, { useState } from 'react';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Button, TextField, Dialog, DialogActions, DialogContent,
  DialogTitle, IconButton, FormControl, InputLabel, Select, MenuItem,
  FormHelperText, Checkbox, ListItemText, OutlinedInput
} from '@mui/material';
import { Add, Edit, Delete } from '@mui/icons-material';
import dataService from '../../services/dataService';
import './AdminStyles.css';

const ServicesManager = ({ categories, generators, onDataChange }) => {
  const [openDialog, setOpenDialog] = useState(false);
  const [currentService, setCurrentService] = useState(null);
  const [currentCategoryId, setCurrentCategoryId] = useState(null);
  const [currentSubcategoryId, setCurrentSubcategoryId] = useState(null);
  const [form, setForm] = useState({
    name: '',
    description: '',
    price_unit: 0,
    currency: 'SAR',
    foreign_key_generator: '',
    product_ids: []
  });
  
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSubcategory, setSelectedSubcategory] = useState('');
  const [availableSubcategories, setAvailableSubcategories] = useState([]);
  const products = dataService.getProducts();

  // Handle category selection change
  const handleCategoryChange = (categoryId) => {
    setSelectedCategory(categoryId);
    const category = categories.find(c => c.id === categoryId);
    setAvailableSubcategories(category ? category.subcategories : []);
    setSelectedSubcategory('');
  };

  // Dialog Handlers
  const handleOpenDialog = (categoryId = null, subcategoryId = null, service = null) => {
    if (service) {
      setForm({
        name: service.name,
        description: service.description,
        price_unit: service.price_unit,
        currency: service.currency,
        foreign_key_generator: service.foreign_key_generator,
        product_ids: service.product_ids || []
      });
      setCurrentService(service);
      setCurrentCategoryId(categoryId);
      setCurrentSubcategoryId(subcategoryId);
    } else {
      setForm({
        name: '',
        description: '',
        price_unit: 0,
        currency: 'SAR',
        foreign_key_generator: generators.length > 0 ? generators[0].id : '',
        product_ids: []
      });
      setCurrentService(null);
      setCurrentCategoryId(categoryId);
      setCurrentSubcategoryId(subcategoryId);
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleSaveService = () => {
    if (currentService) {
      // Update existing service
      dataService.updateService(currentCategoryId, currentSubcategoryId, currentService.id, form);
    } else {
      // Create new service
      dataService.createService(currentCategoryId, currentSubcategoryId, form);
    }
    handleCloseDialog();
    onDataChange();
  };

  const handleDeleteService = (categoryId, subcategoryId, serviceId) => {
    if (window.confirm('Are you sure you want to delete this service?')) {
      dataService.deleteService(categoryId, subcategoryId, serviceId);
      onDataChange();
    }
  };

  // Handle product selection change
  const handleProductChange = (event) => {
    const {
      target: { value },
    } = event;
    setForm({
      ...form,
      product_ids: typeof value === 'string' ? value.split(',').map(Number) : value
    });
  };

  // Render all services from all categories and subcategories
  const renderAllServices = () => {
    const allServices = [];
    
    categories.forEach(category => {
      category.subcategories.forEach(subcategory => {
        subcategory.services.forEach(service => {
          allServices.push({
            service,
            categoryId: category.id,
            categoryName: category.name,
            subcategoryId: subcategory.id,
            subcategoryName: subcategory.name
          });
        });
      });
    });
    
    return (
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Category</TableCell>
              <TableCell>Subcategory</TableCell>
              <TableCell>Price Unit</TableCell>
              <TableCell>Generator</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {allServices.map(({ service, categoryId, categoryName, subcategoryId, subcategoryName }) => (
              <TableRow key={`${categoryId}-${subcategoryId}-${service.id}`}>
                <TableCell>{service.id}</TableCell>
                <TableCell>{service.name}</TableCell>
                <TableCell>{categoryName}</TableCell>
                <TableCell>{subcategoryName}</TableCell>
                <TableCell>{service.price_unit} {service.currency}</TableCell>
                <TableCell>
                  {generators.find(g => g.id === service.foreign_key_generator)?.name || 'Unknown'}
                </TableCell>
                <TableCell>
                  <IconButton 
                    size="small" 
                    onClick={() => handleOpenDialog(categoryId, subcategoryId, service)}
                  >
                    <Edit fontSize="small" />
                  </IconButton>
                  <IconButton 
                    size="small" 
                    onClick={() => handleDeleteService(categoryId, subcategoryId, service.id)}
                  >
                    <Delete fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };

  // Render services for a specific subcategory
  const renderSubcategoryServices = (categoryId, subcategoryId) => {
    const category = categories.find(c => c.id === categoryId);
    if (!category) return null;
    
    const subcategory = category.subcategories.find(s => s.id === subcategoryId);
    if (!subcategory) return null;
    
    return (
      <div>
        <div className="section-header">
          <h3>{category.name} &gt; {subcategory.name}</h3>
          <Button 
            variant="contained" 
            color="primary" 
            startIcon={<Add />}
            onClick={() => handleOpenDialog(categoryId, subcategoryId)}
          >
            Add Service
          </Button>
        </div>
        
        {subcategory.services.length > 0 ? (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>Price Unit</TableCell>
                  <TableCell>Generator</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {subcategory.services.map(service => (
                  <TableRow key={service.id}>
                    <TableCell>{service.id}</TableCell>
                    <TableCell>{service.name}</TableCell>
                    <TableCell>{service.price_unit} {service.currency}</TableCell>
                    <TableCell>
                      {generators.find(g => g.id === service.foreign_key_generator)?.name || 'Unknown'}
                    </TableCell>
                    <TableCell>
                      <IconButton 
                        size="small" 
                        onClick={() => handleOpenDialog(categoryId, subcategoryId, service)}
                      >
                        <Edit fontSize="small" />
                      </IconButton>
                      <IconButton 
                        size="small" 
                        onClick={() => handleDeleteService(categoryId, subcategoryId, service.id)}
                      >
                        <Delete fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <div className="no-data-message">No services found</div>
        )}
      </div>
    );
  };

  return (
    <div className="services-manager">
      <div className="section-header">
        <h2>Services</h2>
        <div className="filter-controls">
          <FormControl sx={{ minWidth: 200, mr: 2 }}>
            <InputLabel>Category</InputLabel>
            <Select
              value={selectedCategory}
              onChange={(e) => handleCategoryChange(e.target.value)}
              label="Category"
            >
              <MenuItem value="">
                <em>All Categories</em>
              </MenuItem>
              {categories.map(category => (
                <MenuItem key={category.id} value={category.id}>
                  {category.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          
          <FormControl sx={{ minWidth: 200 }} disabled={!selectedCategory}>
            <InputLabel>Subcategory</InputLabel>
            <Select
              value={selectedSubcategory}
              onChange={(e) => setSelectedSubcategory(e.target.value)}
              label="Subcategory"
            >
              <MenuItem value="">
                <em>All Subcategories</em>
              </MenuItem>
              {availableSubcategories.map(subcategory => (
                <MenuItem key={subcategory.id} value={subcategory.id}>
                  {subcategory.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          
          {selectedCategory && selectedSubcategory && (
            <Button 
              variant="contained" 
              color="primary" 
              startIcon={<Add />}
              onClick={() => handleOpenDialog(selectedCategory, selectedSubcategory)}
              sx={{ ml: 2 }}
            >
              Add Service
            </Button>
          )}
        </div>
      </div>

      {/* Services List */}
      {selectedCategory && selectedSubcategory ? (
        renderSubcategoryServices(selectedCategory, selectedSubcategory)
      ) : (
        renderAllServices()
      )}

      {/* Service Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>{currentService ? 'Edit Service' : 'Add Service'}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Service Name"
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
              label="Price Unit"
              type="number"
              value={form.price_unit}
              onChange={(e) => setForm({...form, price_unit: parseFloat(e.target.value) || 0})}
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
            <InputLabel>Generator</InputLabel>
            <Select
              value={form.foreign_key_generator}
              onChange={(e) => setForm({...form, foreign_key_generator: e.target.value})}
              label="Generator"
            >
              {generators.map(generator => (
                <MenuItem key={generator.id} value={generator.id}>
                  {generator.name}
                </MenuItem>
              ))}
            </Select>
            <FormHelperText>Select the calculator generator for this service</FormHelperText>
          </FormControl>
          
          <FormControl fullWidth margin="dense">
            <InputLabel>Associated Products</InputLabel>
            <Select
              multiple
              value={form.product_ids}
              onChange={handleProductChange}
              input={<OutlinedInput label="Associated Products" />}
              renderValue={(selected) => selected
                .map(id => products.find(p => p.id === id)?.name || `Product ${id}`)
                .join(', ')}
            >
              {products.map(product => (
                <MenuItem key={product.id} value={product.id}>
                  <Checkbox checked={form.product_ids.indexOf(product.id) > -1} />
                  <ListItemText primary={`${product.name} - ${product.price} ${product.currency}`} />
                </MenuItem>
              ))}
            </Select>
            <FormHelperText>Select products associated with this service</FormHelperText>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSaveService} color="primary">Save</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default ServicesManager; 