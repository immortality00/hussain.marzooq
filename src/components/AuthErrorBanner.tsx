import React, { useEffect, useState } from 'react';
import { XCircleIcon, ExclamationTriangleIcon, CheckCircleIcon, InformationCircleIcon } from '@heroicons/react/24/solid';

type Status = 'error' | 'warning' | 'success' | 'info';

interface AuthErrorBannerProps {
  message: string | null;
  status?: Status;
  onDismiss?: () => void;
  showDismiss?: boolean;
  autoHideDuration?: number;
}

/**
 * Component to display authentication-related messages
 * Used for showing errors, warnings, and success messages related to auth
 */
const AuthErrorBanner: React.FC<AuthErrorBannerProps> = ({
  message,
  status = 'error',
  onDismiss,
  showDismiss = true,
  autoHideDuration,
}) => {
  const [visible, setVisible] = useState<boolean>(!!message);

  useEffect(() => {
    setVisible(!!message);

    // Auto-hide the banner after specified duration
    if (message && autoHideDuration) {
      const timer = setTimeout(() => {
        setVisible(false);
        if (onDismiss) onDismiss();
      }, autoHideDuration);

      return () => clearTimeout(timer);
    }
  }, [message, autoHideDuration, onDismiss]);

  if (!visible || !message) return null;

  // Determine appropriate styling based on status
  const getBannerStyle = (): { bgColor: string; textColor: string; iconColor: string } => {
    switch (status) {
      case 'error':
        return {
          bgColor: 'bg-red-50',
          textColor: 'text-red-800',
          iconColor: 'text-red-600',
        };
      case 'warning':
        return {
          bgColor: 'bg-yellow-50',
          textColor: 'text-yellow-800',
          iconColor: 'text-yellow-600',
        };
      case 'success':
        return {
          bgColor: 'bg-green-50',
          textColor: 'text-green-800',
          iconColor: 'text-green-600',
        };
      case 'info':
        return {
          bgColor: 'bg-blue-50',
          textColor: 'text-blue-800',
          iconColor: 'text-blue-600',
        };
      default:
        return {
          bgColor: 'bg-gray-50',
          textColor: 'text-gray-800',
          iconColor: 'text-gray-600',
        };
    }
  };

  // Get the appropriate icon based on status
  const getIcon = (): React.ReactNode => {
    const { iconColor } = getBannerStyle();
    const className = `h-5 w-5 ${iconColor}`;

    switch (status) {
      case 'error':
        return <XCircleIcon className={className} aria-hidden="true" />;
      case 'warning':
        return <ExclamationTriangleIcon className={className} aria-hidden="true" />;
      case 'success':
        return <CheckCircleIcon className={className} aria-hidden="true" />;
      case 'info':
        return <InformationCircleIcon className={className} aria-hidden="true" />;
      default:
        return <InformationCircleIcon className={className} aria-hidden="true" />;
    }
  };

  const { bgColor, textColor } = getBannerStyle();

  return (
    <div className={`rounded-md p-4 ${bgColor} mb-4 shadow-sm`} role="alert">
      <div className="flex">
        <div className="flex-shrink-0">
          {getIcon()}
        </div>
        <div className="ml-3 flex-1">
          <p className={`text-sm font-medium ${textColor}`}>{message}</p>
        </div>
        {showDismiss && onDismiss && (
          <div className="pl-3">
            <button
              type="button"
              className={`inline-flex rounded-md ${bgColor} ${textColor} focus:outline-none focus:ring-2 focus:ring-offset-2`}
              onClick={() => {
                setVisible(false);
                onDismiss();
              }}
            >
              <span className="sr-only">Dismiss</span>
              <XCircleIcon className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthErrorBanner; 