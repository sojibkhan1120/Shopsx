export interface ClientGeoInfo {
  ip: string;
  city: string;
  country: string;
  locationString: string;
  device: string;
  browser: string;
  platform: string;
  timezone: string;
}

// Simple device detection
export function getDeviceInfo(): { device: string; browser: string; platform: string } {
  const ua = navigator.userAgent;
  let browser = 'Unknown Browser';
  let platform = 'Unknown OS';

  // Platform
  if (/windows/i.test(ua)) platform = 'Windows';
  else if (/android/i.test(ua)) platform = 'Android';
  else if (/iphone|ipad|ipod/i.test(ua)) platform = 'iOS (iPhone/iPad)';
  else if (/macintosh|mac os x/i.test(ua)) platform = 'macOS';
  else if (/linux/i.test(ua)) platform = 'Linux';

  // Browser
  if (/chrome|crios/i.test(ua) && !/edge|edg/i.test(ua) && !/opr\//i.test(ua)) {
    browser = 'Chrome';
  } else if (/safari/i.test(ua) && !/chrome|crios/i.test(ua)) {
    browser = 'Safari';
  } else if (/firefox|fxios/i.test(ua)) {
    browser = 'Firefox';
  } else if (/edg/i.test(ua)) {
    browser = 'Edge';
  } else if (/opr\//i.test(ua)) {
    browser = 'Opera';
  }

  const isMobile = /mobile|android|iphone|ipad/i.test(ua);
  const deviceType = isMobile ? 'Mobile' : 'Desktop/PC';

  return {
    device: `${deviceType} • ${platform}`,
    browser,
    platform,
  };
}

let cachedGeoInfo: ClientGeoInfo | null = null;

export async function detectClientGeo(): Promise<ClientGeoInfo> {
  if (cachedGeoInfo) {
    return cachedGeoInfo;
  }

  const deviceData = getDeviceInfo();
  const timezone = typeof Intl !== 'undefined' ? Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC' : 'UTC';
  const fallbackLocation = timezone.replace('_', ' ');

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 1500);

    const res = await fetch('/api/geo', {
      signal: controller.signal,
    }).catch(() => null);
    clearTimeout(timeoutId);

    if (res && res.ok) {
      const data = await res.json().catch(() => null);
      if (data && data.ip) {
        cachedGeoInfo = {
          ip: data.ip || '103.145.74.22',
          city: (data.location || '').split(',')[0] || 'Dhaka',
          country: (data.location || '').split(',')[1]?.trim() || 'Bangladesh',
          locationString: data.location || 'Dhaka, Bangladesh',
          device: data.device || deviceData.device,
          browser: deviceData.browser,
          platform: deviceData.platform,
          timezone,
        };
        return cachedGeoInfo;
      }
    }
  } catch (err) {
    console.log('GeoIP fallback:', err);
  }

  // Graceful fallback using timezone and browser locale
  cachedGeoInfo = {
    ip: '103.145.74.22',
    city: fallbackLocation.split('/')[1] || fallbackLocation,
    country: fallbackLocation.split('/')[0] || (typeof navigator !== 'undefined' ? navigator.language : 'US'),
    locationString: fallbackLocation,
    device: deviceData.device,
    browser: deviceData.browser,
    platform: deviceData.platform,
    timezone,
  };

  return cachedGeoInfo;
}
