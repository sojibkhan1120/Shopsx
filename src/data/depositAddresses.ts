// Default TRON (TRC-20) Deposit Addresses
export const DEFAULT_DEPOSIT_ADDRESSES: string[] = [
  'TAXj5gzNPZo6AyCqVhKiBVSpgxe7LrWDvT', // Address 1
  'TAzn4PPRh15uE15ozX1XkXUdK5t8BmgC3Q', // Address 2
  'TAZixn8H8XJn7hFRapvcb6fjEK6B87GRLS', // Address 3
  'TAZBK3NoYQt43fR2GDG9oeLZskZgGafJKm', // Address 4
  'TAZE8HFpLXqRcus6xYsV9eyBvxw5LcLBhW', // Address 5
];

export const getDepositAddresses = (): string[] => {
  try {
    const saved = localStorage.getItem('mall_custom_deposit_addresses');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0 && parsed[0]?.trim()) {
        const cleaned = parsed.map((a: string) => String(a).trim()).filter((a: string) => a.length > 0);
        if (cleaned.length > 0) return cleaned;
      }
    }
  } catch (e) {
    console.error('Error reading custom deposit addresses:', e);
  }
  return DEFAULT_DEPOSIT_ADDRESSES;
};

export const saveDepositAddresses = async (addresses: string[]): Promise<boolean> => {
  try {
    const cleaned = addresses.map((a) => String(a).trim()).filter((a) => a.length > 0);
    const toSave = cleaned.length > 0 ? cleaned : DEFAULT_DEPOSIT_ADDRESSES;
    localStorage.setItem('mall_custom_deposit_addresses', JSON.stringify(toSave));
    window.dispatchEvent(new Event('deposit_addresses_updated'));

    // Persist to server backend
    await fetch('/api/system/deposit-addresses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ addresses: toSave }),
    });
    return true;
  } catch (e) {
    console.error('Error saving custom deposit addresses:', e);
    return false;
  }
};

// Initial background sync from backend
if (typeof window !== 'undefined') {
  fetch('/api/system/deposit-addresses')
    .then((res) => res.json())
    .then((data) => {
      if (data?.success && Array.isArray(data.addresses) && data.addresses.length > 0) {
        localStorage.setItem('mall_custom_deposit_addresses', JSON.stringify(data.addresses));
        window.dispatchEvent(new Event('deposit_addresses_updated'));
      }
    })
    .catch(() => {});
}

export const getNextDepositAddress = (): { address: string; index: number } => {
  const addrs = getDepositAddresses();
  const saved = localStorage.getItem('mall_deposit_addr_idx');
  const currentIndex = saved ? parseInt(saved, 10) % addrs.length : 0;
  const address = addrs[currentIndex] || addrs[0];
  const nextIndex = (currentIndex + 1) % addrs.length;
  localStorage.setItem('mall_deposit_addr_idx', nextIndex.toString());
  return { address, index: currentIndex + 1 };
};

export const getCurrentDepositAddress = (): { address: string; index: number } => {
  const addrs = getDepositAddresses();
  const saved = localStorage.getItem('mall_deposit_addr_idx');
  const currentIndex = saved ? parseInt(saved, 10) % addrs.length : 0;
  return { address: addrs[currentIndex] || addrs[0], index: currentIndex + 1 };
};

export const DEPOSIT_ADDRESSES: string[] = DEFAULT_DEPOSIT_ADDRESSES;
