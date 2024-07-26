import {
  patchState,
  signalStoreFeature,
  type,
  withHooks,
  withMethods,
  withState,
} from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { interval, pipe } from 'rxjs';
import { tap } from 'rxjs/operators';

export function withCountdown() {
  return signalStoreFeature(
    { state: type<{ timeInSeconds: number }>() },
    withState({
      timeStarted: new Date(),
      timeLeft: 180,
    }),
    withMethods((store) => {
      return {
        updateTimeLeft: rxMethod<unknown>(
          pipe(
            tap(() => {
              patchState(store, {
                timeLeft:
                  store.timeInSeconds() -
                  Math.floor(
                    (new Date().getTime() - store.timeStarted().getTime()) /
                      1000,
                  ),
              });
            }),
          ),
        ),
      };
    }),
    withHooks((store) => {
      return {
        onInit() {
          store.updateTimeLeft(interval(1000));
        },
      };
    }),
  );
}
