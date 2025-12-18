import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import axios from 'axios';
import { API_BASE_URL } from '../config/api';
import swcLogo from '../assets/WIZNOVY.png';

const OTP_LENGTH = 6;
const RESEND_TIME = 120;

const VerifyOTP = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const inputRefs = useRef([]);

  const email = location.state?.email || '';

  const [otp, setOtp] = useState(new Array(OTP_LENGTH).fill(''));
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [resendLoading, setResendLoading] = useState(false);
  const [countdown, setCountdown] = useState(RESEND_TIME);
  const [canResend, setCanResend] = useState(false);

  /* =====================
     REDIRECT SAFETY
  ===================== */
  useEffect(() => {
    if (!email) {
      navigate('/forgot-password');
    }
  }, [email, navigate]);

  /* =====================
     COUNTDOWN TIMER
  ===================== */
  useEffect(() => {
    if (countdown <= 0) return;

    const timer = setTimeout(() => {
      setCountdown(prev => {
        if (prev === 1) setCanResend(true);
        return prev - 1;
      });
    }, 1000);

    return () => clearTimeout(timer);
  }, [countdown]);

  /* =====================
     OTP HANDLERS
  ===================== */
  const handleOtpChange = (index, value) => {
    if (!/^\d?$/.test(value)) return;

    const updatedOtp = [...otp];
    updatedOtp[index] = value;
    setOtp(updatedOtp);
    setMessage('');

    if (value && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const isOtpComplete = otp.every(d => d !== '');

  /* =====================
     VERIFY OTP
  ===================== */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isOtpComplete) return;

    setLoading(true);
    setMessage('');

    try {
      await axios.post(`${API_BASE_URL}/auth/verify-otp`, {
        email,
        otp: otp.join('')
      });

      navigate('/reset-password', {
        state: { email, otp: otp.join('') }
      });
    } catch (error) {
      setMessage(
        error.response?.data?.message ||
        'Invalid OTP. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  /* =====================
     RESEND OTP
  ===================== */
  const handleResendOtp = async () => {
    if (!canResend) return;

    setResendLoading(true);
    try {
      await axios.post(`${API_BASE_URL}/auth/forgotPass`, {
        email,
        role: 'ADMIN'
      });

      setMessage('New OTP has been sent to your email.');
      setCanResend(false);
      setCountdown(RESEND_TIME);
      setOtp(new Array(OTP_LENGTH).fill(''));
    } catch {
      setMessage('Failed to resend OTP. Please try again.');
    } finally {
      setResendLoading(false);
    }
  };

  /* =====================
     UI
  ===================== */
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#C4DAD2]">
      <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md mx-4">
        <div className="text-center mb-8">
          <img
            src={swcLogo}
            alt="Wiznovy Logo"
            className="w-36 h-36 mx-auto mt-4 mb-2 rounded-full object-cover"
          />
          <h2 className="text-3xl font-bold text-[#16423C]">Verify OTP</h2>
          <p className="text-gray-500 mt-2">Enter the 6-digit code sent to</p>
          <p className="text-[#16423C] font-medium">{email}</p>
        </div>

        {message && (
          <div
            className={`mb-4 p-3 rounded text-sm ${
              message.includes('sent')
                ? 'bg-green-100 text-green-700'
                : 'bg-red-100 text-red-700'
            }`}
          >
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex justify-center gap-2">
            {otp.map((digit, index) => (
              <input
                key={`otp-${index}`}
                ref={el => (inputRefs.current[index] = el)}
                type="text"
                inputMode="numeric"
                maxLength="1"
                className="w-12 h-12 text-center text-xl font-bold border-2 rounded-lg focus:border-[#16423C] focus:outline-none"
                value={digit}
                onChange={(e) => handleOtpChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                autoFocus={index === 0}
                aria-label={`OTP digit ${index + 1}`}
              />
            ))}
          </div>

          <button
            type="submit"
            disabled={loading || !isOtpComplete}
            className="w-full bg-[#16423C] hover:bg-[#C4DAD2] text-white font-semibold py-2 rounded-lg transition disabled:opacity-50"
          >
            {loading ? 'Verifying...' : 'Verify OTP'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600 mb-2">
            Didn’t receive the code?
          </p>

          {canResend ? (
            <button
              onClick={handleResendOtp}
              disabled={resendLoading}
              className="text-[#16423C] underline disabled:opacity-50"
            >
              {resendLoading ? 'Sending...' : 'Resend OTP'}
            </button>
          ) : (
            <p className="text-gray-500 text-sm">
              Resend OTP in{' '}
              <span className="font-semibold text-[#16423C]">
                {countdown}
              </span>{' '}
              seconds
            </p>
          )}
        </div>

        <div className="mt-6 text-center">
          <button
            onClick={() => navigate('/forgot-password')}
            className="flex items-center gap-2 text-[#16423C] mx-auto hover:text-[#C4DAD2]"
          >
            <ArrowLeft size={16} />
            Back to Email
          </button>
        </div>
      </div>
    </div>
  );
};

export default VerifyOTP;
