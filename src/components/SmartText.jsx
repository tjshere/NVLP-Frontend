import React from 'react';
import { useSensory } from '../context/SensoryContext';

/**
 * SmartText Component - Dynamically formats text based on sensory preferences
 * 
 * Features:
 * - Bionic Reading: Bolds the first half of each word for faster reading
 * - Dyslexic Font: Applied globally via context
 * - Font Size: Applied globally via context
 * 
 * Usage:
 * <SmartText>Your text content here</SmartText>
 * <SmartText className="custom-class">Styled text</SmartText>
 */
const SmartText = ({ children, className = '' }) => {
  const { smartTag, bionicReading } = useSensory();
  
  // If children is not a string, return as-is
  if (typeof children !== 'string') {
    return <span className={className}>{children}</span>;
  }
  
  // Apply smart tag transformation if bionic reading is active
  const transformedText = bionicReading ? smartTag(children) : children;
  
  return (
    <span className={`${bionicReading ? 'bionic-text' : ''} ${className}`}>
      {transformedText}
    </span>
  );
};

export default SmartText;

