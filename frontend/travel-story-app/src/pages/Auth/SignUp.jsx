import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import PasswordInput from "../../cmponets/input/PasswordInput";
import { validateEmail } from "../../utils/Helper";
import axiosInstance from "../../utils/AxiosInstance";

const SignUp = () => {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);

  const handeleSignUp = async (e) => {
    e.preventDefault();

    // if (!validateEmail(email)) {
    //   console.log(email);
    //   setError("Please enter a valid email address.");
    //   return;
    // }

    if (!name) {
      setError("Please enter your name.");
      return;
    }
    if (!password) {
      console.log(222);
      setError("Please enter the password.");
      return;
    }
    setError("");
    console.log(1111);

    // SignUp API coll
    try {
      const responce = await axiosInstance.post("/create-account", {
        fullName: name,
        email: email,
        password: password,
      });
      
      // Handle successful login responce
      if (responce.data && responce.data.accessToken) {
        localStorage.setItem("token", responce.data.accessToken);
        navigate("/dashboard");
        // setError(responce.data.message)
      }
    } catch (error) {
      // Hendle Login Error
      console.log(error);
      if (
        error.responce &&
        error.responce.data &&
        error.responce.data.message
      ) {
        setError(error.responce.data.message);
      } else {
        setError("An unexpected eroor occurred. Please try again.");
      }
    }
  };
  return (
    <div className="h-screen bg-cyan-50 overflow-hidden relative">
      <div className="login-ui-box right-10 -top-100" />
      <div className="login-ui-box bg-cyan-200 -bottom-10 right-1/2" />

      <div className="container h-screen flex items-center justify-center px-20 mx-auto">
        <div className="w-2/4 h-[90vh] flex items-end bg-signup-bg-img bg-cover rounded-lg p-10 z-50">
          <div>
            <h4 className="text-5xl text-white font-semibold leading-[58px]">
              Join the <br /> Adventure
            </h4>
            <p className="text-[15px] text-white leading-6 pr-7 mt-4">
              Create an account to start documeting your travels and preserving
              your memories in your personal travel journal.
            </p>
          </div>
        </div>

        <div className="w-2/4 h-[75vh] bg-white rounded-r-lg relative p-16 shadow-cyan-200/20">
          <form onSubmit={handeleSignUp}>
            <h4 className="text-2xl font-semibold mb-7">SignUp</h4>

            <input
              type="text"
              placeholder="Full Name"
              className="input-box"
              value={name}
              onChange={({ target }) => {
                setName(target.value);
              }}
            />
            <input
              type="text"
              placeholder="Email"
              className="input-box"
              value={email}
              onChange={({ target }) => {
                setEmail(target.value);
              }}
            />

            <PasswordInput
              value={password}
              onChange={({ target }) => {
                setPassword(target.value);
              }}
            />
            {error && <p className="text-red-500 text-xs pb-1">{error}</p>}

            <button type="submit" className="but-primary">
              CREATE ACCOUNT
            </button>
            <p className="text-xs text-slate-500 text-center my-4">Or</p>

            <button
              type="submit"
              className="but-primary btn-login"
              onClick={() => {
                navigate("/login");
              }}
            >
              Login
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
