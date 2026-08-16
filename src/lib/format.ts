export function formatDate(value: string): string {
  const date = new Date(value.length <= 10 ? `${value}T00:00:00Z` : value);
  return new Intl.DateTimeFormat('en-IN', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'UTC' }).format(
    date,
  );
}

export function formatDateTime(value: string): string {
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
}

export function formatCurrency(value: string): string {
  const amount = Number(value);
  if (Number.isNaN(amount)) return value;
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(
    amount,
  );
}

export function formatFrequency(frequency: string): string {
  return frequency === 'alternate_days' ? 'Alternate days' : 'Daily';
}

/** 0 is the ground floor, 1 the first floor (both pay a plan's priceGroundPlusOne — see
 * Address.floorType), 2+ are literal floor numbers. */
export function formatFloor(floor: number): string {
  return floor === 0 ? 'Ground floor' : `Floor ${floor}`;
}

export function formatAddress(address: {
  lineHouse: string;
  lineStreet: string;
  landmark: string | null;
  city: string;
  state: string;
  pincode: string;
}): string {
  const parts = [address.lineHouse, address.lineStreet, address.landmark, address.city, address.state, address.pincode];
  return parts.filter(Boolean).join(', ');
}
