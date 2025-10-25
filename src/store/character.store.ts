import { Store, StoreConfig } from '@datorama/akita';
import { Character } from '../entities/character.entity';

export interface CharacterState {
  characters: Character[];
  selectedCharacter: Character | null;
  loading: boolean;
  error: string | null;
  currentPage: number;
  totalPages: number;
  hasMore: boolean;
  searchTerm: string;
  genderFilter: string;
}

const initialState: CharacterState = {
  characters: [],
  selectedCharacter: null,
  loading: false,
  error: null,
  currentPage: 1,
  totalPages: 1,
  hasMore: true,
  searchTerm: '',
  genderFilter: 'all',
};

@StoreConfig({ name: 'characters' })
export class CharacterStore extends Store<CharacterState> {
  constructor() {
    super(initialState);
  }
}

export const characterStore = new CharacterStore();
