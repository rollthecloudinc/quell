import { InteractionHandlerPlugin } from '@rollthecloudinc/detour';
import { FormService, PageBuilderFacade } from '@rollthecloudinc/panels';
import { PersistService } from '@rollthecloudinc/refinery';
import { BehaviorSubject, timer } from 'rxjs';
import { filter, switchMap, take, takeUntil, tap } from 'rxjs/operators';
import { MatDialog } from '@angular/material/dialog';
import { RenderDialogComponent } from './components/render-dialog/render-dialog.component';

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

export const interationHandlerDialog = ({ dialog }: { dialog: MatDialog }) => {
  return new InteractionHandlerPlugin<string>({
    id: 'panels_dialog',
    title: 'Open Panels Dialog',
    handle: ({ handlerParams }: { handlerParams: { panelPageId?: string, title?: string, width?: string } }) => {
      // Extract optional parameters and set defaults
      const panelPageId = handlerParams?.panelPageId || '';
      const dialogTitle = handlerParams?.title || 'Panel Page'; // Default title
      const dialogWidth = handlerParams?.width || '800px'; // Default width

      // If no panelPageId is provided, log an error and exit early
      if (!panelPageId) {
        console.error('No Panel Page ID provided. Cannot open dialog.');
        return;
      }

      // Open the dialog with dynamic properties
      dialog.open(RenderDialogComponent, {
        width: dialogWidth, // Use dynamic or default width
        data: {
          panelPageId, // Pass the panel page ID
          title: dialogTitle, // Pass the title
        },
      });
    },
  });
};