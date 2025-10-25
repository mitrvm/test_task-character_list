import { Component, OnInit, OnDestroy, HostListener, computed, signal } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { IconComponent } from '../../shared/components/icon/icon.component';
import { LoadingSectionComponent } from '../../shared/components/loading-section';
import { ErrorSectionComponent } from '../../shared/components/error-section';
import { Character } from '../../entities/character.entity';
import { FormsModule } from '@angular/forms';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';
import { characterQuery } from '../../store/character.query';
import { CharacterService } from '../../store/character.service';

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

  characters = signal<Character[]>([]);
  filteredCharacters = signal<Character[]>([]);
  searchTerm = signal<string>('');
  genderFilter = signal<string>('all');
  sortDirection = signal<'asc' | 'desc' | null>(null);

  currentPage = signal<number>(1);
  totalPages = signal<number>(1);
  isLoading = signal<boolean>(false);
  error = signal<string | null>(null);
  hasMore = signal<boolean>(true);
  displayedCount = signal<number>(20);

  sortedAndFilteredCharacters = computed(() => {
    const characters = this.characters();
    const sortDir = this.sortDirection();
    const count = this.displayedCount();

    let result = [...characters];

    // апишка не поддерживает сортировку на стороне сервера, поэтому пришлось на клиенте
    if (sortDir !== null) {
      result.sort((a, b) => {
        const nameA = a.name.toLowerCase();
        const nameB = b.name.toLowerCase();
        if (nameA < nameB) return sortDir === 'asc' ? -1 : 1;
        if (nameA > nameB) return sortDir === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return result.slice(0, count);
  });

  constructor(
    private router: Router,
    private characterService: CharacterService,
  ) {}

  ngOnInit(): void {
    characterQuery.characters$.pipe(takeUntil(this.destroy$)).subscribe((characters) => {
      this.characters.set(characters);
      this.filteredCharacters.set([...characters]);
      this.applyFilters();
    });

    characterQuery.loading$.pipe(takeUntil(this.destroy$)).subscribe((loading) => {
      this.isLoading.set(loading);
    });
    characterQuery.error$.pipe(takeUntil(this.destroy$)).subscribe((error) => {
      this.error.set(error);
    });
    characterQuery.currentPage$.pipe(takeUntil(this.destroy$)).subscribe((page) => {
      this.currentPage.set(page);
    });
    characterQuery.totalPages$.pipe(takeUntil(this.destroy$)).subscribe((pages) => {
      this.totalPages.set(pages);
    });
    characterQuery.hasMore$.pipe(takeUntil(this.destroy$)).subscribe((hasMore) => {
      this.hasMore.set(hasMore);
    });
    characterQuery.searchTerm$.pipe(takeUntil(this.destroy$)).subscribe((term) => {
      this.searchTerm.set(term);
    });
    characterQuery.genderFilter$.pipe(takeUntil(this.destroy$)).subscribe((filter) => {
      this.genderFilter.set(filter);
    });

    this.loadCharacters();

    this.searchTerms
      .pipe(debounceTime(300), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe((term) => {
        this.searchTerm.set(term);
        this.resetAndLoadCharacters();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  resetAndLoadCharacters(): void {
    this.characterService.resetCharacters();
    this.characterService.loadCharacters(1, this.searchTerm(), this.genderFilter());
  }

  loadCharacters(): void {
    if (this.isLoading() || !this.hasMore()) return;
    this.characterService.loadCharacters(
      this.currentPage(),
      this.searchTerm(),
      this.genderFilter(),
    );
  }

  showMore(): void {
    this.displayedCount.update((count) => count + 20);
    this.applyFilters();
  }

  loadMore(): void {
    if (!this.isLoading() && this.hasMore() && this.displayedCount() >= this.characters().length) {
      this.currentPage.update((page) => page + 1);
      this.loadCharacters();
    } else if (this.displayedCount() < this.characters().length) {
      this.showMore();
    }
  }

  @HostListener('window:scroll')
  onWindowScroll(): void {
    if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 200) {
      this.loadMore();
    }
  }

  toggleSort(): void {
    const currentDirection = this.sortDirection();
    if (currentDirection === null) this.sortDirection.set('asc');
    else if (currentDirection === 'asc') this.sortDirection.set('desc');
    else this.sortDirection.set(null);

    this.applyFilters();
  }

  applyFilters(): void {
    this.filteredCharacters.set(this.sortedAndFilteredCharacters());
  }
  search(term: string): void {
    this.searchTerms.next(term);
  }
  onSearch(): void {
    this.search(this.searchTerm());
  }
  onGenderFilterChange(): void {
    this.resetAndLoadCharacters();
  }

  goToCharacterDetails(id: string): void {
    this.router.navigate(['/character-details', id]);
  }

  getGenderIcon(gender: string): string {
    return gender === 'Male' ? 'male' : gender === 'Female' ? 'female' : 'unknown';
  }
}
