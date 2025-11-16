import React, { useState } from 'react';
import { axiosInstance } from "../../../../Axios";

const ResendForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');
    setIsError(false);

    try {
      await axiosInstance.post(
        '/admin/resend-forgot-password',
        { email },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      
      setMessage('Email xác thực đã được gửi thành công!');
      setEmail('');
    } catch (error) {
      setIsError(true);
      const errorMessage = error.response?.data?.message || 'Đã xảy ra lỗi trong quá trình xử lý.';
      if (errorMessage === 'Email không đúng!!!') {
        setMessage('Email không đúng!!!');
      } else if (errorMessage === 'Đã xảy ra lỗi trong quá trình xác thực.') {
        setMessage('Đã xảy ra lỗi trong quá trình xác thực.');
      } else if (errorMessage === 'Đã xảy ra lỗi khi gửi mail.') {
        setMessage('Đã xảy ra lỗi khi gửi mail.');
      } else {
        setMessage(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">
          Gửi lại email quên mật khẩu Admin
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label 
              htmlFor="email" 
              className="block text-sm font-medium text-gray-700"
            >
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Nhập email của bạn"
            />
          </div>

          {message && (
            <div 
              className={`p-3 rounded-md text-sm ${
                isError ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
              }`}
            >
              {message}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
              isLoading 
                ? 'bg-indigo-400 cursor-not-allowed' 
                : 'bg-indigo-600 hover:bg-indigo-700'
            } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
          >
            {isLoading ? (
              <span className="flex items-center">
                <svg 
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" 
                  xmlns="http://www.w3.org/2000/svg" 
                  fill="none" 
                  viewBox="0 0 24 24"
                >
                  <circle 
                    className="opacity-25" 
                    cx="12" 
                    cy="12" 
                    r="10" 
                    stroke="currentColor" 
                    strokeWidth="4"
                  ></circle>
                  <path 
                    className="opacity-75" 
                    fill="currentColor" 
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Đang xử lý...
              </span>
            ) : (
              'Gửi email xác thực'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResendForgotPassword;