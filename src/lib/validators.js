export const validateName = (name) => {
  if (!name || name.trim().length === 0) return "Name is required.";
  return null;
};

export const validateMobile = (mobile) => {
  if (!mobile) return "Mobile number is required.";
  const regex = /^\+91\d{10}$/;
  if (!regex.test(mobile)) return "Enter a valid mobile number starting with +91 (e.g. +919876543210).";
  return null;
};

export const validateEmail = (email) => {
  if (!email) return "Email is required.";
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!regex.test(email)) return "Enter a valid email address.";
  return null;
};

export const validatePassword = (password) => {
  if (!password) return "Password is required.";
  if (password.length < 8) return "Password must be at least 8 characters.";
  if (!/\d/.test(password)) return "Password must contain at least one number.";
  return null;
};

export const validatePasswordMatch = (password, confirmPassword) => {
  if (password !== confirmPassword) return "Passwords do not match.";
  return null;
};

export const validateRequired = (value, fieldName = "This field") => {
  if (!value || (typeof value === "string" && value.trim().length === 0)) return `${fieldName} is required.`;
  return null;
};
