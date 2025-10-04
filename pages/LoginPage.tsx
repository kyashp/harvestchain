import React, { useState } from 'react';
import { UserType } from '../types';
import { Spinner } from '../components/ui/Spinner';

interface LoginPageProps {
  onLogin: (email: string, type: UserType) => void;
  isLoading: boolean;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLogin, isLoading }) => {
  const [userType, setUserType] = useState<UserType>(UserType.FISHERMAN);
  const [isRegister, setIsRegister] = useState(false);
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [cooperative, setCooperative] = useState('');
  const [company, setCompany] = useState('');
  const [location, setLocation] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [walletAddress, setWalletAddress] = useState('');
  const [file, setFile] = useState<File | null>(null);

  const [isRegistering, setIsRegistering] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setIsRegistering(true);
    try {
      await onLogin(emailOrPhone, userType, password, fullName);
    } catch (error: any) {
      setErrorMessage(error.message || 'Login failed');
    } finally {
      setIsRegistering(false);
    }
  };

  const handleFishermanRegister = async () => {
    setErrorMessage('');
    setIsRegistering(true);
    try {
      const response = await fetch('http://localhost:5000/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
          type: UserType.FISHERMAN,
          name: fullName,
        }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Registration failed');
      }
      // On success, log in the user
      await onLogin(email, UserType.FISHERMAN, password, fullName);
    } catch (error: any) {
      setErrorMessage(error.message || 'Registration failed');
    } finally {
      setIsRegistering(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const renderForm = () => {
    if (isRegister) {
      return (
        <div>
          <h3 className="text-xl font-semibold text-center text-gray-700 mb-6">
            Create an Account
          </h3>
          <div className="flex justify-center space-x-4 mb-6">
             <button onClick={() => setUserType(UserType.FISHERMAN)} className={`px-4 py-2 rounded-lg font-semibold transition ${userType === UserType.FISHERMAN ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}>
                I am a Fisherman
             </button>
             <button onClick={() => setUserType(UserType.BUYER)} className={`px-4 py-2 rounded-lg font-semibold transition ${userType === UserType.BUYER ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}>
                I am a Buyer
             </button>
          </div>
          {userType === UserType.FISHERMAN && (
             <>
                <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); handleFishermanRegister(); }}>
                  <input
                    type="text"
                    placeholder="Full Name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                  <input
                    type="email"
                    placeholder="Email (optional)"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                  <input
                    type="tel"
                    placeholder="Phone Number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                  <input
                    type="text"
                    placeholder="Cooperative"
                    value={cooperative}
                    onChange={(e) => setCooperative(e.target.value)}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                  <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                  <input
                    type="password"
                    placeholder="Confirm Password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                  <input
                    type="text"
                    placeholder="Wallet Address"
                    value={walletAddress}
                    onChange={(e) => setWalletAddress(e.target.value)}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Barangay Certificate or Fisherman License (PDF)</label>
                    <input
                      type="file"
                      accept="application/pdf"
                      onChange={handleFileChange}
                      required
                      className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                  </div>
                  <div className="relative my-4">
                    <div className="absolute inset-0 flex items-center" aria-hidden="true">
                      <div className="w-full border-t border-gray-300" />
                    </div>
                    <div className="relative flex justify-center">
                      <span className="bg-white px-2 text-sm text-gray-500">Or</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => alert('Philsys sign up flow not implemented')}
                    className="w-full flex justify-center py-3 px-4 border border-blue-600 rounded-md shadow-sm text-sm font-medium text-blue-600 hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Sign up with Philsys
                  </button>
                  <button
                    type="button"
                    disabled={isRegistering}
                    onClick={handleFishermanRegister}
                    className="w-full flex justify-center mt-4 py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300"
                  >
                    {isRegistering ? 'Registering...' : 'Create Fisherman Account'}
                  </button>
                </form>
             </>
          )}
           {userType === UserType.BUYER && (
             <form onSubmit={handleSubmit} className="space-y-4">
                <input
                  type="text"
                  placeholder="Full Name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
                <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
                <input
                  type="tel"
                  placeholder="Phone Number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
                <input
                  type="text"
                  placeholder="Company (optional)"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
                <input
                  type="text"
                  placeholder="Location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
                <input
                  type="password"
                  placeholder="Confirm Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
                <input
                  type="text"
                  placeholder="Wallet Address"
                  value={walletAddress}
                  onChange={(e) => setWalletAddress(e.target.value)}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
                <button
                  type="submit"
                  disabled={isRegistering}
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300"
                >
                  {isRegistering ? 'Registering...' : 'Create Buyer Account'}
                </button>
              </form>
          )}

        </div>
      );
    }
    return (
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <input
            type="text"
            value={emailOrPhone}
            onChange={(e) => setEmailOrPhone(e.target.value)}
            placeholder="Email or Phone Number"
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password (any)"
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
         <div className="flex justify-center space-x-4 mb-6">
             <button type="button" onClick={() => setUserType(UserType.FISHERMAN)} className={`px-4 py-2 rounded-lg font-semibold transition ${userType === UserType.FISHERMAN ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}>
                Fisherman Login
             </button>
             <button type="button" onClick={() => setUserType(UserType.BUYER)} className={`px-4 py-2 rounded-lg font-semibold transition ${userType === UserType.BUYER ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}>
                Buyer Login
             </button>
        </div>
        <div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300"
          >
            {isLoading ? <Spinner className="w-5 h-5 text-white" /> : 'Sign In'}
          </button>
        </div>
        {userType === UserType.FISHERMAN && (
          <button
            type="button"
            onClick={() => alert('Philsys sign in flow not implemented')}
            className="w-full flex justify-center mt-4 py-3 px-4 border border-blue-600 rounded-md shadow-sm text-sm font-medium text-blue-600 hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Sign in with Philsys
          </button>
        )}
      </form>
    );
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="flex justify-center">
            <img src="/fish.svg" alt="HarvestChain Logo" className="w-16 h-16" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            HarvestChain
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Financial Inclusion for Filipino Fisherfolk
          </p>
        </div>
        <div className="bg-white p-8 rounded-xl shadow-lg">
            <div className="text-center mb-6">
                <h3 className="text-lg font-medium text-gray-800">View a Demo Account</h3>
                <p className="text-sm text-gray-500 mt-1">See how the platform works with one click.</p>
                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <button onClick={() => onLogin('tom@harvestchain.com', UserType.FISHERMAN)} disabled={isLoading} className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300">
                        {isLoading ? <Spinner className="w-5 h-5"/> : 'Fisherman Demo'}
                    </button>
                    <button onClick={() => onLogin('buyer@globalfish.com', UserType.BUYER)} disabled={isLoading} className="w-full flex justify-center py-3 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-100">
                         {isLoading ? <Spinner className="w-5 h-5"/> : 'Buyer Demo'}
                    </button>
                </div>
            </div>

            <div className="relative my-6">
                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                    <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center">
                    <span className="bg-white px-2 text-sm text-gray-500">Or</span>
                </div>
            </div>
        
            <div className="flex border-b mb-6">
                <button onClick={() => setIsRegister(false)} className={`flex-1 py-2 text-center font-medium transition ${!isRegister ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'}`}>
                    Sign In
                </button>
                <button onClick={() => setIsRegister(true)} className={`flex-1 py-2 text-center font-medium transition ${isRegister ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'}`}>
                    Register
                </button>
            </div>
            {renderForm()}
        </div>
      </div>
    </div>
  );
};
