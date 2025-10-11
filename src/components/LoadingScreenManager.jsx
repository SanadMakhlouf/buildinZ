import React from 'react';
import { useLoading } from '../context/LoadingContext';
import LoadingScreen from './LoadingScreen';

const LoadingScreenManager = () => {
  const { isLoading, loadingMessage } = useLoading();
  
  if (!isLoading) return null;
  
  return <LoadingScreen message={loadingMessage} />;
};

export default LoadingScreenManager;
