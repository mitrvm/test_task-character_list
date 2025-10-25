import { Component, OnInit, OnDestroy, computed, signal, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';
import { InfoItemComponent } from '../../shared/components/info-item';
import { LoadingSectionComponent } from '../../shared/components/loading-section';
import { ErrorSectionComponent } from '../../shared/components/error-section';
import { Character } from '../../entities/character.entity';
import { characterQuery } from '../../store/character.query';
import { CharacterService } from '../../store/character.service';

interface SeasonEpisodes {
  season: number;
  episodes: string[];
}

@Component({
  selector: 'app-character-details',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    InfoItemComponent,
    LoadingSectionComponent,
    ErrorSectionComponent,
  ],
  templateUrl: './character-details.html',
  styleUrl: './character-details.scss',
})
export class CharacterDetailsComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  character = signal<Character | null>(null);
  characterId: string | null = null;
  isStatusRevealed = signal(false);
  isLoading = signal(true);
  error = signal<string | null>(null);

  seasonEpisodes = computed(() => this.getSeasonEpisodes());

  private route = inject(ActivatedRoute);
  private characterService = inject(CharacterService);

  constructor() {
    this.characterId = this.route.snapshot.paramMap.get('id');
  }

  ngOnInit(): void {
    characterQuery.selectedCharacter$.pipe(takeUntil(this.destroy$)).subscribe((character) => {
      this.character.set(character);
    });
    characterQuery.loading$.pipe(takeUntil(this.destroy$)).subscribe((loading) => {
      this.isLoading.set(loading);
    });
    characterQuery.error$.pipe(takeUntil(this.destroy$)).subscribe((error) => {
      this.error.set(error);
    });

    if (this.characterId) this.loadCharacter(this.characterId);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadCharacter(id: string): void {
    this.characterService.loadCharacter(id);
  }

  toggleStatusSpoiler(): void {
    this.isStatusRevealed.update((value) => !value);
  }

  private getSeasonEpisodes(): SeasonEpisodes[] {
    const character = this.character();
    if (!character?.episode || character.episode.length === 0) return [];

    const seasons: { [key: number]: string[] } = {};
    character.episode.forEach((ep) => {
      const episodeCode = ep.episode; // S01E01
      const seasonMatch = episodeCode.match(/S(\d+)E\d+/i);

      if (seasonMatch) {
        const seasonNumber = parseInt(seasonMatch[1], 10);
        if (!seasons[seasonNumber]) seasons[seasonNumber] = [];
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
      if (match) return String(parseInt(match[1], 10));
      return ep;
    });

    return episodeNumbers.join(', ');
  }
}
