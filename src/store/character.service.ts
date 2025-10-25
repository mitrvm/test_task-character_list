import { Injectable } from '@angular/core';
import { characterStore } from './character.store';
import { characterQuery } from './character.query';
import { Character } from '../entities/character.entity';
import { GraphqlService } from '../app/graphql.service';

@Injectable({ providedIn: 'root' })
export class CharacterService {
  constructor(private graphqlService: GraphqlService) {}

  updateCharacters(characters: Character[], append = false) {
    const currentState = characterStore.getValue();
    const updatedCharacters = append ? [...currentState.characters, ...characters] : characters;

    characterStore.update({
      characters: updatedCharacters,
      loading: false,
    });
  }

  selectCharacter(character: Character) {
    characterStore.update({
      selectedCharacter: character,
    });
  }
  setLoading(loading: boolean) {
    characterStore.update({ loading });
  }
  setError(error: string | null) {
    characterStore.update({ error });
  }
  updatePagination(currentPage: number, totalPages: number, hasMore: boolean) {
    characterStore.update({ currentPage, totalPages, hasMore });
  }
  updateFilters(searchTerm: string, genderFilter: string) {
    characterStore.update({ searchTerm, genderFilter });
  }

  resetCharacters() {
    characterStore.update({
      characters: [],
      currentPage: 1,
      hasMore: true,
    });
  }

  loadCharacters(page?: number, searchTerm?: string, genderFilter?: string) {
    this.setLoading(true);
    this.setError(null);

    const filter: any = {};
    if (searchTerm?.trim()) filter.name = searchTerm;
    if (genderFilter && genderFilter !== 'all')
      filter.gender = genderFilter.charAt(0).toUpperCase() + genderFilter.slice(1);

    return this.graphqlService.getCharacters(page, filter).subscribe({
      next: ({ results, info, loading }) => {
        this.setLoading(loading);
        if (loading) return;

        const newCharacters = results ?? [];
        const currentPage = page || 1;
        const totalPages = info?.pages ?? 1;
        const hasMore = currentPage < totalPages;

        if (currentPage === 1) this.updateCharacters(newCharacters, false);
        else this.updateCharacters(newCharacters, true);

        this.updatePagination(currentPage, totalPages, hasMore);
        this.updateFilters(searchTerm || '', genderFilter || 'all');
      },
      error: (err) => {
        this.setError(`Error loading characters: ${err}`);
        this.setLoading(false);
      },
    });
  }

  loadCharacter(id: string) {
    this.setLoading(true);
    this.setError(null);

    return this.graphqlService.getCharacter(id).subscribe({
      next: (character) => {
        if (character) this.selectCharacter(character);
        this.setLoading(false);
      },
      error: (err) => {
        this.setError(`Error loading character: ${err}`);
        this.setLoading(false);
      },
    });
  }
}
