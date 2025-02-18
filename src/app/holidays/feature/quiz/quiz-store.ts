import {
  patchState,
  signalStore,
  withComputed,
  withMethods,
  withState,
} from '@ngrx/signals';
import { AnswerStatus, Question } from '@app/holidays/feature/quiz/model';
import { computed } from '@angular/core';
import { assertDefined } from '@app/shared/util';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { pipe } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { QuizService } from '@app/holidays/feature/quiz/quiz.service';
import { inject } from '@angular/core';
import { tapResponse } from '@ngrx/operators';
import { withCountdown } from '@app/holidays/feature/quiz/with-countdown';

export const QuizStore = signalStore(
  { providedIn: 'root' },
  withState({
    title: '',
    questions: new Array<Question>(),
    timeInSeconds: 180,
    stable: true,
  }),
  withCountdown(),
  withMethods((store) => {
    const quizService = inject(QuizService);
    return {
      load: rxMethod<number>(
        pipe(
          switchMap((id) => quizService.findById(id)),
          tapResponse({
            next: (quiz) => {
              patchState(store, quiz);
            },
            error: console.error,
          }),
        ),
      ),
      answer(questionId: number, choiceId: number) {
        patchState(store, { stable: false });
        const question = store
          .questions()
          .find((question) => question.id === questionId);
        assertDefined(question);
        patchState(store, { stable: true });
        patchState(store, {
          questions: store.questions().map((question) => {
            if (question.id === questionId) {
              const status: AnswerStatus =
                question.answer === choiceId ? 'correct' : 'incorrect';
              return {
                ...question,
                status,
              };
            } else {
              return question;
            }
          }),
        });
      },
    };
  }),
  withComputed((state) => {
    return {
      status: computed(() => {
        const status: Record<AnswerStatus, number> = {
          unanswered: 0,
          correct: 0,
          incorrect: 0,
        };

        for (const question of state.questions()) {
          status[question.status]++;
        }

        return status;
      }),
    };
  }),
);
