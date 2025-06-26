import React, { useState } from 'react';
import { 
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, 
  Paper, Button, TextField, Dialog, DialogActions, DialogContent, 
  DialogTitle, IconButton, Accordion, AccordionSummary, AccordionDetails
} from '@mui/material';
import { Add, Edit, Delete, ExpandMore } from '@mui/icons-material';
import dataService from '../../services/dataService';
import './AdminStyles.css';

const CategoriesManager = ({ categories, onDataChange }) => {
  const [openCategoryDialog, setOpenCategoryDialog] = useState(false);
  const [openSubcategoryDialog, setOpenSubcategoryDialog] = useState(false);
  const [currentCategory, setCurrentCategory] = useState(null);
  const [currentSubcategory, setCurrentSubcategory] = useState(null);
  const [categoryForm, setCategoryForm] = useState({ name: '', icon: '' });
  const [subcategoryForm, setSubcategoryForm] = useState({ name: '' });
  const [expandedCategory, setExpandedCategory] = useState(null);

  // Category Dialog Handlers
  const handleOpenCategoryDialog = (category = null) => {
    if (category) {
      setCategoryForm({ name: category.name, icon: category.icon });
      setCurrentCategory(category);
    } else {
      setCategoryForm({ name: '', icon: '' });
      setCurrentCategory(null);
    }
    setOpenCategoryDialog(true);
  };

  const handleCloseCategoryDialog = () => {
    setOpenCategoryDialog(false);
  };

  const handleSaveCategory = () => {
    if (currentCategory) {
      // Update existing category
      dataService.updateCategory(currentCategory.id, categoryForm);
    } else {
      // Create new category
      dataService.createCategory(categoryForm);
    }
    handleCloseCategoryDialog();
    onDataChange();
  };

  const handleDeleteCategory = (categoryId) => {
    if (window.confirm('Are you sure you want to delete this category? All subcategories and services will be deleted as well.')) {
      dataService.deleteCategory(categoryId);
      onDataChange();
    }
  };

  // Subcategory Dialog Handlers
  const handleOpenSubcategoryDialog = (category, subcategory = null) => {
    setCurrentCategory(category);
    if (subcategory) {
      setSubcategoryForm({ name: subcategory.name });
      setCurrentSubcategory(subcategory);
    } else {
      setSubcategoryForm({ name: '' });
      setCurrentSubcategory(null);
    }
    setOpenSubcategoryDialog(true);
  };

  const handleCloseSubcategoryDialog = () => {
    setOpenSubcategoryDialog(false);
  };

  const handleSaveSubcategory = () => {
    if (currentSubcategory) {
      // Update existing subcategory
      dataService.updateSubcategory(currentCategory.id, currentSubcategory.id, subcategoryForm);
    } else {
      // Create new subcategory
      dataService.createSubcategory(currentCategory.id, subcategoryForm);
    }
    handleCloseSubcategoryDialog();
    onDataChange();
  };

  const handleDeleteSubcategory = (categoryId, subcategoryId) => {
    if (window.confirm('Are you sure you want to delete this subcategory? All services will be deleted as well.')) {
      dataService.deleteSubcategory(categoryId, subcategoryId);
      onDataChange();
    }
  };

  const handleCategoryExpand = (categoryId) => {
    setExpandedCategory(expandedCategory === categoryId ? null : categoryId);
  };

  return (
    <div className="categories-manager">
      <div className="section-header">
        <h2>Categories & Subcategories</h2>
        <Button 
          variant="contained" 
          color="primary" 
          startIcon={<Add />}
          onClick={() => handleOpenCategoryDialog()}
        >
          Add Category
        </Button>
      </div>

      {/* Categories List */}
      {categories.map(category => (
        <Accordion 
          key={category.id}
          expanded={expandedCategory === category.id}
          onChange={() => handleCategoryExpand(category.id)}
          className="category-accordion"
        >
          <AccordionSummary
            expandIcon={<ExpandMore />}
            aria-controls={`category-${category.id}-content`}
            id={`category-${category.id}-header`}
          >
            <div className="category-header">
              <span className="category-icon">{category.icon}</span>
              <span className="category-name">{category.name}</span>
              <div className="category-actions">
                <IconButton 
                  size="small" 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleOpenCategoryDialog(category);
                  }}
                >
                  <Edit fontSize="small" />
                </IconButton>
                <IconButton 
                  size="small" 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteCategory(category.id);
                  }}
                >
                  <Delete fontSize="small" />
                </IconButton>
              </div>
            </div>
          </AccordionSummary>
          <AccordionDetails>
            <div className="subcategory-section">
              <div className="subcategory-header">
                <h3>Subcategories</h3>
                <Button 
                  variant="outlined" 
                  size="small"
                  startIcon={<Add />}
                  onClick={() => handleOpenSubcategoryDialog(category)}
                >
                  Add Subcategory
                </Button>
              </div>
              
              {category.subcategories.length > 0 ? (
                <TableContainer component={Paper}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>ID</TableCell>
                        <TableCell>Name</TableCell>
                        <TableCell>Services</TableCell>
                        <TableCell>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {category.subcategories.map(subcategory => (
                        <TableRow key={subcategory.id}>
                          <TableCell>{subcategory.id}</TableCell>
                          <TableCell>{subcategory.name}</TableCell>
                          <TableCell>{subcategory.services.length}</TableCell>
                          <TableCell>
                            <IconButton 
                              size="small" 
                              onClick={() => handleOpenSubcategoryDialog(category, subcategory)}
                            >
                              <Edit fontSize="small" />
                            </IconButton>
                            <IconButton 
                              size="small" 
                              onClick={() => handleDeleteSubcategory(category.id, subcategory.id)}
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
                <div className="no-data-message">No subcategories found</div>
              )}
            </div>
          </AccordionDetails>
        </Accordion>
      ))}

      {/* Category Dialog */}
      <Dialog open={openCategoryDialog} onClose={handleCloseCategoryDialog}>
        <DialogTitle>{currentCategory ? 'Edit Category' : 'Add Category'}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Category Name"
            fullWidth
            value={categoryForm.name}
            onChange={(e) => setCategoryForm({...categoryForm, name: e.target.value})}
          />
          <TextField
            margin="dense"
            label="Icon (Emoji)"
            fullWidth
            value={categoryForm.icon}
            onChange={(e) => setCategoryForm({...categoryForm, icon: e.target.value})}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseCategoryDialog}>Cancel</Button>
          <Button onClick={handleSaveCategory} color="primary">Save</Button>
        </DialogActions>
      </Dialog>

      {/* Subcategory Dialog */}
      <Dialog open={openSubcategoryDialog} onClose={handleCloseSubcategoryDialog}>
        <DialogTitle>{currentSubcategory ? 'Edit Subcategory' : 'Add Subcategory'}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Subcategory Name"
            fullWidth
            value={subcategoryForm.name}
            onChange={(e) => setSubcategoryForm({...subcategoryForm, name: e.target.value})}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseSubcategoryDialog}>Cancel</Button>
          <Button onClick={handleSaveSubcategory} color="primary">Save</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default CategoriesManager; 