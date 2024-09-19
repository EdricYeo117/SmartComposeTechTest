import React from 'react';
import './Header.css'; 
import sgLogo from './resources/sg_logo.png';

const Header = () => {
  return (
    <div className="header">
      <img src={sgLogo} alt="SG Logo" className="header-logo" />
      <p className="header-text">
        An Official Website of the <strong>Singapore Government</strong>
      </p>
    </div>
  );
};

export default Header;
