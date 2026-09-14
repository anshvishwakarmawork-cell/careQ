import React from "react";
import { BrowserRouter } from "react-router-dom";
import { QueueProvider } from "../store/QueueStore";

export const Providers = ({ children }) => {
  return (
    <BrowserRouter>
      <QueueProvider>
        {children}
      </QueueProvider>
    </BrowserRouter>
  );
};
