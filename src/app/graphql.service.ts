import { Injectable, inject } from '@angular/core';
import { Apollo, gql } from 'apollo-angular';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Character } from '../entities/character.entity';

// GraphQL query to fetch characters
const GET_CHARACTERS = gql`
  query GetCharacters {
    characters {
      results {
        id
        name
        gender
        image
        status
        species
      }
    }
  }
`;

// GraphQL query to fetch a single character by ID
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

  getCharacters(): Observable<Character[]> {
    return this.apollo
      .watchQuery<any>({
        query: GET_CHARACTERS,
      })
      .valueChanges.pipe(map((result) => result.data?.characters?.results || []));
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
