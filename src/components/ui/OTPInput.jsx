import React, { useRef, useState, useEffect } from "react";

export const OTPInput = ({ length = 6, value, onChange }) => {
  const inputs = useRef([]);
  const [otp, setOtp] = useState(new Array(length).fill(""));

  useEffect(() => {
    if (value) {
      setOtp(value.split("").slice(0, length));
    }
  }, [value, length]);

  const handleChange = (e, index) => {
    const val = e.target.value;
    if (isNaN(val)) return;

    const newOtp = [...otp];
    newOtp[index] = val.substring(val.length - 1);
    setOtp(newOtp);
    onChange(newOtp.join(""));

    if (val && index < length - 1) {
      inputs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputs.current[index - 1].focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData("text").slice(0, length).split("");
    const newOtp = [...otp];
    pasteData.forEach((char, i) => {
      if (!isNaN(char)) newOtp[i] = char;
    });
    setOtp(newOtp);
    onChange(newOtp.join(""));
    const nextFocus = Math.min(pasteData.length, length - 1);
    inputs.current[nextFocus].focus();
  };

  return (
    <div className="flex space-x-2 justify-center">
      {otp.map((data, index) => (
        <input
          key={index}
          type="text"
          inputMode="numeric"
          ref={el => inputs.current[index] = el}
          value={data}
          onChange={e => handleChange(e, index)}
          onKeyDown={e => handleKeyDown(e, index)}
          onPaste={handlePaste}
          className="w-12 h-14 text-center text-xl font-bold border border-gray-300 rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
          maxLength={1}
        />
      ))}
    </div>
  );
};
