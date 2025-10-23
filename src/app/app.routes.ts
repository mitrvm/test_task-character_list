import { Routes } from '@angular/router';
import { Characters } from '../pages/characters/characters';
import { CharacterDetailsComponent } from '../pages/character-details/character-details';

export const routes: Routes = [
  { path: '', redirectTo: '/characters', pathMatch: 'full' },
  { path: 'characters', component: Characters },
  { path: 'character-details/:id', component: CharacterDetailsComponent },
  { path: '**', redirectTo: '/characters' },
];
