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

/** 1 is the combined "Ground + 1" option a customer picks in the app; everything above
 * that is a literal floor number. See Address.floor / Address.floorType. */
export function formatFloor(floor: number): string {
  return floor <= 1 ? 'Ground + 1' : `Floor ${floor}`;
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
