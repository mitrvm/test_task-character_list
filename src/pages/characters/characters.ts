import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { IconComponent } from '../../shared/components/icon/icon.component';
import { GraphqlService } from '../../app/graphql.service';
import { Character } from '../../entities/character.entity';
import { FormsModule } from '@angular/forms';
import { Subject, debounceTime, distinctUntilChanged, catchError, of } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterModule, IconComponent, FormsModule],
  templateUrl: './characters.html',
  styleUrl: './characters.scss',
})
export class Characters implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private searchTerms = new Subject<string>();

  characters: Character[] = [];
  filteredCharacters: Character[] = [];
  searchTerm: string = '';
  genderFilter: string = 'all';
  sortDirection: 'asc' | 'desc' | null = null;

  constructor(
    private router: Router,
    private graphqlService: GraphqlService,
  ) {}

  ngOnInit(): void {
    this.loadCharacters();

    this.searchTerms
      .pipe(debounceTime(300), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe((term) => {
        this.searchTerm = term;
        this.loadCharacters();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadCharacters(): void {
    const filter: any = {};

    if (this.searchTerm.trim()) {
      filter.name = this.searchTerm;
    }

    if (this.genderFilter !== 'all') {
      filter.gender = this.genderFilter.charAt(0).toUpperCase() + this.genderFilter.slice(1);
    }

    this.graphqlService
      .getCharacters(1, filter)
      .pipe(
        catchError((error) => {
          console.error('Error fetching characters:', error);
          return of({ results: [], info: {} });
        }),
        takeUntil(this.destroy$),
      )
      .subscribe((response) => {
        this.characters = response.results || [];
        this.filteredCharacters = response.results || [];
      });
  }

  toggleSort(): void {
    if (this.sortDirection === null) {
      this.sortDirection = 'asc';
    } else if (this.sortDirection === 'asc') {
      this.sortDirection = 'desc';
    } else {
      this.sortDirection = null;
    }
    this.applyFilters();
  }

  applyFilters(): void {
    let result = [...this.characters];

    if (this.sortDirection !== null) {
      result.sort((a, b) => {
        const nameA = a.name.toLowerCase();
        const nameB = b.name.toLowerCase();

        if (nameA < nameB) {
          return this.sortDirection === 'asc' ? -1 : 1;
        }
        if (nameA > nameB) {
          return this.sortDirection === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }

    this.filteredCharacters = result;
  }

  search(term: string): void {
    this.searchTerms.next(term);
  }

  onSearch(): void {
    this.search(this.searchTerm);
  }

  onGenderFilterChange(): void {
    this.loadCharacters();
  }

  goToCharacterDetails(id: string) {
    this.router.navigate(['/character-details', id]);
  }

  getGenderIcon(gender: string): string {
    return gender === 'Male' ? 'male' : gender === 'Female' ? 'female' : 'unknown';
  }
}
