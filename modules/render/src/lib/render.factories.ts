import { InteractionHandlerPlugin } from '@rollthecloudinc/detour';
import { FormService, PageBuilderFacade } from '@rollthecloudinc/panels';
import { PersistService } from '@rollthecloudinc/refinery';
import { take, tap } from 'rxjs/operators';

export const interationHandlerFormSubmit = ({ pageBuilderFacade, formService, persistService }: { pageBuilderFacade: PageBuilderFacade, formService: FormService, persistService: PersistService }) => {
  return new InteractionHandlerPlugin<string>({ id: 'panels_form_submit', title: 'Submit Panels Form', handle: ({ handlerParams }) => {
    const formName = (handlerParams as any)?.name;
    pageBuilderFacade.getForm$(formName).pipe(
      tap(panelPageForm => {
        if(panelPageForm && formName && formName != null) {
          const data = formService.serializeForm(panelPageForm);
          console.log('Panel Page Form Data', data);
          if(panelPageForm.valid) {
            console.log('detected valid form persisting data');
            persistService.persist({ data, persistence: panelPageForm.persistence }).subscribe(() => {
              alert("Form Submitted");
            });
          } else {
            console.log('detected invalid form not procceding to persist');
          }
        }
      }),
      take(1)
    ).subscribe();
  } });
};

export const interationHandlerDialog = () => {
  return new InteractionHandlerPlugin<string>({ id: 'panels_dialog', title: 'Open Panels Dialog', handle: () => {} });
};