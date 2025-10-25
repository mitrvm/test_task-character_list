import { Injectable, inject } from '@angular/core';
import { Apollo, gql } from 'apollo-angular';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Character, Episode, Location } from '../entities/character.entity';

interface CharacterFilter {
  name?: string;
  gender?: string;
  status?: string;
}

interface CharacterInfo {
  count: number;
  pages: number;
  next: number | null;
  prev: number | null;
}

interface CharacterResult {
  id: string;
  name: string;
  gender: string;
  image: string;
  status?: string;
  species?: string;
  origin?: Location;
  location?: Location;
  episode?: Episode[];
}

interface CharactersResponse {
  characters: {
    info: CharacterInfo;
    results: CharacterResult[];
  };
}

interface CharacterResponse {
  character: CharacterResult;
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
        origin {
          name
        }
        location {
          name
        }
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
      origin {
        name
      }
      location {
        name
      }
      episode {
        id
        name
        episode
      }
    }
  }
`;

@Injectable({ providedIn: 'root' })
export class GraphqlService {
  private apollo = inject(Apollo);

  getCharacters(
    page?: number,
    filter?: CharacterFilter,
  ): Observable<{ results: Character[]; info: CharacterInfo; loading: boolean }> {
    return this.apollo
      .watchQuery<CharactersResponse>({
        query: GET_CHARACTERS,
        variables: { page, filter: filter || {} },
        notifyOnNetworkStatusChange: true,
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(
        map(({ data, loading }) => ({
          results: (data?.characters?.results as Character[]) ?? [],
          info: {
            count: data?.characters?.info?.count ?? 0,
            pages: data?.characters?.info?.pages ?? 0,
            next: data?.characters?.info?.next ?? null,
            prev: data?.characters?.info?.prev ?? null,
          },
          loading,
        })),
      );
  }

  getCharacter(id: string) {
    return this.apollo
      .query<CharacterResponse>({
        query: GET_CHARACTER,
        variables: { id },
        fetchPolicy: 'network-only',
      })
      .pipe(map((res) => res.data?.character as Character | undefined));
  }
}
