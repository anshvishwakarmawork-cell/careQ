import React from "react";
import { AppRouter } from "./app/router";
import { DevPill } from "./components/ui/DevPill";

function App() {
  return (
    <>
      <AppRouter />
      <DevPill />
    </>
  );
}

export default App;
