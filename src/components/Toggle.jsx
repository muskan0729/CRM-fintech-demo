import React, { useEffect, useState } from "react";

const Toggle = ({ defaultChecked = false, onChange, disabled = false }) => {
  const [isChecked, setIsChecked] = useState(defaultChecked);

  useEffect(() => {
    setIsChecked(defaultChecked);
  }, [defaultChecked]);

  useEffect(() => {
    if (disabled && isChecked) {
      setIsChecked(false);
      if (onChange) onChange(false);
    }
  }, [disabled]);

  const handleToggle = () => {
    if (disabled) return;
    const newValue = !isChecked;
    setIsChecked(newValue);
    if (onChange) onChange(newValue);
  };

  return (
    <label
      className={`inline-flex items-center ${
        disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"
      }`}
    >
      <input
        type="checkbox"
        className="sr-only peer"
        checked={isChecked}
        onChange={handleToggle}
        disabled={disabled}
      />
      <div
        className={`relative w-9 h-5 bg-red-500 peer-focus:outline-none peer-focus:ring-green-300 rounded-full 
          peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full 
          peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] 
          after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full 
          after:h-4 after:w-4 after:transition-all peer-checked:bg-[#5bc783]`}
      ></div>
    </label>
  );
};

export default Toggle;
