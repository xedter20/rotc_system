import { useState } from 'react';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { mdiAccount, mdiLockOutline, mdiEye, mdiEyeOff } from '@mdi/js';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';
import InputText from '../../components/Input/InputText';

function Login() {
  const INITIAL_LOGIN_OBJ = {
    password: '',
    emailId: ''
  };

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const formikConfig = {
    initialValues: {
      email: '',
      password: ''
    },
    validationSchema: Yup.object({
      email: Yup.string().email().required('Required field'),
      password: Yup.string()
        .min(8, 'Minimum of 8 characters')
        .required('Required field')
    }),
    onSubmit: async (values) => {
      try {
        const res = await axios.post('auth/login', values);
        const { token, data: user } = res.data;

        localStorage.setItem('token', token);
        localStorage.setItem('loggedInUser', JSON.stringify(user));
        window.location.href = '/app/dashboard';
      } catch {
        toast.error(`Login Failed. Unknown User.`, {
          position: 'top-right',
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          theme: 'light'
        });
      }
    }
  };

  return (
    <div className="flex flex-col-reverse md:flex-row-reverse min-h-screen">
      {/* Login Form */}
      <div className="w-full md:w-1/2 flex items-center justify-center bg-gray-50 p-6">
        <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg bg-gradient-to-r from-[#f1f0ec] to-[#f1f0ec]
          shadow-lg ">
          <h1 className="text-2xl font-bold text-center text-customGreen">Login</h1>
          <Formik {...formikConfig}>
            {({ values, handleBlur }) => (
              <Form className="space-y-4">
                <InputText
                  icons={mdiAccount}
                  label="Email"
                  labelColor="text-blue-950"
                  name="email"
                  type="email"
                  placeholder="Enter your email"
                  value={values.email}
                  onBlur={handleBlur}
                />
                <div className="relative">
                  <InputText
                    icons={mdiLockOutline}
                    labelColor="text-blue-950"
                    label="Password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={values.password}
                    onBlur={handleBlur}
                  />
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="absolute inset-y-0 right-3 flex items-center"
                  >
                    <svg
                      className="w-6 h-6 text-gray-500"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d={showPassword ? mdiEyeOff : mdiEye} />
                    </svg>
                  </button>
                </div>
                <div className="text-right">
                  <a
                    href="/forgot-password"
                    className="text-sm text-blue-600 hover:underline"
                  >
                    Forgot Password?
                  </a>
                </div>
                <button
                  type="submit"
                  className={`w-full py-2 text-white bg-customGreen rounded-lg ${loading ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                >
                  Sign in
                </button>
              </Form>
            )}
          </Formik>
        </div>
      </div>

      {/* Logo Section */}
      <div className="w-full md:w-1/2 flex flex-col items-center justify-center bg-customGreen p-6">
        <img
          src="/LOGO.png"
          alt="Logo"
          className="w-40 h-40 object-contain"
        />
        <p className="mt-4 text-white text-lg font-semibold text-center">
          ROTC Management Sytem
        </p>
      </div>

      <ToastContainer />
    </div>
  );
}

export default Login;
