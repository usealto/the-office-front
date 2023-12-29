import { NgModule } from '@angular/core';
import { StoreModule } from '@ngrx/store';

import { reducers } from './store/store.reducer';
import { ResolversService } from './resolvers/resolvers.service';

@NgModule({
  imports: [StoreModule.forRoot(reducers)],
  providers: [ResolversService],
})
export class CoreModule {}
