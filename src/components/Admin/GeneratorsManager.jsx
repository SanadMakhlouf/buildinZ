import React, { useState } from 'react';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Button, TextField, Dialog, DialogActions, DialogContent,
  DialogTitle, IconButton, FormControl, InputLabel, Select, MenuItem,
  FormHelperText, Tabs, Tab, Box, Accordion, AccordionSummary, AccordionDetails,
  Chip, Switch, FormControlLabel
} from '@mui/material';
import { Add, Edit, Delete, ExpandMore, Code, Input, Functions } from '@mui/icons-material';
import dataService from '../../services/dataService';
import './AdminStyles.css';

const GeneratorsManager = ({ 
  generators, 
  categories, 
  inputTypes, 
  optionTypes, 
  units, 
  products, 
  conditions, 
  onDataChange 
}) => {
  const [openDialog, setOpenDialog] = useState(false);
  const [openInputDialog, setOpenInputDialog] = useState(false);
  const [openFormulaDialog, setOpenFormulaDialog] = useState(false);
  const [currentGenerator, setCurrentGenerator] = useState(null);
  const [currentInput, setCurrentInput] = useState(null);
  const [currentFormulaType, setCurrentFormulaType] = useState(null);
  const [generatorForm, setGeneratorForm] = useState({
    name: '',
    description: '',
    category_id: '',
    inputs: [],
    formulas: {
      pricing: { formula: '', description: '' },
      labor: { formula: '', description: '' },
      materials: { formula: '', description: '' },
      derived_inputs: []
    }
  });
  const [inputForm, setInputForm] = useState({
    id: '',
    name: '',
    label: '',
    type: 'number',
    unit: '',
    required: false,
    default: '',
    options: [],
    option_type: '',
    order: 0
  });
  const [formulaForm, setFormulaForm] = useState({
    formula: '',
    description: ''
  });
  const [derivedInputForm, setDerivedInputForm] = useState({
    name: '',
    label: '',
    formula: '',
    unit: '',
    description: ''
  });
  const [activeTab, setActiveTab] = useState(0);

  // Dialog Handlers
  const handleOpenDialog = (generator = null) => {
    if (generator) {
      setGeneratorForm({
        name: generator.name,
        description: generator.description,
        category_id: generator.category_id,
        inputs: [...generator.inputs],
        formulas: {
          pricing: { ...generator.formulas.pricing },
          labor: { ...generator.formulas.labor },
          materials: { ...generator.formulas.materials },
          derived_inputs: [...generator.formulas.derived_inputs]
        }
      });
      setCurrentGenerator(generator);
    } else {
      setGeneratorForm({
        name: '',
        description: '',
        category_id: categories.length > 0 ? categories[0].id : '',
        inputs: [],
        formulas: {
          pricing: { formula: '', description: 'Total price calculation' },
          labor: { formula: '', description: 'Labor cost calculation' },
          materials: { formula: '', description: 'Materials cost calculation' },
          derived_inputs: []
        }
      });
      setCurrentGenerator(null);
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleSaveGenerator = () => {
    if (currentGenerator) {
      // Update existing generator
      dataService.updateGenerator(currentGenerator.id, generatorForm);
    } else {
      // Create new generator
      dataService.createGenerator(generatorForm);
    }
    handleCloseDialog();
    onDataChange();
  };

  const handleDeleteGenerator = (generatorId) => {
    if (window.confirm('Are you sure you want to delete this generator?')) {
      dataService.deleteGenerator(generatorId);
      onDataChange();
    }
  };

  // Input Dialog Handlers
  const handleOpenInputDialog = (input = null) => {
    if (input) {
      setInputForm({
        id: input.id,
        name: input.name,
        label: input.label,
        type: input.type,
        unit: input.unit || '',
        required: input.required || false,
        default: input.default !== undefined ? input.default : '',
        options: input.options || [],
        option_type: input.option_type || '',
        order: input.order || 0
      });
      setCurrentInput(input);
    } else {
      setInputForm({
        id: `input_${Date.now()}`,
        name: '',
        label: '',
        type: 'number',
        unit: '',
        required: false,
        default: '',
        options: [],
        option_type: '',
        order: generatorForm.inputs.length + 1
      });
      setCurrentInput(null);
    }
    setOpenInputDialog(true);
  };

  const handleCloseInputDialog = () => {
    setOpenInputDialog(false);
  };

  const handleSaveInput = () => {
    const updatedInputs = [...generatorForm.inputs];
    
    if (currentInput) {
      // Update existing input
      const index = updatedInputs.findIndex(input => input.id === currentInput.id);
      if (index !== -1) {
        updatedInputs[index] = { ...inputForm };
      }
    } else {
      // Add new input
      updatedInputs.push({ ...inputForm });
    }
    
    setGeneratorForm({
      ...generatorForm,
      inputs: updatedInputs
    });
    
    handleCloseInputDialog();
  };

  const handleDeleteInput = (inputId) => {
    const updatedInputs = generatorForm.inputs.filter(input => input.id !== inputId);
    setGeneratorForm({
      ...generatorForm,
      inputs: updatedInputs
    });
  };

  // Formula Dialog Handlers
  const handleOpenFormulaDialog = (formulaType) => {
    setCurrentFormulaType(formulaType);
    
    if (formulaType === 'derived') {
      setDerivedInputForm({
        name: '',
        label: '',
        formula: '',
        unit: '',
        description: ''
      });
    } else {
      setFormulaForm({
        formula: generatorForm.formulas[formulaType].formula,
        description: generatorForm.formulas[formulaType].description
      });
    }
    
    setOpenFormulaDialog(true);
  };

  const handleCloseFormulaDialog = () => {
    setOpenFormulaDialog(false);
  };

  const handleSaveFormula = () => {
    if (currentFormulaType === 'derived') {
      // Add new derived input
      const updatedDerivedInputs = [...generatorForm.formulas.derived_inputs, derivedInputForm];
      setGeneratorForm({
        ...generatorForm,
        formulas: {
          ...generatorForm.formulas,
          derived_inputs: updatedDerivedInputs
        }
      });
    } else {
      // Update formula
      setGeneratorForm({
        ...generatorForm,
        formulas: {
          ...generatorForm.formulas,
          [currentFormulaType]: {
            formula: formulaForm.formula,
            description: formulaForm.description
          }
        }
      });
    }
    
    handleCloseFormulaDialog();
  };

  const handleDeleteDerivedInput = (index) => {
    const updatedDerivedInputs = [...generatorForm.formulas.derived_inputs];
    updatedDerivedInputs.splice(index, 1);
    
    setGeneratorForm({
      ...generatorForm,
      formulas: {
        ...generatorForm.formulas,
        derived_inputs: updatedDerivedInputs
      }
    });
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  return (
    <div className="generators-manager">
      <div className="section-header">
        <h2>Calculator Generators</h2>
        <Button 
          variant="contained" 
          color="primary" 
          startIcon={<Add />}
          onClick={() => handleOpenDialog()}
        >
          Add Generator
        </Button>
      </div>

      {/* Generators List */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Category</TableCell>
              <TableCell>Inputs</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {generators.map(generator => (
              <TableRow key={generator.id}>
                <TableCell>{generator.id}</TableCell>
                <TableCell>{generator.name}</TableCell>
                <TableCell>{generator.description}</TableCell>
                <TableCell>
                  {categories.find(c => c.id === generator.category_id)?.name || 'Unknown'}
                </TableCell>
                <TableCell>{generator.inputs.length}</TableCell>
                <TableCell>
                  <IconButton 
                    size="small" 
                    onClick={() => handleOpenDialog(generator)}
                  >
                    <Edit fontSize="small" />
                  </IconButton>
                  <IconButton 
                    size="small" 
                    onClick={() => handleDeleteGenerator(generator.id)}
                  >
                    <Delete fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Generator Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>{currentGenerator ? 'Edit Generator' : 'Add Generator'}</DialogTitle>
        <DialogContent>
          <Tabs value={activeTab} onChange={handleTabChange} aria-label="generator tabs">
            <Tab label="Basic Info" />
            <Tab label="Inputs" />
            <Tab label="Formulas" />
          </Tabs>
          
          <TabPanel value={activeTab} index={0}>
            <TextField
              autoFocus
              margin="dense"
              label="Generator Name"
              fullWidth
              value={generatorForm.name}
              onChange={(e) => setGeneratorForm({...generatorForm, name: e.target.value})}
            />
            <TextField
              margin="dense"
              label="Description"
              fullWidth
              multiline
              rows={2}
              value={generatorForm.description}
              onChange={(e) => setGeneratorForm({...generatorForm, description: e.target.value})}
            />
            <FormControl fullWidth margin="dense">
              <InputLabel>Category</InputLabel>
              <Select
                value={generatorForm.category_id}
                onChange={(e) => setGeneratorForm({...generatorForm, category_id: e.target.value})}
                label="Category"
              >
                {categories.map(category => (
                  <MenuItem key={category.id} value={category.id}>
                    {category.name}
                  </MenuItem>
                ))}
              </Select>
              <FormHelperText>Select the category this generator belongs to</FormHelperText>
            </FormControl>
          </TabPanel>
          
          <TabPanel value={activeTab} index={1}>
            <div className="section-header">
              <h3>Input Fields</h3>
              <Button 
                variant="contained" 
                color="primary" 
                startIcon={<Add />}
                onClick={() => handleOpenInputDialog()}
              >
                Add Input
              </Button>
            </div>
            
            {generatorForm.inputs.length > 0 ? (
              <TableContainer component={Paper}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Order</TableCell>
                      <TableCell>Name</TableCell>
                      <TableCell>Label</TableCell>
                      <TableCell>Type</TableCell>
                      <TableCell>Required</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {generatorForm.inputs
                      .sort((a, b) => a.order - b.order)
                      .map(input => (
                      <TableRow key={input.id}>
                        <TableCell>{input.order}</TableCell>
                        <TableCell>{input.name}</TableCell>
                        <TableCell>{input.label}</TableCell>
                        <TableCell>{input.type}</TableCell>
                        <TableCell>{input.required ? 'Yes' : 'No'}</TableCell>
                        <TableCell>
                          <IconButton 
                            size="small" 
                            onClick={() => handleOpenInputDialog(input)}
                          >
                            <Edit fontSize="small" />
                          </IconButton>
                          <IconButton 
                            size="small" 
                            onClick={() => handleDeleteInput(input.id)}
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
              <div className="no-data-message">No inputs defined</div>
            )}
          </TabPanel>
          
          <TabPanel value={activeTab} index={2}>
            <div className="formulas-section">
              <Accordion defaultExpanded>
                <AccordionSummary expandIcon={<ExpandMore />}>
                  <div className="formula-header">
                    <Functions />
                    <span>Pricing Formula</span>
                  </div>
                </AccordionSummary>
                <AccordionDetails>
                  <div className="formula-content">
                    <div className="formula-display">
                      <pre>{generatorForm.formulas.pricing.formula || 'No formula defined'}</pre>
                    </div>
                    <div className="formula-actions">
                      <Button 
                        variant="outlined" 
                        startIcon={<Edit />}
                        onClick={() => handleOpenFormulaDialog('pricing')}
                      >
                        Edit Formula
                      </Button>
                    </div>
                  </div>
                </AccordionDetails>
              </Accordion>
              
              <Accordion>
                <AccordionSummary expandIcon={<ExpandMore />}>
                  <div className="formula-header">
                    <Functions />
                    <span>Labor Cost Formula</span>
                  </div>
                </AccordionSummary>
                <AccordionDetails>
                  <div className="formula-content">
                    <div className="formula-display">
                      <pre>{generatorForm.formulas.labor.formula || 'No formula defined'}</pre>
                    </div>
                    <div className="formula-actions">
                      <Button 
                        variant="outlined" 
                        startIcon={<Edit />}
                        onClick={() => handleOpenFormulaDialog('labor')}
                      >
                        Edit Formula
                      </Button>
                    </div>
                  </div>
                </AccordionDetails>
              </Accordion>
              
              <Accordion>
                <AccordionSummary expandIcon={<ExpandMore />}>
                  <div className="formula-header">
                    <Functions />
                    <span>Materials Cost Formula</span>
                  </div>
                </AccordionSummary>
                <AccordionDetails>
                  <div className="formula-content">
                    <div className="formula-display">
                      <pre>{generatorForm.formulas.materials.formula || 'No formula defined'}</pre>
                    </div>
                    <div className="formula-actions">
                      <Button 
                        variant="outlined" 
                        startIcon={<Edit />}
                        onClick={() => handleOpenFormulaDialog('materials')}
                      >
                        Edit Formula
                      </Button>
                    </div>
                  </div>
                </AccordionDetails>
              </Accordion>
              
              <div className="derived-inputs-section">
                <div className="section-header">
                  <h3>Derived Inputs</h3>
                  <Button 
                    variant="contained" 
                    color="primary" 
                    startIcon={<Add />}
                    onClick={() => handleOpenFormulaDialog('derived')}
                  >
                    Add Derived Input
                  </Button>
                </div>
                
                {generatorForm.formulas.derived_inputs.length > 0 ? (
                  <TableContainer component={Paper}>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Name</TableCell>
                          <TableCell>Label</TableCell>
                          <TableCell>Formula</TableCell>
                          <TableCell>Unit</TableCell>
                          <TableCell>Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {generatorForm.formulas.derived_inputs.map((input, index) => (
                          <TableRow key={index}>
                            <TableCell>{input.name}</TableCell>
                            <TableCell>{input.label}</TableCell>
                            <TableCell>{input.formula}</TableCell>
                            <TableCell>{input.unit}</TableCell>
                            <TableCell>
                              <IconButton 
                                size="small" 
                                onClick={() => handleDeleteDerivedInput(index)}
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
                  <div className="no-data-message">No derived inputs defined</div>
                )}
              </div>
            </div>
          </TabPanel>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSaveGenerator} color="primary">Save</Button>
        </DialogActions>
      </Dialog>

      {/* Input Dialog */}
      <Dialog open={openInputDialog} onClose={handleCloseInputDialog} maxWidth="md">
        <DialogTitle>{currentInput ? 'Edit Input' : 'Add Input'}</DialogTitle>
        <DialogContent>
          <div className="form-row">
            <TextField
              autoFocus
              margin="dense"
              label="Input Name"
              value={inputForm.name}
              onChange={(e) => setInputForm({...inputForm, name: e.target.value})}
              helperText="Variable name used in formulas"
              sx={{ mr: 2, flexGrow: 1 }}
            />
            <TextField
              margin="dense"
              label="Display Label"
              value={inputForm.label}
              onChange={(e) => setInputForm({...inputForm, label: e.target.value})}
              helperText="Label shown to users"
              sx={{ flexGrow: 1 }}
            />
          </div>
          
          <div className="form-row">
            <FormControl margin="dense" sx={{ mr: 2, minWidth: 150 }}>
              <InputLabel>Input Type</InputLabel>
              <Select
                value={inputForm.type}
                onChange={(e) => setInputForm({...inputForm, type: e.target.value})}
                label="Input Type"
              >
                {inputTypes.map(type => (
                  <MenuItem key={type.id} value={type.id}>
                    {type.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <TextField
              margin="dense"
              label="Order"
              type="number"
              value={inputForm.order}
              onChange={(e) => setInputForm({...inputForm, order: parseInt(e.target.value) || 0})}
              sx={{ width: 100, mr: 2 }}
            />
            
            <FormControlLabel
              control={
                <Switch
                  checked={inputForm.required}
                  onChange={(e) => setInputForm({...inputForm, required: e.target.checked})}
                />
              }
              label="Required"
            />
          </div>
          
          {(inputForm.type === 'number' || inputForm.type === 'derived') && (
            <FormControl margin="dense" fullWidth>
              <InputLabel>Unit</InputLabel>
              <Select
                value={inputForm.unit}
                onChange={(e) => setInputForm({...inputForm, unit: e.target.value})}
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
          )}
          
          {inputForm.type !== 'derived' && (
            <TextField
              margin="dense"
              label="Default Value"
              fullWidth
              value={inputForm.default}
              onChange={(e) => setInputForm({...inputForm, default: e.target.value})}
              helperText="Default value for this input"
            />
          )}
          
          {inputForm.type === 'select' && (
            <div className="select-options-section">
              <FormControl margin="dense" fullWidth>
                <InputLabel>Option Type</InputLabel>
                <Select
                  value={inputForm.option_type}
                  onChange={(e) => setInputForm({...inputForm, option_type: e.target.value})}
                  label="Option Type"
                >
                  {optionTypes.map(type => (
                    <MenuItem key={type.id} value={type.id}>
                      {type.name}
                    </MenuItem>
                  ))}
                </Select>
                <FormHelperText>Select the type of options for this dropdown</FormHelperText>
              </FormControl>
              
              <div className="options-list">
                <h4>Options</h4>
                {inputForm.option_type === 'product' ? (
                  <div className="product-options">
                    {products.map(product => (
                      <Chip
                        key={product.id}
                        label={`${product.name} (${product.id})`}
                        onClick={() => {
                          const options = [...inputForm.options];
                          if (!options.includes(product.id)) {
                            options.push(product.id);
                            setInputForm({...inputForm, options});
                          }
                        }}
                        onDelete={() => {
                          const options = inputForm.options.filter(id => id !== product.id);
                          setInputForm({...inputForm, options});
                        }}
                        color={inputForm.options.includes(product.id) ? "primary" : "default"}
                        sx={{ m: 0.5 }}
                      />
                    ))}
                  </div>
                ) : inputForm.option_type === 'condition' ? (
                  <div className="condition-options">
                    {conditions.map(condition => (
                      <Chip
                        key={condition.id}
                        label={`${condition.name} (${condition.id})`}
                        onClick={() => {
                          const options = [...inputForm.options];
                          if (!options.includes(condition.id)) {
                            options.push(condition.id);
                            setInputForm({...inputForm, options});
                          }
                        }}
                        onDelete={() => {
                          const options = inputForm.options.filter(id => id !== condition.id);
                          setInputForm({...inputForm, options});
                        }}
                        color={inputForm.options.includes(condition.id) ? "primary" : "default"}
                        sx={{ m: 0.5 }}
                      />
                    ))}
                  </div>
                ) : (
                  <TextField
                    margin="dense"
                    label="Custom Options"
                    fullWidth
                    multiline
                    rows={3}
                    value={inputForm.options.join('\n')}
                    onChange={(e) => setInputForm({...inputForm, options: e.target.value.split('\n').filter(Boolean)})}
                    helperText="Enter one option per line"
                  />
                )}
              </div>
            </div>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseInputDialog}>Cancel</Button>
          <Button onClick={handleSaveInput} color="primary">Save</Button>
        </DialogActions>
      </Dialog>

      {/* Formula Dialog */}
      <Dialog open={openFormulaDialog} onClose={handleCloseFormulaDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {currentFormulaType === 'derived' 
            ? 'Add Derived Input' 
            : currentFormulaType 
              ? `Edit ${currentFormulaType.charAt(0).toUpperCase() + currentFormulaType.slice(1)} Formula`
              : 'Edit Formula'}
        </DialogTitle>
        <DialogContent>
          {currentFormulaType === 'derived' ? (
            <>
              <div className="form-row">
                <TextField
                  autoFocus
                  margin="dense"
                  label="Input Name"
                  value={derivedInputForm.name}
                  onChange={(e) => setDerivedInputForm({...derivedInputForm, name: e.target.value})}
                  helperText="Variable name used in formulas"
                  sx={{ mr: 2, flexGrow: 1 }}
                />
                <TextField
                  margin="dense"
                  label="Display Label"
                  value={derivedInputForm.label}
                  onChange={(e) => setDerivedInputForm({...derivedInputForm, label: e.target.value})}
                  helperText="Label shown to users"
                  sx={{ flexGrow: 1 }}
                />
              </div>
              
              <FormControl margin="dense" fullWidth sx={{ mb: 2 }}>
                <InputLabel>Unit</InputLabel>
                <Select
                  value={derivedInputForm.unit}
                  onChange={(e) => setDerivedInputForm({...derivedInputForm, unit: e.target.value})}
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
                label="Formula"
                fullWidth
                multiline
                rows={3}
                value={derivedInputForm.formula}
                onChange={(e) => setDerivedInputForm({...derivedInputForm, formula: e.target.value})}
                helperText="JavaScript formula to calculate this derived input"
              />
              
              <TextField
                margin="dense"
                label="Description"
                fullWidth
                value={derivedInputForm.description}
                onChange={(e) => setDerivedInputForm({...derivedInputForm, description: e.target.value})}
                helperText="Description of what this derived input calculates"
              />
            </>
          ) : (
            <>
              <TextField
                autoFocus
                margin="dense"
                label="Formula"
                fullWidth
                multiline
                rows={5}
                value={formulaForm.formula}
                onChange={(e) => setFormulaForm({...formulaForm, formula: e.target.value})}
                helperText="JavaScript formula to calculate the price"
              />
              
              <TextField
                margin="dense"
                label="Description"
                fullWidth
                value={formulaForm.description}
                onChange={(e) => setFormulaForm({...formulaForm, description: e.target.value})}
                helperText="Description of what this formula calculates"
              />
            </>
          )}
          
          <div className="formula-help">
            <h4>Available Variables:</h4>
            <div className="variables-list">
              {generatorForm.inputs.map(input => (
                <Chip
                  key={input.id}
                  label={input.name}
                  variant="outlined"
                  size="small"
                  sx={{ m: 0.5 }}
                />
              ))}
              <Chip
                label="price_unit"
                variant="outlined"
                size="small"
                color="primary"
                sx={{ m: 0.5 }}
              />
            </div>
            <p>You can use JavaScript math functions like Math.ceil(), Math.floor(), etc.</p>
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseFormulaDialog}>Cancel</Button>
          <Button onClick={handleSaveFormula} color="primary">Save</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

// TabPanel component
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`generator-tabpanel-${index}`}
      aria-labelledby={`generator-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

export default GeneratorsManager; 