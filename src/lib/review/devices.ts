export const devices = [
  { id: 'phone', name: 'Mobile', width: 390, height: 844 },
  { id: 'tablet', name: 'Tablet', width: 820, height: 1180 },
  { id: 'desktop', name: 'Desktop', width: 1440, height: 1000 },
  { id: 'tabletop', name: 'Tabletop', width: 1920, height: 1080 }
] as const;
export type DeviceId = (typeof devices)[number]['id'];
