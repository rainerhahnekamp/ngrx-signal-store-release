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
      _timeStarted: new Date(),
      timeLeft: 180,
    }),
    withMethods((store) => {
      return {
        _updateTimeLeft: rxMethod<unknown>(
          pipe(
            tap(() => {
              patchState(store, {
                timeLeft:
                  store.timeInSeconds() -
                  Math.floor(
                    (new Date().getTime() - store._timeStarted().getTime()) /
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
          store._updateTimeLeft(interval(1000));
        },
      };
    }),
  );
}
