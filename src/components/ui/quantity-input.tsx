
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Minus } from "lucide-react";

interface QuantityInputProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  className?: string;
}

export function QuantityInput({ 
  value, 
  onChange, 
  min = 0.1, 
  max = 999999, 
  step = 0.5,
  className = ""
}: QuantityInputProps) {
  const [inputValue, setInputValue] = useState(value.toString());

  const handleIncrement = () => {
    const newValue = Math.min(value + step, max);
    onChange(newValue);
    setInputValue(newValue.toString());
  };

  const handleDecrement = () => {
    const newValue = Math.max(value - step, min);
    onChange(newValue);
    setInputValue(newValue.toString());
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputVal = e.target.value;
    setInputValue(inputVal);
    
    const numValue = parseFloat(inputVal);
    if (!isNaN(numValue) && numValue >= min && numValue <= max) {
      onChange(numValue);
    }
  };

  const handleInputBlur = () => {
    const numValue = parseFloat(inputValue);
    if (isNaN(numValue) || numValue < min || numValue > max) {
      setInputValue(value.toString());
    }
  };

  return (
    <div className={`flex items-center space-x-1 ${className}`}>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={handleDecrement}
        disabled={value <= min}
        className="h-8 w-8 p-0"
      >
        <Minus className="h-3 w-3" />
      </Button>
      
      <Input
        type="number"
        value={inputValue}
        onChange={handleInputChange}
        onBlur={handleInputBlur}
        step={step}
        min={min}
        max={max}
        className="w-20 text-center h-8"
      />
      
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={handleIncrement}
        disabled={value >= max}
        className="h-8 w-8 p-0"
      >
        <Plus className="h-3 w-3" />
      </Button>
    </div>
  );
}
