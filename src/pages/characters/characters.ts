import { Component, OnInit } from '@angular/core';
import { Router, RouterLink, RouterModule } from '@angular/router';
import { IconComponent } from '../../shared/components/icon/icon.component';
import { GraphqlService } from '../../app/graphql.service';
import { Character } from '../../entities/character.entity';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterModule, IconComponent],
  templateUrl: './characters.html',
  styleUrl: './characters.scss',
})
export class Characters implements OnInit {
  characters: Character[] = [];

  constructor(
    private router: Router,
    private graphqlService: GraphqlService,
  ) {}

  ngOnInit(): void {
    this.loadCharacters();
  }

  loadCharacters(): void {
    this.graphqlService.getCharacters().subscribe({
      next: (characters) => {
        this.characters = characters || [];
      },
      error: (error) => {
        console.error('Error fetching characters:', error);
      },
    });
  }

  goToCharacterDetails(id: string) {
    this.router.navigate(['/character-details', id]);
  }

  getGenderIcon(gender: string): string {
    return gender === 'Male' ? 'male' : gender === 'Female' ? 'female' : 'unknown';
  }
}
