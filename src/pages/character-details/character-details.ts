import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { GraphqlService } from '../../app/graphql.service';
import { Character, Episode } from '../../entities/character.entity';

interface SeasonEpisodes {
  season: number;
  episodes: string[];
}

@Component({
  selector: 'app-character-details',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './character-details.html',
  styleUrl: './character-details.scss',
})
export class CharacterDetailsComponent implements OnInit {
  character: Character | null = null;
  characterId: string | null = null;
  isStatusRevealed: boolean = false;

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

  loadCharacter(id: string): void {
    this.graphqlService.getCharacter(id).subscribe({
      next: (character) => {
        this.character = character || null;
      },
      error: (error) => {
        console.error('Error fetching character:', error);
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
