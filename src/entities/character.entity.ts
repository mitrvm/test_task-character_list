export interface Episode {
  id: string;
  name: string;
  episode: string;
}

export interface Location {
  name: string;
}

export interface Character {
  id: string;
  name: string;
  gender: string;
  image: string;
  status?: string;
  species?: string;
  episode?: Episode[];
  origin?: Location;
  location?: Location;
}
