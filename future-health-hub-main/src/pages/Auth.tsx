import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Eye, EyeOff, Mail, Lock, User, ArrowLeft, Stethoscope, Heart, Phone, Calendar } from 'lucide-react';
import { z } from 'zod';
import bodycloneLogo from '@/assets/bodyclone-logo.jpg';
import { supabase } from '@/integrations/supabase/client';

const emailSchema = z.string().email('Please enter a valid email address');
const passwordSchema = z.string().min(6, 'Password must be at least 6 characters');
const nameSchema = z.string().min(2, 'Name must be at least 2 characters');
const ageSchema = z.number().min(1, 'Age must be at least 1').max(150, 'Please enter a valid age');
const phoneSchema = z.string().regex(/^\+?[1-9]\d{9,14}$/, 'Please enter a valid phone number (e.g., +919999999999)');

type AuthStep = 'form' | 'phone' | 'otp' | 'complete-signup' | 'forgot-password' | 'update-password';

const Auth = () => {
  const [searchParams] = useSearchParams();
  const defaultMode = searchParams.get('mode') === 'signup';
  const isPasswordReset = searchParams.get('mode') === 'reset';
  
  // Form state
  const [isSignUp, setIsSignUp] = useState(defaultMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState<'male' | 'female' | 'other'>('male');
  const [role, setRole] = useState<'patient' | 'doctor'>('patient');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string; name?: string; age?: string; phone?: string }>({});
  
  // OTP state
  const [authStep, setAuthStep] = useState<AuthStep>('form');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [resendTimer, setResendTimer] = useState(0);
  const [statusMessage, setStatusMessage] = useState('');
  const [verifiedPhone, setVerifiedPhone] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const { signIn, signUp: authSignUp, user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (user && !isPasswordReset) {
      navigate('/dashboard');
    }
    // Check if this is a password reset flow
    if (isPasswordReset) {
      setAuthStep('update-password');
    }
  }, [user, navigate, isPasswordReset]);

  // Resend timer countdown
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  const validateForm = () => {
    const newErrors: { email?: string; password?: string; name?: string; age?: string } = {};
    
    const emailResult = emailSchema.safeParse(email);
    if (!emailResult.success) {
      newErrors.email = emailResult.error.errors[0].message;
    }
    
    const passwordResult = passwordSchema.safeParse(password);
    if (!passwordResult.success) {
      newErrors.password = passwordResult.error.errors[0].message;
    }
    
    if (isSignUp || authStep === 'complete-signup') {
      const nameResult = nameSchema.safeParse(fullName);
      if (!nameResult.success) {
        newErrors.name = nameResult.error.errors[0].message;
      }
      
      const ageNum = parseInt(age);
      if (isNaN(ageNum)) {
        newErrors.age = 'Please enter a valid age';
      } else {
        const ageResult = ageSchema.safeParse(ageNum);
        if (!ageResult.success) {
          newErrors.age = ageResult.error.errors[0].message;
        }
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validatePhone = () => {
    const cleanPhone = phoneNumber.replace(/\s/g, '');
    const phoneResult = phoneSchema.safeParse(cleanPhone);
    if (!phoneResult.success) {
      setErrors({ phone: phoneResult.error.errors[0].message });
      return false;
    }
    setErrors({});
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    
    try {
      if (isSignUp) {
        const { error } = await authSignUp(email, password, fullName, role, parseInt(age), gender);
        if (error) {
          if (error.message.includes('already registered')) {
            toast({
              title: 'Account exists',
              description: 'This email is already registered. Please sign in instead.',
              variant: 'destructive'
            });
          } else {
            toast({
              title: 'Sign up failed',
              description: error.message,
              variant: 'destructive'
            });
          }
        } else {
          toast({
            title: 'Welcome to BodyClone!',
            description: 'Your account has been created successfully.'
          });
          navigate('/dashboard');
        }
      } else {
        const { error } = await signIn(email, password);
        if (error) {
          if (error.message.includes('Invalid login')) {
            toast({
              title: 'Invalid credentials',
              description: 'Please check your email and password.',
              variant: 'destructive'
            });
          } else {
            toast({
              title: 'Sign in failed',
              description: error.message,
              variant: 'destructive'
            });
          }
        } else {
          navigate('/dashboard');
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCompleteSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    setStatusMessage('Creating your account...');
    
    try {
      // Create user via verify-otp with userData
      const { data, error } = await supabase.functions.invoke('verify-otp', {
        body: { 
          dest: verifiedPhone,
          otp: 'already-verified', // We'll handle this differently
          userData: {
            email,
            password,
            fullName,
            role,
            age: parseInt(age),
            gender
          }
        }
      });

      // If that doesn't work, just do regular signup
      const { error: signupError } = await authSignUp(email, password, fullName, role, parseInt(age), gender);
      
      if (signupError) {
        toast({
          title: 'Signup failed',
          description: signupError.message,
          variant: 'destructive'
        });
      } else {
        toast({
          title: 'Welcome to BodyClone!',
          description: 'Your account has been created successfully.'
        });
        navigate('/dashboard');
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to create account. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
      setStatusMessage('');
    }
  };

  const handleSendOtp = async () => {
    if (!validatePhone()) return;
    
    setIsLoading(true);
    setStatusMessage('Sending OTP...');
    
    try {
      const { data, error } = await supabase.functions.invoke('send-otp', {
        body: { dest: phoneNumber.replace(/\s/g, '') }
      });
      
      if (error) {
        setStatusMessage(error.message || 'Could not send OTP');
        toast({
          title: 'Error',
          description: error.message || 'Could not send OTP',
          variant: 'destructive'
        });
      } else {
        setStatusMessage('OTP sent. Check your SMS.');
        setAuthStep('otp');
        setResendTimer(60);
        toast({
          title: 'OTP Sent',
          description: 'Please check your phone for the verification code.'
        });
      }
    } catch (error: any) {
      setStatusMessage('Network error');
      toast({
        title: 'Error',
        description: 'Network error. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otpCode || otpCode.length !== 6) {
      setStatusMessage('Please enter a valid 6-digit code');
      return;
    }
    
    setIsLoading(true);
    setStatusMessage('Verifying...');
    
    try {
      const { data, error } = await supabase.functions.invoke('verify-otp', {
        body: { dest: phoneNumber.replace(/\s/g, ''), otp: otpCode }
      });
      
      // Check for edge function errors or error in response body
      const errorMessage = error?.message || data?.error;
      
      if (errorMessage) {
        setStatusMessage(errorMessage);
        toast({
          title: 'Verification Failed',
          description: errorMessage,
          variant: 'destructive'
        });
        return;
      }
      
      if (data?.success) {
        setVerifiedPhone(phoneNumber.replace(/\s/g, ''));
        setOtpCode(''); // Clear OTP to prevent re-submission
        
        if (data.isNewUser) {
          // New user - need to complete signup
          setStatusMessage('Phone verified! Complete your registration.');
          setAuthStep('complete-signup');
          toast({
            title: 'Phone Verified',
            description: 'Please complete your registration to continue.'
          });
        } else {
          // Existing user - they need to sign in with email
          setStatusMessage('Phone verified! Please sign in with your email.');
          toast({
            title: 'Phone Verified',
            description: 'Please sign in with your email and password.'
          });
          setAuthStep('form');
          setIsSignUp(false);
        }
      } else {
        setStatusMessage('Verification failed. Please try again.');
        toast({
          title: 'Error',
          description: 'Verification failed. Please try again.',
          variant: 'destructive'
        });
      }
    } catch (error: any) {
      setStatusMessage('Network error');
      toast({
        title: 'Error',
        description: 'Network error. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendTimer > 0) return;
    await handleSendOtp();
  };

  const resetToForm = () => {
    setAuthStep('form');
    setPhoneNumber('');
    setOtpCode('');
    setStatusMessage('');
    setVerifiedPhone('');
    setNewPassword('');
    setConfirmPassword('');
  };

  const handleForgotPassword = async () => {
    const emailResult = emailSchema.safeParse(email);
    if (!emailResult.success) {
      setErrors({ email: emailResult.error.errors[0].message });
      return;
    }
    
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth?mode=reset`,
      });
      
      if (error) throw error;
      
      toast({
        title: 'Password reset email sent',
        description: 'Check your email for the password reset link.',
      });
      resetToForm();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to send password reset email.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdatePassword = async () => {
    if (newPassword.length < 6) {
      setErrors({ password: 'Password must be at least 6 characters' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrors({ password: 'Passwords do not match' });
      return;
    }
    
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });
      
      if (error) throw error;
      
      toast({
        title: 'Password updated',
        description: 'Your password has been changed successfully.',
      });
      navigate('/dashboard');
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update password.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Render forgot password screen
  if (authStep === 'forgot-password') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-5" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/20 rounded-full blur-3xl" />
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <Button
            variant="ghost"
            onClick={resetToForm}
            className="mb-6 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>

          <div className="glass-card rounded-2xl p-8 border border-primary/20">
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="absolute inset-0 bg-primary/30 blur-xl rounded-full" />
                <img src={bodycloneLogo} alt="BodyClone" className="w-16 h-16 rounded-xl relative z-10 border border-primary/30" />
              </div>
            </div>

            <h1 className="text-2xl font-heading font-bold text-center mb-2 gradient-text">
              Reset Password
            </h1>
            <p className="text-muted-foreground text-center mb-6">
              Enter your email to receive a password reset link
            </p>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="resetEmail">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="resetEmail"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 bg-background/50 border-primary/20 focus:border-primary"
                  />
                </div>
                {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
              </div>

              <Button
                variant="hero"
                size="lg"
                className="w-full"
                onClick={handleForgotPassword}
                disabled={isLoading}
              >
                {isLoading ? 'Sending...' : 'Send Reset Link'}
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  // Render update password screen
  if (authStep === 'update-password') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-5" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/20 rounded-full blur-3xl" />
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <div className="glass-card rounded-2xl p-8 border border-primary/20">
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="absolute inset-0 bg-primary/30 blur-xl rounded-full" />
                <img src={bodycloneLogo} alt="BodyClone" className="w-16 h-16 rounded-xl relative z-10 border border-primary/30" />
              </div>
            </div>

            <h1 className="text-2xl font-heading font-bold text-center mb-2 gradient-text">
              Set New Password
            </h1>
            <p className="text-muted-foreground text-center mb-6">
              Enter your new password below
            </p>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="newPassword"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter new password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="pl-10 pr-10 bg-background/50 border-primary/20 focus:border-primary"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pl-10 bg-background/50 border-primary/20 focus:border-primary"
                  />
                </div>
                {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
              </div>

              <Button
                variant="hero"
                size="lg"
                className="w-full"
                onClick={handleUpdatePassword}
                disabled={isLoading}
              >
                {isLoading ? 'Updating...' : 'Update Password'}
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  // Render phone input screen
  if (authStep === 'phone') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-5" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/20 rounded-full blur-3xl" />
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <Button
            variant="ghost"
            onClick={resetToForm}
            className="mb-6 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>

          <div className="glass-card rounded-2xl p-8 border border-primary/20">
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="absolute inset-0 bg-primary/30 blur-xl rounded-full" />
                <img src={bodycloneLogo} alt="BodyClone" className="w-16 h-16 rounded-xl relative z-10 border border-primary/30" />
              </div>
            </div>

            <h1 className="text-2xl font-heading font-bold text-center mb-2 gradient-text">
              Enter Phone Number
            </h1>
            <p className="text-muted-foreground text-center mb-6">
              We'll send you a verification code via SMS
            </p>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="phoneNumber">Phone Number</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="phoneNumber"
                    type="tel"
                    placeholder="+919999999999"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="pl-10 bg-background/50 border-primary/20 focus:border-primary"
                  />
                </div>
                <p className="text-xs text-muted-foreground">Include country code (e.g., +91 for India)</p>
                {errors.phone && <p className="text-sm text-destructive">{errors.phone}</p>}
              </div>

              {statusMessage && (
                <p className="text-sm text-center text-muted-foreground">{statusMessage}</p>
              )}

              <Button
                variant="hero"
                size="lg"
                className="w-full"
                onClick={handleSendOtp}
                disabled={isLoading}
              >
                {isLoading ? 'Sending...' : 'Send OTP'}
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  // Render OTP verification screen
  if (authStep === 'otp') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-5" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/20 rounded-full blur-3xl" />
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <Button
            variant="ghost"
            onClick={() => setAuthStep('phone')}
            className="mb-6 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>

          <div className="glass-card rounded-2xl p-8 border border-primary/20">
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="absolute inset-0 bg-primary/30 blur-xl rounded-full" />
                <img src={bodycloneLogo} alt="BodyClone" className="w-16 h-16 rounded-xl relative z-10 border border-primary/30" />
              </div>
            </div>

            <h1 className="text-2xl font-heading font-bold text-center mb-2 gradient-text">
              Enter OTP
            </h1>
            <p className="text-muted-foreground text-center mb-6">
              Enter the 6-digit code sent to {phoneNumber}
            </p>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="otpCode">Verification Code</Label>
                <Input
                  id="otpCode"
                  type="text"
                  placeholder="Enter 6-digit code"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="text-center text-2xl tracking-widest bg-background/50 border-primary/20 focus:border-primary"
                  maxLength={6}
                />
              </div>

              {statusMessage && (
                <p className="text-sm text-center text-muted-foreground">{statusMessage}</p>
              )}

              <Button
                variant="hero"
                size="lg"
                className="w-full"
                onClick={handleVerifyOtp}
                disabled={isLoading || otpCode.length !== 6}
              >
                {isLoading ? 'Verifying...' : 'Verify OTP'}
              </Button>

              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-2">
                  {resendTimer > 0 ? `Resend in ${resendTimer}s` : "Didn't receive the code?"}
                </p>
                <Button
                  variant="link"
                  className="text-primary"
                  onClick={handleResendOtp}
                  disabled={resendTimer > 0 || isLoading}
                >
                  Resend OTP
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  // Render complete signup form (after phone verification)
  if (authStep === 'complete-signup') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-5" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/20 rounded-full blur-3xl" />
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <Button
            variant="ghost"
            onClick={resetToForm}
            className="mb-6 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Start Over
          </Button>

          <div className="glass-card rounded-2xl p-8 border border-primary/20">
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="absolute inset-0 bg-primary/30 blur-xl rounded-full" />
                <img src={bodycloneLogo} alt="BodyClone" className="w-16 h-16 rounded-xl relative z-10 border border-primary/30" />
              </div>
            </div>

            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="w-2 h-2 rounded-full bg-green-500" />
              <span className="text-sm text-green-500">Phone Verified: {verifiedPhone}</span>
            </div>

            <h1 className="text-2xl font-heading font-bold text-center mb-2 gradient-text">
              Complete Registration
            </h1>
            <p className="text-muted-foreground text-center mb-6">
              Just a few more details to create your account
            </p>

            <form onSubmit={handleCompleteSignup} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="fullName"
                    type="text"
                    placeholder="Enter your name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="pl-10 bg-background/50 border-primary/20 focus:border-primary"
                  />
                </div>
                {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="age">Age</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="age"
                      type="number"
                      placeholder="Age"
                      value={age}
                      onChange={(e) => setAge(e.target.value)}
                      className="pl-10 bg-background/50 border-primary/20 focus:border-primary"
                      min={1}
                      max={150}
                    />
                  </div>
                  {errors.age && <p className="text-sm text-destructive">{errors.age}</p>}
                </div>

                <div className="space-y-2">
                  <Label>Gender</Label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value as 'male' | 'female' | 'other')}
                    className="w-full h-10 px-3 rounded-md bg-background/50 border border-primary/20 focus:border-primary text-foreground"
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>I am a</Label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setRole('patient')}
                    className={`p-4 rounded-xl border-2 transition-all duration-300 flex flex-col items-center gap-2 ${
                      role === 'patient'
                        ? 'border-primary bg-primary/10 shadow-glow-sm'
                        : 'border-primary/20 hover:border-primary/50'
                    }`}
                  >
                    <Heart className={`w-6 h-6 ${role === 'patient' ? 'text-primary' : 'text-muted-foreground'}`} />
                    <span className={role === 'patient' ? 'text-foreground' : 'text-muted-foreground'}>Patient</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole('doctor')}
                    className={`p-4 rounded-xl border-2 transition-all duration-300 flex flex-col items-center gap-2 ${
                      role === 'doctor'
                        ? 'border-primary bg-primary/10 shadow-glow-sm'
                        : 'border-primary/20 hover:border-primary/50'
                    }`}
                  >
                    <Stethoscope className={`w-6 h-6 ${role === 'doctor' ? 'text-primary' : 'text-muted-foreground'}`} />
                    <span className={role === 'doctor' ? 'text-foreground' : 'text-muted-foreground'}>Doctor</span>
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 bg-background/50 border-primary/20 focus:border-primary"
                  />
                </div>
                {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Create a password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10 bg-background/50 border-primary/20 focus:border-primary"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
              </div>

              {statusMessage && (
                <p className="text-sm text-center text-muted-foreground">{statusMessage}</p>
              )}

              <Button
                type="submit"
                variant="hero"
                size="lg"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? 'Creating Account...' : 'Create Account'}
              </Button>
            </form>
          </div>
        </motion.div>
      </div>
    );
  }

  // Main auth form
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/20 rounded-full blur-3xl" />
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        {/* Back button */}
        <Button
          variant="ghost"
          onClick={() => navigate('/')}
          className="mb-6 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Button>

        <div className="glass-card rounded-2xl p-8 border border-primary/20">
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/30 blur-xl rounded-full" />
              <img
                src={bodycloneLogo}
                alt="BodyClone"
                className="w-16 h-16 rounded-xl relative z-10 border border-primary/30"
              />
            </div>
          </div>

          <h1 className="text-2xl font-heading font-bold text-center mb-2 gradient-text">
            {isSignUp ? 'Create Account' : 'Welcome Back'}
          </h1>
          <p className="text-muted-foreground text-center mb-6">
            {isSignUp 
              ? 'Join BodyClone and take control of your health'
              : 'Sign in to access your health dashboard'
            }
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="fullName"
                      type="text"
                      placeholder="Enter your name"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="pl-10 bg-background/50 border-primary/20 focus:border-primary"
                    />
                  </div>
                  {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="age">Age</Label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="age"
                        type="number"
                        placeholder="Age"
                        value={age}
                        onChange={(e) => setAge(e.target.value)}
                        className="pl-10 bg-background/50 border-primary/20 focus:border-primary"
                        min={1}
                        max={150}
                      />
                    </div>
                    {errors.age && <p className="text-sm text-destructive">{errors.age}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label>Gender</Label>
                    <select
                      value={gender}
                      onChange={(e) => setGender(e.target.value as 'male' | 'female' | 'other')}
                      className="w-full h-10 px-3 rounded-md bg-background/50 border border-primary/20 focus:border-primary text-foreground"
                    >
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>I am a</Label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setRole('patient')}
                      className={`p-4 rounded-xl border-2 transition-all duration-300 flex flex-col items-center gap-2 ${
                        role === 'patient'
                          ? 'border-primary bg-primary/10 shadow-glow-sm'
                          : 'border-primary/20 hover:border-primary/50'
                      }`}
                    >
                      <Heart className={`w-6 h-6 ${role === 'patient' ? 'text-primary' : 'text-muted-foreground'}`} />
                      <span className={role === 'patient' ? 'text-foreground' : 'text-muted-foreground'}>Patient</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setRole('doctor')}
                      className={`p-4 rounded-xl border-2 transition-all duration-300 flex flex-col items-center gap-2 ${
                        role === 'doctor'
                          ? 'border-primary bg-primary/10 shadow-glow-sm'
                          : 'border-primary/20 hover:border-primary/50'
                      }`}
                    >
                      <Stethoscope className={`w-6 h-6 ${role === 'doctor' ? 'text-primary' : 'text-muted-foreground'}`} />
                      <span className={role === 'doctor' ? 'text-foreground' : 'text-muted-foreground'}>Doctor</span>
                    </button>
                  </div>
                </div>
              </>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 bg-background/50 border-primary/20 focus:border-primary"
                />
              </div>
              {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                {!isSignUp && (
                  <Button
                    type="button"
                    variant="link"
                    className="text-xs text-primary p-0 h-auto"
                    onClick={() => setAuthStep('forgot-password')}
                  >
                    Forgot password?
                  </Button>
                )}
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10 bg-background/50 border-primary/20 focus:border-primary"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
            </div>

            <Button
              type="submit"
              variant="hero"
              size="lg"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? 'Please wait...' : isSignUp ? 'Create Account' : 'Sign In'}
            </Button>
          </form>

          {/* OTP Login option */}
          <div className="mt-4">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-primary/20" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">Or</span>
              </div>
            </div>
            
            <Button
              variant="outline"
              size="lg"
              className="w-full mt-4"
              onClick={() => setAuthStep('phone')}
            >
              <Phone className="w-4 h-4 mr-2" />
              Continue with Phone OTP
            </Button>
          </div>

          <div className="mt-6 text-center">
            <p className="text-muted-foreground">
              {isSignUp ? 'Already have an account?' : "Don't have an account?"}
              <Button
                variant="link"
                className="text-primary ml-1"
                onClick={() => setIsSignUp(!isSignUp)}
              >
                {isSignUp ? 'Sign In' : 'Sign Up'}
              </Button>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Auth;
