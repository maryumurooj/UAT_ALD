import React from "react";
import "./footer.module.css";

export const Footer = () => {
  return (
    <div className="footer">
      <div className="overlap-group">
        <div className="group">
          <img className="line" alt="Line" src="line-19.svg" />
          <img className="img" alt="Line" src="line-20.svg" />
          <img className="line-2" alt="Line" src="line-21.svg" />
          
         
          <div className="text-wrapper-2">Home</div>
          <div className="frame">
            <div className="text-wrapper-3">Index</div>
            <div className="text-wrapper-4">Judges</div>
            <div className="text-wrapper-5">Updates</div>
          </div>
          <div className="text-wrapper-6">Updates</div>
          <div className="text-wrapper-7">Help</div>
          <div className="text-wrapper-8">About</div>
          <div className="text-wrapper-9">Contacts</div>
          <div className="frame-2">
            <div className="text-wrapper-10">Articles</div>
            <div className="text-wrapper-11">Case Finder</div>
            <div className="text-wrapper-12">Case Info</div>
          </div>
          
        </div>
        <div className="text-wrapper-14">Statutes</div>
        <div className="frame-3">
          <div className="text-wrapper-10">9876543210</div>
          <div className="text-wrapper-15">sales@aldonline.in</div>
          <div className="text-wrapper-16">High Court, Gate no 5, Hyderabad.</div>
        </div>
      </div>
    </div>
  );
};

export default Footer;
