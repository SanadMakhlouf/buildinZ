# Location Selector Setup Guide

This document provides instructions for setting up the location selector feature in the BuildingZ application.

## Google Maps API Setup

The location selector uses Google Maps API for map display, geocoding, and place search functionality. Follow these steps to set up your Google Maps API key:

1. **Create a Google Cloud Project**:
   - Go to the [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select an existing one

2. **Enable Required APIs**:
   - In your Google Cloud project, navigate to "APIs & Services" > "Library"
   - Enable the following APIs:
     - Maps JavaScript API
     - Places API
     - Geocoding API

3. **Create API Key**:
   - In your Google Cloud project, navigate to "APIs & Services" > "Credentials"
   - Click "Create Credentials" and select "API Key"
   - A new API key will be generated

4. **Restrict Your API Key** (Recommended for Production):
   - In the API key details, click "Restrict Key"
   - Under "Application restrictions", select "HTTP referrers" and add your domain(s)
   - Under "API restrictions", select the APIs you enabled (Maps JavaScript, Places, Geocoding)

5. **Add the API Key to Your Application**:
   - Open `public/index.html`
   - Replace `REPLACE_WITH_YOUR_GOOGLE_MAPS_API_KEY` with your actual API key:
   ```html
   <script src="https://maps.googleapis.com/maps/api/js?key=YOUR_ACTUAL_API_KEY&libraries=places&language=ar"></script>
   ```

## Features of the Location Selector

The location selector includes the following features:

1. **Map Interface**:
   - Interactive Google Map for selecting locations
   - Draggable marker for precise location selection
   - Click anywhere on the map to set the marker

2. **Search Functionality**:
   - Search for addresses, landmarks, or areas
   - Autocomplete suggestions powered by Google Places

3. **Current Location**:
   - Option to use the user's current location (requires browser permission)

4. **Save Multiple Addresses**:
   - Users can save multiple addresses with custom names
   - Addresses are categorized as Home, Work, or Other
   - Saved addresses are stored in the browser's local storage

5. **Default Address**:
   - Users can set a default address
   - The default address is displayed in the navbar

## Usage in Components

The location selector is implemented as a modal component that can be used throughout the application:

```jsx
import LocationModal from './components/LocationModal';

// In your component:
const [locationModalOpen, setLocationModalOpen] = useState(false);

const handleLocationSelect = (selectedLocation) => {
  console.log('Selected location:', selectedLocation);
  // Do something with the selected location
};

// In your JSX:
<LocationModal 
  isOpen={locationModalOpen}
  onClose={() => setLocationModalOpen(false)}
  onSelectLocation={handleLocationSelect}
/>
```

## Address Utilities

The application includes utility functions for managing addresses in `src/utils/addressUtils.js`:

- `getSavedAddresses()`: Get all saved addresses
- `saveAddress(address)`: Save a new address
- `updateAddress(id, updatedAddress)`: Update an existing address
- `deleteAddress(id)`: Delete an address
- `setDefaultAddress(id)`: Set an address as default
- `getDefaultAddress()`: Get the default address
- `formatAddress(addressComponents)`: Format address components for display

## Customization

You can customize the appearance of the location selector by modifying the styles in `src/styles/LocationModal.css`. 