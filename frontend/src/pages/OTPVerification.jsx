import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../store/useAuthStore.js';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useChatStore } from '../store/useChatStore.js';

const OTPVerification = () => {
  const [otp, setOtp] = useState(new Array(6).fill(''));
  const [timer, setTimer] = useState(30);
  const [isResendDisabled, setIsResendDisabled] = useState(true);

  const navigate = useNavigate();

  const { postUserOTP, authUser, isOtpPending, hasEnteredCorrectCredentials } = useAuthStore();

  const { getUsers } = useChatStore();

  // Handle timer countdown
  useEffect(() => {
    if (timer > 0) {
      const countdown = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(countdown);
    } else {
      setIsResendDisabled(false);
    }
  }, [timer]);

  // Handle OTP input
  const handleChange = (element, index) => {
    if (isNaN(element.value)) return;

    const newOtp = [...otp];
    newOtp[index] = element.value;
    setOtp(newOtp);

    if (element.value && index < 5) {
      document.getElementById(`otp-${index + 1}`).focus();
    }
  };

  // Handle backspace
  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      document.getElementById(`otp-${index - 1}`).focus();
    }
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    const otpCode = otp.join('');
    if (otpCode.length === 6) {
      const email = localStorage.getItem("email");
      const password = localStorage.getItem("password");
      const fullName = localStorage.getItem("fullName");
      console.log('OTP Submitted:', otpCode);
      console.log(`state of hasCurrentCredentials is : ${useAuthStore.getState().hasEnteredCorrectCredentials} `);
      postUserOTP(otpCode, email, fullName, password);
    }
  };

  // Handle resend OTP
  const handleResend = () => {
    setTimer(30);
    setIsResendDisabled(true);
    setOtp(new Array(6).fill(''));
    // Add your resend OTP logic here
  };

  return (
    <div className="min-h-screen bg-base-200 flex items-center justify-center p-4">
      <div className="card w-full max-w-md bg-base-100 shadow-xl">
        <div className="card-body">
          {/* Header */}
          <h1 className="text-3xl font-bold text-center text-base-content mb-2">
            OTP Verification
          </h1>
          <p className="text-center text-base-content/70 mb-6">
            Enter the 6-digit code sent to your email
          </p>

          {/* OTP Input Fields */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex justify-center gap-2 sm:gap-3">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  id={`otp-${index}`}
                  type="text"
                  maxLength="1"
                  value={digit}
                  onChange={(e) => handleChange(e.target, index)}
                  onKeyDown={(e) => handleKeyDown(e, index)}
                  className="input input-bordered w-12 h-14 text-center text-lg font-medium focus:input-primary transition-all"
                  aria-label={`OTP digit ${index + 1}`}
                />
              ))}
            </div>

            {/* Timer and Resend */}
            <div className="text-center">
              {timer > 0 ? (
                <p className="text-base-content/70">
                  Resend OTP in{' '}
                  <span className="text-primary font-medium">{timer}s</span>
                </p>
              ) : (
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={isResendDisabled}
                  className="btn btn-ghost text-primary hover:text-primary-focus disabled:text-base-content/30"
                >
                  Resend OTP
                </button>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={otp.join('').length !== 6}
              className="btn btn-primary w-full disabled:btn-disabled"
            >
              Verify OTP
            </button>
          </form>

          {/* Additional Info */}
        </div>
      </div>
    </div>
  );
};

export default OTPVerification;