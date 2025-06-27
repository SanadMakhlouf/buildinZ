import React, { useState } from 'react';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Button, TextField, Dialog, DialogActions, DialogContent,
  DialogTitle, IconButton, FormControl, InputLabel, Select, MenuItem
} from '@mui/material';
import { Add, Edit, Delete } from '@mui/icons-material';
import dataService from '../../services/dataService';
import './AdminStyles.css';

const ConditionsManager = ({ conditions, categories, onDataChange }) => {
  const [openDialog, setOpenDialog] = useState(false);
  const [currentCondition, setCurrentCondition] = useState(null);
  const [form, setForm] = useState({
    name: '',
    description: '',
    category_id: ''
  });

  // Dialog Handlers
  const handleOpenDialog = (condition = null) => {
    if (condition) {
      setForm({
        name: condition.name,
        description: condition.description,
        category_id: condition.category_id
      });
      setCurrentCondition(condition);
    } else {
      setForm({
        name: '',
        description: '',
        category_id: categories.length > 0 ? categories[0].id : ''
      });
      setCurrentCondition(null);
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleSaveCondition = () => {
    if (currentCondition) {
      // Update existing condition
      dataService.updateCondition(currentCondition.id, form);
    } else {
      // Create new condition
      dataService.createCondition(form);
    }
    handleCloseDialog();
    onDataChange();
  };

  const handleDeleteCondition = (conditionId) => {
    if (window.confirm('Are you sure you want to delete this condition?')) {
      dataService.deleteCondition(conditionId);
      onDataChange();
    }
  };

  return (
    <div className="conditions-manager">
      <div className="section-header">
        <h2>Conditions</h2>
        <Button 
          variant="contained" 
          color="primary" 
          startIcon={<Add />}
          onClick={() => handleOpenDialog()}
        >
          Add Condition
        </Button>
      </div>

      {/* Conditions List */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Category</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {conditions.map(condition => (
              <TableRow key={condition.id}>
                <TableCell>{condition.id}</TableCell>
                <TableCell>{condition.name}</TableCell>
                <TableCell>{condition.description}</TableCell>
                <TableCell>
                  {categories.find(c => c.id === condition.category_id)?.name || 'Unknown'}
                </TableCell>
                <TableCell>
                  <IconButton 
                    size="small" 
                    onClick={() => handleOpenDialog(condition)}
                  >
                    <Edit fontSize="small" />
                  </IconButton>
                  <IconButton 
                    size="small" 
                    onClick={() => handleDeleteCondition(condition.id)}
                  >
                    <Delete fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Condition Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>{currentCondition ? 'Edit Condition' : 'Add Condition'}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Condition Name"
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
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSaveCondition} color="primary">Save</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default ConditionsManager; 