import { Query } from '@datorama/akita';
import { CharacterState, characterStore } from './character.store';

export class CharacterQuery extends Query<CharacterState> {
  characters$ = this.select((state) => state.characters);
  selectedCharacter$ = this.select((state) => state.selectedCharacter);
  loading$ = this.select((state) => state.loading);
  error$ = this.select((state) => state.error);
  currentPage$ = this.select((state) => state.currentPage);
  totalPages$ = this.select((state) => state.totalPages);
  hasMore$ = this.select((state) => state.hasMore);
  searchTerm$ = this.select((state) => state.searchTerm);
  genderFilter$ = this.select((state) => state.genderFilter);

  constructor(store: typeof characterStore) {
    super(store);
  }
}

export const characterQuery = new CharacterQuery(characterStore);
