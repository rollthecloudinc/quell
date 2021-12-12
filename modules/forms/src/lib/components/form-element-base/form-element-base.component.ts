import { ControlContainer, FormArray, FormControl } from "@angular/forms";
import { AttributeSerializerService } from "attributes";
import { map, tap } from "rxjs/operators";

export abstract class FormElementBase {

  readonly formControl = new FormControl('');

  private readonly formControlValueChangesSub = this.formControl.valueChanges.pipe(
    tap(value => this.controlContainer.control.get('settings').setValue([ this.attributeSerializer.serialize(value, 'value') ]))
  ).subscribe();

  constructor(
    protected attributeSerializer: AttributeSerializerService,
    public controlContainer?: ControlContainer
  ) {}

}