import { InteractionHandlerPlugin } from '@rollthecloudinc/detour';
import { FormService, PageBuilderFacade } from '@rollthecloudinc/panels';
import { PersistService } from '@rollthecloudinc/refinery';
import { BehaviorSubject, timer } from 'rxjs';
import { filter, finalize, switchMap, take, takeUntil, tap } from 'rxjs/operators';
import { MatDialog } from '@angular/material/dialog';
import { RenderDialogComponent } from './components/render-dialog/render-dialog.component';
import { TransversePanelPageComponentService } from './services/transverse-panelpage-component.service';
import { RenderPaneComponent } from './components/panel-page/panel-page.component';

// Keeps track of throttle state per unique form
const formThrottleMap: Map<string, boolean> = new Map();
const formProcessingMap: Map<string, boolean> = new Map();

export const interationHandlerFormSubmit = ({ pageBuilderFacade, formService, persistService, transversePanelpageComponentSvc }: { 
  pageBuilderFacade: PageBuilderFacade, 
  formService: FormService, 
  persistService: PersistService,
  transversePanelpageComponentSvc: TransversePanelPageComponentService
}) => {
  return new InteractionHandlerPlugin<string>({
    id: 'panels_form_submit',
    title: 'Submit Panels Form',
    handle: ({ handlerParams, panelPageComponent }) => {
      const formName = (handlerParams as any)?.name;

      // Return early if no form name is provided
      if (!formName) {
        console.log('No form name provided. Ignoring submission request.');
        return;
      }

      // Check if form is already being processed
      if (formProcessingMap.get(formName)) {
        console.log(`Form submission is already being processed for: ${formName}`);
        return;
      }

      // Apply throttle: Return if the form is within the 2-second throttle window
      if (formThrottleMap.get(formName)) {
        console.log(`Form submission for ${formName} is throttled. Try again later.`);
        return;
      }

      // Mark the form as in progress
      formProcessingMap.set(formName, true);

      console.log(`Processing form submission for: ${formName}`);

      pageBuilderFacade.getForm$(formName).pipe(
        take(1), // Take a single form at a time
        tap(panelPageForm => {
          if (!panelPageForm) {
            console.log(`Form ${formName} not found.`);
            return;
          }

          if (panelPageForm.valid) {
            const data = formService.serializeForm(panelPageForm);
            console.log('Panel Page Form Data:', data);

            persistService.persist({ data, persistence: panelPageForm.persistence }).subscribe({
              next: () => {
                console.log('Form Submitted successfully:', formName);
                alert('Form Submitted');
              },
              error: (err) => {
                console.error('Error persisting form: ', err);
              },
              complete: () => {
                console.log('Form submission complete for:', formName);
              }
            });
          } else {
            transversePanelpageComponentSvc.traverseAndVisit(panelPageComponent, component => {
              if (component instanceof RenderPaneComponent && component.componentRef && component.componentRef.instance && component.componentRef.instance.markAsTouched) {
                // console.log('marking as touched');
                component.componentRef.instance.markAsTouched();
              } else {
                // console.log('visiting component', component);
              }
            });
            console.log('Form is invalid or unavailable. Skipping processing for:', formName);
          }
        }),
        finalize(() => {
          // Reset processing state
          formProcessingMap.delete(formName);

          // Set throttle state
          formThrottleMap.set(formName, true);
          timer(2000).subscribe(() => {
            // Clear throttle after 2 seconds
            formThrottleMap.delete(formName);
          });

          console.log(`Throttle applied for form: ${formName}`);
        })
      ).subscribe({
        error: (err) => {
          console.error(`Error occurred during form submission for ${formName}:`, err);

          // Clean up on error
          formProcessingMap.delete(formName);
          formThrottleMap.delete(formName);
        }
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