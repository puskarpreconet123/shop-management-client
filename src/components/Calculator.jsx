import React, { useState, useEffect, useRef } from 'react';
import { X, Delete, Divide, Minus, Plus, Equal, Hash, Weight, IndianRupee, RotateCcw } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import translations from '../utils/translations';
import './Calculator.css';

const Calculator = ({ isOpen, onClose }) => {
  const [mode, setMode] = useState('normal');
  const [display, setDisplay] = useState('0');
  const [history, setHistory] = useState([]);
  const [equation, setEquation] = useState('');
  const [shouldReset, setShouldReset] = useState(false);
  const { lang } = useLanguage();
  const t = translations[lang];
  
  // Mode 2 & 3 states
  const [pricePerKg, setPricePerKg] = useState('');
  const [neededPrice, setNeededPrice] = useState('');
  const [neededWeight, setNeededWeight] = useState('');
  const [weightUnit, setWeightUnit] = useState('kg'); // 'kg' or 'gm'
  const [result, setResult] = useState(null);

  const displayRef = useRef(null);

  useEffect(() => {
    if (displayRef.current) {
      displayRef.current.scrollTop = displayRef.current.scrollHeight;
    }
  }, [history]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen || mode !== 'normal') return;
      
      if (/[0-9]/.test(e.key)) {
        handleNumber(e.key);
      } else if (['+', '-', '*', '/'].includes(e.key)) {
        handleOperator(e.key);
      } else if (e.key === 'Enter' || e.key === '=') {
        e.preventDefault();
        calculateNormal();
      } else if (e.key === 'Backspace') {
        backspace();
      } else if (e.key === 'Escape') {
        clear();
      } else if (e.key === '.') {
        addDecimal();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, mode, display, equation, shouldReset]); // Dependencies are important for stale closures

  if (!isOpen) return null;

  const handleNumber = (num) => {
    if (shouldReset) {
      setDisplay(num.toString());
      setShouldReset(false);
    } else {
      setDisplay(prev => prev === '0' ? num.toString() : prev + num.toString());
    }
  };

  const handleOperator = (op) => {
    const operatorSymbol = op === '*' ? '×' : op === '/' ? '÷' : op;
    
    if (equation && !shouldReset) {
      // Chaining results: append current display and new operator
      setEquation(prev => prev + display + ' ' + operatorSymbol + ' ');
    } else if (shouldReset && equation) {
      // Changing operator: replace the last operator
      setEquation(prev => prev.slice(0, -3) + ' ' + operatorSymbol + ' ');
    } else {
      // Starting new equation
      setEquation(display + ' ' + operatorSymbol + ' ');
    }
    setShouldReset(true);
  };

  const calculateNormal = () => {
    if (!equation) return;
    try {
      const fullEquation = (equation + display)
        .replace(/×/g, '*')
        .replace(/÷/g, '/');
      
      // eslint-disable-next-line no-eval
      const evalResult = eval(fullEquation);
      const formattedResult = Number(Number(evalResult).toFixed(3)).toString();
      
      setHistory(prev => [...prev, { eq: equation + display, res: formattedResult }]);
      setDisplay(formattedResult);
      setEquation('');
      setShouldReset(true);
    } catch (error) {
      setDisplay('Error');
      setShouldReset(true);
    }
  };

  const addDecimal = () => {
    if (shouldReset) {
      setDisplay('0.');
      setShouldReset(false);
    } else if (!display.includes('.')) {
      setDisplay(prev => prev + '.');
    }
  };

  const backspace = () => {
    setDisplay(prev => prev.length > 1 ? prev.slice(0, -1) : '0');
  };

  const clear = () => {
    setDisplay('0');
    setEquation('');
    setHistory([]);
    setShouldReset(false);
  };

  const calculatePriceToWeight = () => {
    const price = parseFloat(pricePerKg);
    const total = parseFloat(neededPrice);
    if (price > 0 && total > 0) {
      const weight = (total / price) * 1000; // in grams
      setResult({
        type: 'weight',
        value: weight >= 1000 ? `${(weight/1000).toFixed(3)} ${t.kg}` : `${Math.round(weight)} ${t.gm}`
      });
    }
  };

  const calculateWeightToPrice = () => {
    const price = parseFloat(pricePerKg);
    const weight = parseFloat(neededWeight);
    if (price > 0 && weight > 0) {
      const weightInKg = weightUnit === 'kg' ? weight : weight / 1000;
      const total = price * weightInKg;
      setResult({
        type: 'price',
        value: `₹${total.toFixed(2)}`
      });
    }
  };

  return (
    <div className="calculator-overlay" onClick={onClose}>
      <div className="calculator-modal" onClick={(e) => e.stopPropagation()}>
        <div className="calc-header">
          <div className="calc-tabs">
            <button 
              className={`calc-tab ${mode === 'normal' ? 'active' : ''}`}
              onClick={() => setMode('normal')}
            >
              {t.calc_normal}
            </button>
            <button 
              className={`calc-tab ${mode === 'priceToWeight' ? 'active' : ''}`}
              onClick={() => { setMode('priceToWeight'); setResult(null); }}
            >
              {t.calc_p2w}
            </button>
            <button 
              className={`calc-tab ${mode === 'weightToPrice' ? 'active' : ''}`}
              onClick={() => { setMode('weightToPrice'); setResult(null); }}
            >
              {t.calc_w2p}
            </button>
          </div>
          <button className="calc-close" onClick={onClose}><X size={20} /></button>
        </div>

        <div className="calc-content">
          {mode === 'normal' && (
            <div className="mode-normal">
              <div className="calc-display-area" ref={displayRef}>
                <div className="calc-history">
                  {history.map((h, i) => (
                    <div key={i} className="history-item">
                      <span className="history-eq">{h.eq} =</span>
                      <span className="history-res">{h.res}</span>
                    </div>
                  ))}
                </div>
                <div className="calc-equation">{equation}</div>
                <div className="calc-current-val">{display}</div>
              </div>

              <div className="calc-grid">
                <button onClick={clear} className="btn-calc btn-op">AC</button>
                <button onClick={backspace} className="btn-calc btn-op"><Delete size={18} /></button>
                <button onClick={() => handleOperator('/')} className="btn-calc btn-op">÷</button>
                <button onClick={() => handleOperator('*')} className="btn-calc btn-op">×</button>
                
                {[7, 8, 9].map(n => <button key={n} onClick={() => handleNumber(n)} className="btn-calc">{n}</button>)}
                <button onClick={() => handleOperator('-')} className="btn-calc btn-op">-</button>
                
                {[4, 5, 6].map(n => <button key={n} onClick={() => handleNumber(n)} className="btn-calc">{n}</button>)}
                <button onClick={() => handleOperator('+')} className="btn-calc btn-op">+</button>
                
                {[1, 2, 3].map(n => <button key={n} onClick={() => handleNumber(n)} className="btn-calc">{n}</button>)}
                <button onClick={calculateNormal} className="btn-calc btn-equal"><Equal size={20} /></button>
                
                <button onClick={() => handleNumber(0)} className="btn-calc btn-zero">0</button>
                <button onClick={addDecimal} className="btn-calc">.</button>
              </div>
            </div>
          )}

          {mode === 'priceToWeight' && (
            <div className="mode-custom">
              <div className="calc-form">
                <div className="form-group">
                  <label className="label">{t.per_kg_price} (₹)</label>
                  <div className="input-with-icon">
                    <IndianRupee size={16} />
                    <input 
                      type="number" 
                      className="calc-input" 
                      placeholder="e.g. 50"
                      value={pricePerKg}
                      onChange={(e) => setPricePerKg(e.target.value)}
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label className="label">{t.total_price} (₹)</label>
                  <div className="input-with-icon">
                    <IndianRupee size={16} />
                    <input 
                      type="number" 
                      className="calc-input" 
                      placeholder="e.g. 20"
                      value={neededPrice}
                      onChange={(e) => setNeededPrice(e.target.value)}
                    />
                  </div>
                </div>
                <button className="btn btn-primary w-full" onClick={calculatePriceToWeight}>
                  {t.calc_btn}
                </button>
              </div>
              {result && (
                <div className="calc-result">
                  <Weight size={24} className="result-icon" />
                  <div>
                    <span className="result-label">{t.needed_weight}:</span>
                    <div className="result-value">{result.value}</div>
                  </div>
                </div>
              )}
            </div>
          )}

          {mode === 'weightToPrice' && (
            <div className="mode-custom">
              <div className="calc-form">
                <div className="form-group">
                  <label className="label">{t.per_kg_price} (₹)</label>
                  <div className="input-with-icon">
                    <IndianRupee size={16} />
                    <input 
                      type="number" 
                      className="calc-input" 
                      placeholder="e.g. 50"
                      value={pricePerKg}
                      onChange={(e) => setPricePerKg(e.target.value)}
                    />
                  </div>
                </div>
                <div className="form-group">
                  <div className="flex justify-between items-center">
                    <label className="label">{t.needed_weight}</label>
                    <div className="unit-switch">
                      <button 
                        className={`unit-btn ${weightUnit === 'kg' ? 'active' : ''}`}
                        onClick={() => setWeightUnit('kg')}
                      >
                        {t.kg}
                      </button>
                      <button 
                        className={`unit-btn ${weightUnit === 'gm' ? 'active' : ''}`}
                        onClick={() => setWeightUnit('gm')}
                      >
                        {t.gm}
                      </button>
                    </div>
                  </div>
                  <div className="input-with-icon">
                    <Weight size={16} />
                    <input 
                      type="number" 
                      className="calc-input" 
                      placeholder={weightUnit === 'kg' ? "e.g. 1.5" : "e.g. 500"}
                      value={neededWeight}
                      onChange={(e) => setNeededWeight(e.target.value)}
                    />
                  </div>
                </div>
                <button className="btn btn-primary w-full" onClick={calculateWeightToPrice}>
                  {t.calc_btn}
                </button>
              </div>
              {result && (
                <div className="calc-result">
                  <IndianRupee size={24} className="result-icon" />
                  <div>
                    <span className="result-label">{t.total_price}:</span>
                    <div className="result-value">{result.value}</div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
        
        <div className="calc-footer">
           <button className="btn btn-ghost btn-sm" onClick={() => {
             setPricePerKg('');
             setNeededPrice('');
             setNeededWeight('');
             setResult(null);
             clear();
           }}>
             <RotateCcw size={14} /> Reset All
           </button>
        </div>
      </div>
    </div>
  );
};

export default Calculator;
