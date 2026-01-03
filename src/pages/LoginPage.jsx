import React from "react";
import LoginForm from "../components/LoginForm/LoginForm";
import Footer from "../components/MainFooter/MainFooter";
import LoginPageImage from "../assets/LoginPage.png"; // Import the image file

function About() {
  return (
    <div
      style={{
        backgroundImage: `url(${LoginPageImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center 80%",
        minHeight: "20vh",
      }}
    >
      <LoginForm />
      <Footer />
    </div>
  );
}

export default About;
