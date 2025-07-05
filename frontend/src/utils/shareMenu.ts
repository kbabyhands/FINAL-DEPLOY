export const shareViaText = (restaurantName?: string) => {
  // Use the backend URL from environment variable, but replace the API prefix with the frontend URL
  const backendUrl = import.meta.env.REACT_APP_BACKEND_URL || process.env.REACT_APP_BACKEND_URL;
  const menuUrl = backendUrl ? backendUrl.replace('/api', '') : `${window.location.origin}/`;
  const name = restaurantName || 'Our Menu';
  const message = `Check out ${name}'s digital menu! Visit: ${menuUrl}`;
  
  // Try to use Web Share API first (mobile-friendly) - text only
  if (navigator.share) {
    navigator.share({
      text: message
    }).catch(err => {
      console.log('Share failed:', err);
      // Fallback to SMS
      fallbackToSMS(message);
    });
  } else {
    // Fallback to SMS
    fallbackToSMS(message);
  }
};

const fallbackToSMS = (message: string) => {
  const encodedMessage = encodeURIComponent(message);
  const smsUrl = `sms:?body=${encodedMessage}`;
  window.open(smsUrl, '_self');
};