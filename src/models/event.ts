// Ported from alsaqr-meetup (https://github.com/AliA1997/alsaqr-meetup)
export interface EventRecord {
  id: number;
  slug: string;
  name: string;
  description: string;
  images: any[];
  groupId: number;
  groupName: string;
  citiesHosted: any[];
  distanceKm: number;
}
