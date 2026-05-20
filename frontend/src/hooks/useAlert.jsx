// useAlert.jsx
// Custom wrapper hook for context provider to useContext(AlertContext)

import { useContext } from "react";
import { AlertContext } from "../contexts/AlertContext";

const useAlert = () => useContext(AlertContext);
export default useAlert;