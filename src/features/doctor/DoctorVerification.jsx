import React from 'react';
import { useQueue } from '../../store/QueueContext';
import { ShieldAlert, Clock, CheckCircle, XCircle, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ACTIONS } from '../../store/actions';

export const DoctorVerification = () => {
  const { state, dispatch } = useQueue();
  const navigate = useNavigate();

  const doctor = state.doctors.find(d => d.id === state.currentUser?.id);
  const status = doctor?.verificationStatus || 'PENDING_VERIFICATION';

  const handleLogout = () => {
    dispatch({ type: ACTIONS.LOGOUT });
    navigate('/login');
  };

  const getStatusContent = () => {
    switch (status) {
      case 'PENDING_VERIFICATION':
        return {
          icon: <Clock className="h-16 w-16 text-yellow-500 mb-4" />,
          title: 'Verification Pending',
          message: 'Your registration has been submitted and is awaiting approval by the hospital administration. You will be able to access your dashboard once verified.',
          color: 'bg-yellow-50 border-yellow-200 text-yellow-800'
        };
      case 'CHANGES_REQUESTED':
        return {
          icon: <ShieldAlert className="h-16 w-16 text-orange-500 mb-4" />,
          title: 'Changes Requested',
          message: `The administration has requested changes to your registration: "${doctor?.changesMessage || 'Please update your details.'}"`,
          color: 'bg-orange-50 border-orange-200 text-orange-800',
          action: () => navigate('/register/doctor') // Directs back to registration form which should be pre-filled
        };
      case 'REJECTED':
        return {
          icon: <XCircle className="h-16 w-16 text-red-500 mb-4" />,
          title: 'Registration Rejected',
          message: `Your registration was not approved. Reason: "${doctor?.rejectReason || 'Does not meet hospital criteria.'}"`,
          color: 'bg-red-50 border-red-200 text-red-800'
        };
      case 'VERIFIED':
        return {
          icon: <CheckCircle className="h-16 w-16 text-green-500 mb-4" />,
          title: 'Verified Successfully',
          message: 'Your account has been verified. You can now access your dashboard.',
          color: 'bg-green-50 border-green-200 text-green-800',
          action: () => navigate('/doctor/dashboard'),
          actionText: 'Go to Dashboard'
        };
      default:
        return {
          icon: <Clock className="h-16 w-16 text-gray-500 mb-4" />,
          title: 'Checking Status',
          message: 'Loading your verification status...',
          color: 'bg-gray-50 border-gray-200 text-gray-800'
        };
    }
  };

  const content = getStatusContent();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          CareQueue
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Doctor Portal
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 text-center flex flex-col items-center">
          {content.icon}
          
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-2">
            {content.title}
          </h3>
          
          <div className={`mt-2 p-4 rounded-md border ${content.color} w-full text-sm mb-6`}>
            {content.message}
          </div>

          <div className="flex flex-col space-y-3 w-full">
            {content.action && (
              <button
                onClick={content.action}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                {content.actionText || 'Update Details'}
              </button>
            )}
            
            <button
              onClick={handleLogout}
              className="w-full flex justify-center items-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
