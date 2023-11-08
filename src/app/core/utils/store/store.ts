import { BehaviorSubject, Observable } from 'rxjs';

export class Store<T> {
  private initValue: T;
  private holder: BehaviorSubject<T>;
  /**
   * UNIX timestamp
   */
  private createdAt = 0;
  /**
   * N minutes after createdAt
   */
  private expire = 0;

  get value$(): Observable<T> {
    this.resetIfExpired();
    return this.holder.asObservable();
  }

  get value(): T {
    this.resetIfExpired();
    return this.holder.value;
  }

  set value(v: T) {
    this.updateDate();
    this.holder.next(v);
  }

  /**
   * Only for arrays
   */
  add(v: unknown) {
    if (Array.isArray(this.holder.value)) {
      this.updateDate();
      this.holder.next([...this.holder.value, v] as unknown as T);
    }
  }

  /**
   * Only for arrays
   */
  patchWithId(data: any) {
    if (Array.isArray(this.holder.value) && data.id) {
      this.holder.value.indexOf(data);
      this.holder.value.splice(
        this.holder.value.findIndex((x) => x.id === data.id),
        data,
      );
      this.holder.next(this.holder.value);
    }
  }

  constructor(initValue?: T, expire = 50) {
    this.initValue = initValue as unknown as T;
    this.holder = new BehaviorSubject<T>(this.initValue);
    this.expire = expire;
    this.updateDate();
  }

  // isExpired(): boolean {
  //   const check = (new Date().valueOf() - this.createdAt) / 60_000 >= this.expire;

  //   return check;
  // }

  /**
   * Sets the store to its default value (usually null or [])
   */
  reset() {
    this.value = this.initValue;
  }

  private resetIfExpired() {
    // TODO Improve
    // if (this.isExpired()) {
    //   this.reset();
    // }
  }

  private updateDate() {
    this.createdAt = new Date().valueOf();
  }
}
