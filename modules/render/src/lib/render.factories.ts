import { InteractionHandlerPlugin } from '@rollthecloudinc/detour';
import { FormService, PageBuilderFacade } from '@rollthecloudinc/panels';
import { PersistService } from '@rollthecloudinc/refinery';
import { BehaviorSubject, timer } from 'rxjs';
import { filter, switchMap, take, takeUntil, tap } from 'rxjs/operators';

// Keeps track of throttle state per unique form
const formThrottleMap: Map<string, BehaviorSubject<boolean>> = new Map();

export const interationHandlerFormSubmit = ({ pageBuilderFacade, formService, persistService }: { 
  pageBuilderFacade: PageBuilderFacade, 
  formService: FormService, 
  persistService: PersistService 
}) => {
  return new InteractionHandlerPlugin<string>({
    id: 'panels_form_submit',
    title: 'Submit Panels Form',
    handle: ({ handlerParams }) => {
      const formName = (handlerParams as any)?.name;

      // Return early if no form name is provided
      if (!formName) {
        console.log('No form name provided. Ignoring submission request.');
        return;
      }

      // Initialize throttle BehaviorSubject for the form if it doesn't already exist
      if (!formThrottleMap.has(formName)) {
        formThrottleMap.set(formName, new BehaviorSubject<boolean>(true));
      }
      
      const throttle$ = formThrottleMap.get(formName);

      // Process only if form is not throttled
      if (!throttle$) return;

      throttle$.pipe(
        filter((canProcess) => canProcess), // Proceed only if not throttled
        takeUntil(timer(2000)), // Ensure subsequent throttles are ignored for 2 seconds
        switchMap(() => {
          // Mark form as throttled
          if (throttle$) throttle$.next(false);

          // After 2 seconds, re-enable processing
          timer(2000).subscribe(() => throttle$?.next(true));
          
          // Fetch and process the form
          return pageBuilderFacade.getForm$(formName).pipe(
            tap(panelPageForm => {
              if (panelPageForm && panelPageForm.valid) {
                const data = formService.serializeForm(panelPageForm);
                console.log('Panel Page Form Data:', data);

                persistService.persist({ data, persistence: panelPageForm.persistence }).subscribe(() => {
                  alert('Form Submitted');
                });
              } else {
                console.log('Form is invalid or unavailable, skipping processing.');
              }
            })
          );
        })
      ).subscribe({
        error: (err) => console.error('Error processing form submission:', err)
      });
    }
  });
};

export const interationHandlerDialog = () => {
  return new InteractionHandlerPlugin<string>({ id: 'panels_dialog', title: 'Open Panels Dialog', handle: () => {} });
};