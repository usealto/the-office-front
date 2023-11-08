import { Injectable } from '@angular/core';
import { Store } from 'src/app/core/utils/store/store';

@Injectable({ providedIn: 'root' })
export class LoadingStore {
  isLoading: Store<boolean> = new Store<boolean>(false);
  loaded = 0;
  maxLoad = 0;
}
