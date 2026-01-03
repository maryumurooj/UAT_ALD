import React from "react";
import SignupForm from "../components/SignupForm/SignupForm";
import Footer from "../components/MainFooter/MainFooter";
import LoginPageImage from "../assets/LoginPage.png";

function Login() {
   return (


         <div
            style={{
              backgroundImage: `url(${LoginPageImage})`,
              backgroundSize: "cover",
              backgroundPosition: "center 80%",
              minHeight: "20vh",
            }}
          >
        <SignupForm/>
        <Footer/>
      </div>

  );
}

export default Login;