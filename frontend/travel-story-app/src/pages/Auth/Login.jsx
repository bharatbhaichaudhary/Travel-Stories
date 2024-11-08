import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import PasswordInput from "../../cmponets/input/PasswordInput";
import { validateEmail } from "../../utils/Helper";
import axiosInstance from "../../utils/AxiosInstance";

const Login = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);

  const handeleLogin = async (e) => {
    e.preventDefault();

    if (!validateEmail(email)) {
      console.log(email);
      setError("Please enter a valid email address.");
      return;
    }
    if (!password) {
      setError("Please enter the password.");
      return;
    }
    setError("");

    // Login API coll
    try {
      const responce = await axiosInstance.post("/login", {
        email: email,
        password: password,
      });
      // Handle successful login responce
      if (responce.data && responce.data.accessToken) {
        localStorage.setItem("token", responce.data.accessToken);
        navigate("/dashboard");
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
        <div className="w-2/4 h-[90vh] flex items-end bg-login-bg-img bg-cover rounded-lg p-10 z-50">
          <div>
            <h4 className="text-5xl text-white font-semibold leading-[58px]">
              Capture <br /> Journeys
            </h4>
            <p className="text-[15px] text-white leading-6 pr-7 mt-4">
              Record your travel experiennces and memories is your personal
              travel journal.
            </p>
          </div>
        </div>

        <div className="w-2/4 h-[75vh] bg-white rounded-r-lg relative p-16 shadow-cyan-200/20">
          <form onSubmit={handeleLogin}>
            <h4 className="text-2xl font-semibold mb-7">Login</h4>

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
              Login
            </button>
            <p className="text-xs text-slate-500 text-center my-4">Or</p>

            <button
              type="submit"
              className="but-primary btn-login"
              onClick={() => {
                navigate("/signUp");
              }}
            >
              CREATE ACCOUNT
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
