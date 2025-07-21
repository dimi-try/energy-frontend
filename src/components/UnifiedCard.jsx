import React from "react";
import "./UnifiedCard.css";

const UnifiedCard = ({ children, className }) => {
  return (
    <div className={`unified-card ${className || ""}`}>
      {children}
    </div>
  );
};

export default UnifiedCard;