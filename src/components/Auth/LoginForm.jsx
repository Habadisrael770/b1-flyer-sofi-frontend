import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { validateEmail } from '../../utils/validators';
import Button from '../UI/Button';
import Input from '../UI/Input';
import LoadingSpinner from '../UI/LoadingSpinner';
import toast from 'react-hot-toast';

const LoginForm = ({ onSuccess, switchToRegister }) => {
  const { login, isLoading, error } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    watch,
    setValue
  } = useForm({
    mode: 'onChange',
    defaultValues: {
      email: '',
      password: ''
    }
  });

  const onSubmit = async (data) => {
    try {
      const result = await login(data);
      if (result.success) {
        toast.success('התחברות מוצלחת! 🎉');
        if (onSuccess) onSuccess();
      }
    } catch (error) {
      toast.error(error.message || 'שגיאה בהתחברות');
    }
  };

  const handleGoogleLogin = async () => {
    window.location.href = '/api/auth/google';
  };

  const handleFacebookLogin = async () => {
    window.location.href = '/api/auth/facebook';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-md mx-auto"
    >
      <div className="bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            ברוך הבא בחזרה! 🚀
          </h1>
          <p className="text-gray-600">
            התחבר כדי להמשיך ליצור פלייר מדהימים
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Email Field */}
          <div>
            <Input
              label="כתובת מייל"
              type="email"
              {...register('email', {
                required: 'כתובת מייל נדרשת',
                validate: validateEmail
              })}
              error={errors.email?.message}
              placeholder="your@email.com"
              icon="✉️"
            />
          </div>

          {/* Password Field */}
          <div>
            <Input
              label="סיסמה"
              type={showPassword ? 'text' : 'password'}
              {...register('password', {
                required: 'סיסמה נדרשת',
                minLength: {
                  value: 8,
                  message: 'סיסמה חייבת להכיל לפחות 8 תווים'
                }
              })}
              error={errors.password?.message}
              placeholder="הכנס את הסיסמה שלך"
              icon="🔒"
              rightIcon={
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              }
            />
          </div>

          {/* Remember Me & Forgot Password */}
          <div className="flex items-center justify-between">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="mr-2 text-sm text-gray-600">זכור אותי</span>
            </label>
            <button
              type="button"
              onClick={() => window.location.href = '/forgot-password'}
              className="text-sm text-blue-600 hover:text-blue-500"
            >
              שכחת סיסמה?
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full"
            disabled={!isValid || isLoading}
          >
            {isLoading ? <LoadingSpinner size="sm" /> : 'התחבר'}
          </Button>
        </form>

        {/* Social Login */}
        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">או התחבר עם</span>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={handleGoogleLogin}
              className="w-full"
            >
              <img
                className="h-5 w-5 ml-2"
                src="https://www.google.com/favicon.ico"
                alt="Google"
              />
              Google
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handleFacebookLogin}
              className="w-full"
            >
              <img
                className="h-5 w-5 ml-2"
                src="https://www.facebook.com/favicon.ico"
                alt="Facebook"
              />
              Facebook
            </Button>
          </div>
        </div>

        {/* Switch to Register */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-600">
            אין לך חשבון עדיין?{' '}
            <button
              type="button"
              onClick={switchToRegister}
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              הירשם עכשיו חינם 🚀
            </button>
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default LoginForm;
