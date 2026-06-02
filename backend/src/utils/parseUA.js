// Lightweight UA parser — no external dependency needed
export function parseUserAgent(ua = '') {
  const s = ua.toLowerCase();

  // Browser
  let browser = 'Unknown';
  if (s.includes('edg/'))        browser = 'Edge';
  else if (s.includes('opr/') || s.includes('opera')) browser = 'Opera';
  else if (s.includes('chrome') && !s.includes('chromium')) browser = 'Chrome';
  else if (s.includes('firefox')) browser = 'Firefox';
  else if (s.includes('safari') && !s.includes('chrome')) browser = 'Safari';
  else if (s.includes('msie') || s.includes('trident')) browser = 'IE';

  // OS
  let os = 'Unknown';
  if (s.includes('windows nt'))  os = 'Windows';
  else if (s.includes('mac os')) os = 'macOS';
  else if (s.includes('android')) os = 'Android';
  else if (s.includes('iphone') || s.includes('ipad')) os = 'iOS';
  else if (s.includes('linux'))  os = 'Linux';

  // Device type
  let device = 'Desktop';
  if (s.includes('mobile') || s.includes('iphone') || s.includes('android') && s.includes('mobile')) {
    device = 'Mobile';
  } else if (s.includes('ipad') || s.includes('tablet')) {
    device = 'Tablet';
  }

  return { browser, os, device };
}