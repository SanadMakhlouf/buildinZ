import React, { useState, useEffect } from 'react';
import { Tabs, Tab, Box } from '@mui/material';
import CategoriesManager from './CategoriesManager';
import ServicesManager from './ServicesManager';
import GeneratorsManager from './GeneratorsManager';
import ProductsManager from './ProductsManager';
import ConditionsManager from './ConditionsManager';
import dataService from '../../services/dataService';
import './AdminPanel.css';

const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [data, setData] = useState({
    categories: [],
    generators: [],
    products: [],
    conditions: [],
    serviceTiers: [],
    inputTypes: [],
    optionTypes: [],
    units: []
  });

  useEffect(() => {
    // Load all data when component mounts
    loadAllData();
  }, []);

  const loadAllData = () => {
    setData({
      categories: dataService.getCategories(),
      generators: dataService.getGenerators(),
      products: dataService.getProducts(),
      conditions: dataService.getConditions(),
      serviceTiers: dataService.getServiceTiers(),
      inputTypes: dataService.getInputTypes(),
      optionTypes: dataService.getOptionTypes(),
      units: dataService.getUnits()
    });
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleDataChange = () => {
    // Reload all data when any change happens
    loadAllData();
  };

  return (
    <div className="admin-panel">
      <h1>BuildingZ Admin Panel</h1>
      
      <Box sx={{ width: '100%' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={activeTab} onChange={handleTabChange} aria-label="admin tabs">
            <Tab label="Categories" />
            <Tab label="Services" />
            <Tab label="Generators" />
            <Tab label="Products" />
            <Tab label="Conditions" />
          </Tabs>
        </Box>
        
        <TabPanel value={activeTab} index={0}>
          <CategoriesManager 
            categories={data.categories} 
            onDataChange={handleDataChange} 
          />
        </TabPanel>
        
        <TabPanel value={activeTab} index={1}>
          <ServicesManager 
            categories={data.categories}
            generators={data.generators}
            onDataChange={handleDataChange}
          />
        </TabPanel>
        
        <TabPanel value={activeTab} index={2}>
          <GeneratorsManager 
            generators={data.generators}
            categories={data.categories}
            inputTypes={data.inputTypes}
            optionTypes={data.optionTypes}
            units={data.units}
            products={data.products}
            conditions={data.conditions}
            onDataChange={handleDataChange}
          />
        </TabPanel>
        
        <TabPanel value={activeTab} index={3}>
          <ProductsManager 
            products={data.products}
            categories={data.categories}
            units={data.units}
            onDataChange={handleDataChange}
          />
        </TabPanel>
        
        <TabPanel value={activeTab} index={4}>
          <ConditionsManager 
            conditions={data.conditions}
            categories={data.categories}
            onDataChange={handleDataChange}
          />
        </TabPanel>
      </Box>
      
      <div className="admin-actions">
        <button 
          className="reset-button"
          onClick={() => {
            if (window.confirm('Are you sure you want to reset all data to defaults? This cannot be undone.')) {
              dataService.resetToDefaults();
              loadAllData();
            }
          }}
        >
          Reset to Defaults
        </button>
      </div>
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
      id={`admin-tabpanel-${index}`}
      aria-labelledby={`admin-tab-${index}`}
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

export default AdminPanel; 