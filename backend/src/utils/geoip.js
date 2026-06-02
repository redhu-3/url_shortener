// Uses free ip-api.com (no key needed, 45 req/min for free tier)
// Falls back silently if unavailable
export async function getGeoInfo(ip) {
  // Skip private/local IPs
  if (!ip || ip === '::1' || ip.startsWith('127.') || ip.startsWith('192.168.') || ip.startsWith('10.')) {
    return { country: 'Local', city: 'Local' };
  }
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2000); // 2s timeout
    const res = await fetch(`http://ip-api.com/json/${ip}?fields=country,city,status`, {
      signal: controller.signal,
    });
    clearTimeout(timeout);
    if (!res.ok) return { country: 'Unknown', city: 'Unknown' };
    const data = await res.json();
    if (data.status !== 'success') return { country: 'Unknown', city: 'Unknown' };
    return { country: data.country || 'Unknown', city: data.city || 'Unknown' };
  } catch {
    return { country: 'Unknown', city: 'Unknown' };
  }
}