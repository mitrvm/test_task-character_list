import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { GraphqlService } from '../../app/graphql.service';
import { Character } from '../../entities/character.entity';
import { Subject, catchError, of } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

interface SeasonEpisodes {
  season: number;
  episodes: string[];
}

@Component({
  selector: 'app-character-details',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './character-details.html',
  styleUrl: './character-details.scss',
})
export class CharacterDetailsComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  character: Character | null = null;
  characterId: string | null = null;
  isStatusRevealed: boolean = false;
  isLoading: boolean = true;
  error: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private graphqlService: GraphqlService,
  ) {
    this.characterId = this.route.snapshot.paramMap.get('id');
  }

  ngOnInit(): void {
    if (this.characterId) {
      this.loadCharacter(this.characterId);
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadCharacter(id: string): void {
    this.isLoading = true;
    this.error = null;

    this.graphqlService
      .getCharacter(id)
      .pipe(
        catchError((error) => {
          console.error('Error fetching character:', error);
          this.error = 'Failed to load character details. Please try again.';
          return of(null);
        }),
        takeUntil(this.destroy$),
      )
      .subscribe({
        next: (character) => {
          this.character = character ?? null;
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error in subscription:', error);
          this.error = 'An unexpected error occurred.';
          this.isLoading = false;
        },
      });
  }

  toggleStatusSpoiler(): void {
    this.isStatusRevealed = !this.isStatusRevealed;
  }

  getSeasonEpisodes(): SeasonEpisodes[] {
    if (!this.character?.episode || this.character.episode.length === 0) {
      return [];
    }

    const seasons: { [key: number]: string[] } = {};

    this.character.episode.forEach((ep) => {
      const episodeCode = ep.episode; // S01E01
      const seasonMatch = episodeCode.match(/S(\d+)E\d+/i);

      if (seasonMatch) {
        const seasonNumber = parseInt(seasonMatch[1], 10);
        if (!seasons[seasonNumber]) {
          seasons[seasonNumber] = [];
        }
        seasons[seasonNumber].push(episodeCode);
      }
    });

    return Object.keys(seasons)
      .map((season) => ({
        season: parseInt(season, 10),
        episodes: seasons[parseInt(season, 10)],
      }))
      .sort((a, b) => a.season - b.season);
  }

  formatEpisodeList(episodes: string[]): string {
    const episodeNumbers = episodes.map((ep) => {
      const match = ep.match(/S\d+E(\d+)/i);
      if (match) {
        return String(parseInt(match[1], 10));
      }
      return ep;
    });

    return episodeNumbers.join(', ');
  }
}
