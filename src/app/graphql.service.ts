import { Injectable, inject } from '@angular/core';
import { Apollo, gql } from 'apollo-angular';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Character } from '../entities/character.entity';

interface CharacterFilter {
  name?: string;
  gender?: string;
  status?: string;
}

const GET_CHARACTERS = gql`
  query GetCharacters($page: Int, $filter: FilterCharacter) {
    characters(page: $page, filter: $filter) {
      info {
        count
        pages
        next
        prev
      }
      results {
        id
        name
        gender
        image
        status
        species
        episode {
          id
          name
          episode
        }
      }
    }
  }
`;

const GET_CHARACTER = gql`
  query GetCharacter($id: ID!) {
    character(id: $id) {
      id
      name
      gender
      image
      status
      species
      episode {
        id
        name
        episode
      }
    }
  }
`;

@Injectable({
  providedIn: 'root',
})
export class GraphqlService {
  private apollo = inject(Apollo);

  getCharacters(
    page?: number,
    filter?: CharacterFilter,
  ): Observable<{ results: Character[]; info: any }> {
    return this.apollo
      .watchQuery<any>({
        query: GET_CHARACTERS,
        variables: {
          page,
          filter: filter || {},
        },
      })
      .valueChanges.pipe(
        map((result) => {
          return {
            results: result.data?.characters?.results || [],
            info: result.data?.characters?.info,
          };
        }),
      );
  }

  getCharacter(id: string): Observable<Character | undefined> {
    return this.apollo
      .watchQuery<any>({
        query: GET_CHARACTER,
        variables: { id },
      })
      .valueChanges.pipe(map((result) => result.data?.character));
  }
}
