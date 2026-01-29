import { InteractionHandlerPlugin } from '@rollthecloudinc/detour';
import { FormService, PageBuilderFacade } from '@rollthecloudinc/panels';
import { PersistService } from '@rollthecloudinc/refinery';
import { BehaviorSubject, timer } from 'rxjs';
import { filter, finalize, switchMap, take, takeUntil, tap } from 'rxjs/operators';
import { MatDialog } from '@angular/material/dialog';
import { RenderDialogComponent } from './components/render-dialog/render-dialog.component';
import { TransversePanelPageComponentService } from './services/transverse-panelpage-component.service';
import { RenderPaneComponent } from './components/panel-page/panel-page.component';
import { ComponentPortal } from '@angular/cdk/portal';
import { ConnectedPosition, Overlay } from '@angular/cdk/overlay';
import { Injector } from '@angular/core';
import { PopoverOverlayComponent } from './components/popover-overlay/popover-overlay.component';

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

export const interactionHandlerAnchoredDialog = ({ overlay, injector }: { overlay: Overlay, injector: Injector }) => {
  return new InteractionHandlerPlugin<string>({
    id: 'anchored_dialog',
    title: 'Open Anchored Dialog',
    handle: ({ handlerParams, evt }) => {
      const panelPageId = (handlerParams as any)?.panelPageId || '';
      const width = (handlerParams as any)?.width || '300px';
      const height = (handlerParams as any)?.height || '';
      const offsetX = parseInt((handlerParams as any)?.offsetX || '0', 10);
      const offsetY = parseInt((handlerParams as any)?.offsetY || '0', 10);
      const pos = (handlerParams as any)?.position || 'bottom_start';

      if (!panelPageId) {
        console.error('No Panel Page ID provided. Cannot open anchored dialog.');
        return;
      }

      const anchorElement = evt?.target;
      if (!anchorElement) {
        console.error('No anchor element found for anchored dialog.');
        return;
      }

      const positionMap: { [key: string]: ConnectedPosition } = {
        bottom_start: { originX: 'start', originY: 'bottom', overlayX: 'start', overlayY: 'top' },
        bottom_end:   { originX: 'end',   originY: 'bottom', overlayX: 'end',   overlayY: 'top' },
        top_start:    { originX: 'start', originY: 'top',    overlayX: 'start', overlayY: 'bottom' },
        top_end:      { originX: 'end',   originY: 'top',    overlayX: 'end',   overlayY: 'bottom' },
        right:        { originX: 'end',   originY: 'center', overlayX: 'start', overlayY: 'center' },
        left:         { originX: 'start', originY: 'center', overlayX: 'end',   overlayY: 'center' }
      };

      const primaryPosition = positionMap[pos] || positionMap['bottom_start'];

      const positionStrategy = overlay.position()
        .flexibleConnectedTo(anchorElement)
        .withPositions([primaryPosition])
        .withDefaultOffsetX(offsetX)
        .withDefaultOffsetY(offsetY)
        .withFlexibleDimensions(true)
        .withPush(true);

      const overlayRef = overlay.create({
        width,
        height,
        positionStrategy,
        hasBackdrop: true,
        backdropClass: 'cdk-overlay-transparent-backdrop',
        panelClass: 'anchored-dialog-panel'
      });

      const portal = new ComponentPortal(PopoverOverlayComponent, null, injector);
      const componentRef = overlayRef.attach(portal);

      componentRef.instance.data = {
        panelPageId,
        anchorElement
      };

      overlayRef.backdropClick().subscribe(() => overlayRef.dispose());
    },
  });
};