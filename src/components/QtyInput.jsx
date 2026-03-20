import { useState, useEffect } from 'react';

// Local helper for quantity input with buffer
// Uses type="text" + inputMode="decimal" to avoid mobile browser quirks with type="number"
// Cart is ONLY updated on blur or Enter — never during typing
export default function QtyInput({ value, onChange, priceType, unit = 'kg' }) {
  const isPerKg = priceType === 'per_kg';
  const displayValue = isPerKg && unit === 'gm' ? (value * 1000).toString() : value.toString();
  const [localVal, setLocalVal] = useState(displayValue);
  const [isFocused, setIsFocused] = useState(false);

  // Sync with prop changes
  useEffect(() => {
    if (!isFocused) {
      setLocalVal(displayValue);
    }
  }, [value, isFocused, unit, displayValue]);

  const handleChange = (e) => {
    setLocalVal(e.target.value);
  };

  const commitValue = () => {
    let num = parseFloat(localVal);
    // Modified to include 0 so that entering 0 correctly removes from cart
    if (!isNaN(num) && num >= 0) {
      const finalKgValue = isPerKg && unit === 'gm' ? num / 1000 : num;
      onChange(parseFloat(finalKgValue.toFixed(3)));
      setLocalVal(num.toString());
    } else {
      setLocalVal(displayValue);
    }
  };

  const handleFocus = (e) => {
    setIsFocused(true);
    e.target.select();
  };

  const handleBlur = () => {
    setIsFocused(false);
    commitValue();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      e.target.blur();
    }
  };

  return (
    <input
      type="text"
      inputMode="decimal"
      pattern="[0-9]*\.?[0-9]*"
      className="qty-input"
      value={localVal}
      onChange={handleChange}
      onFocus={handleFocus}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
    />
  );
}
