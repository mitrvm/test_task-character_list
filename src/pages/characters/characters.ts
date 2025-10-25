import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { IconComponent } from '../../shared/components/icon/icon.component';
import { LoadingSectionComponent } from '../../shared/components/loading-section';
import { ErrorSectionComponent } from '../../shared/components/error-section';
import { GraphqlService } from '../../app/graphql.service';
import { Character } from '../../entities/character.entity';
import { FormsModule } from '@angular/forms';
import { Subject, debounceTime, distinctUntilChanged, catchError, of } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    RouterModule,
    IconComponent,
    LoadingSectionComponent,
    ErrorSectionComponent,
    FormsModule,
  ],
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

  currentPage: number = 1;
  totalPages: number = 1;
  isLoading: boolean = false;
  error: string | null = null;
  hasMore: boolean = true;
  displayedCount: number = 20;

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
        this.resetAndLoadCharacters();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  resetAndLoadCharacters(): void {
    this.currentPage = 1;
    this.characters = [];
    this.displayedCount = 20;
    this.hasMore = true;
    this.loadCharacters();
  }

  loadCharacters(): void {
    if (this.isLoading || !this.hasMore) return;

    this.isLoading = true;
    this.error = null;

    const filter: any = {};
    if (this.searchTerm.trim()) filter.name = this.searchTerm;
    if (this.genderFilter !== 'all')
      filter.gender = this.genderFilter.charAt(0).toUpperCase() + this.genderFilter.slice(1);

    this.graphqlService
      .getCharacters(this.currentPage, filter)
      .pipe(
        takeUntil(this.destroy$),
        catchError((err) => {
          this.error = `Ошибка при загрузке данных: ${err}`;
          this.isLoading = false;
          return of({ results: [], info: {}, loading: false });
        }),
      )
      .subscribe(({ results, info, loading }) => {
        this.isLoading = loading;
        if (loading) return;

        const newCharacters = results ?? [];
        this.totalPages = info?.pages ?? 1;
        this.hasMore = this.currentPage < this.totalPages;

        if (this.currentPage === 1) this.characters = newCharacters;
        else this.characters = [...this.characters, ...newCharacters];

        this.filteredCharacters = [...this.characters];
        this.applyFilters();
      });
  }

  showMore(): void {
    this.displayedCount += 20;
    this.applyFilters();
  }

  loadMore(): void {
    if (!this.isLoading && this.hasMore && this.displayedCount >= this.characters.length) {
      this.currentPage++;
      this.loadCharacters();
    } else if (this.displayedCount < this.characters.length) this.showMore();
  }

  @HostListener('window:scroll')
  onWindowScroll(): void {
    if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 200) this.loadMore();
  }

  toggleSort(): void {
    if (this.sortDirection === null) this.sortDirection = 'asc';
    else if (this.sortDirection === 'asc') this.sortDirection = 'desc';
    else this.sortDirection = null;

    this.applyFilters();
  }

  applyFilters(): void {
    let result = [...this.characters];

    // апишка не поддерживает сортировку на стороне сервера, поэтому пришлось на клиенте
    if (this.sortDirection !== null) {
      result.sort((a, b) => {
        const nameA = a.name.toLowerCase();
        const nameB = b.name.toLowerCase();

        if (nameA < nameB) return this.sortDirection === 'asc' ? -1 : 1;
        if (nameA > nameB) return this.sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
    }

    this.filteredCharacters = result.slice(0, this.displayedCount);
  }

  search(term: string): void {
    this.searchTerms.next(term);
  }

  onSearch(): void {
    this.search(this.searchTerm);
  }

  onGenderFilterChange(): void {
    this.resetAndLoadCharacters();
  }

  goToCharacterDetails(id: string) {
    this.router.navigate(['/character-details', id]);
  }

  getGenderIcon(gender: string): string {
    return gender === 'Male' ? 'male' : gender === 'Female' ? 'female' : 'unknown';
  }
}
