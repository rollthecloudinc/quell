import { Component, Inject, OnInit } from "@angular/core";
import { UntypedFormArray, UntypedFormBuilder, FormControl, UntypedFormGroup, FormGroup } from "@angular/forms";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { AttributeSerializerService } from "@rollthecloudinc/attributes";
import { InlineContext } from "@rollthecloudinc/context";
import { Sidenav } from "../../../models/plugin.models";

@Component({
  selector: "druid-sidenav-panel-editor",
  templateUrl: "./sidenav-panel-editor.component.html",
  styleUrls: ["./sidenav-panel-editor.component.scss"],
  standalone: false
})
export class SidenavPanelEditorComponent implements OnInit {

  contentForm = new FormGroup({
    width: new FormControl<number | null>(null),
    mode: new FormControl<'side' | 'push' | 'over'>('side'),
    position: new FormControl<'start' | 'end'>('start'),
    opened: new FormControl<boolean>(true)
  });

  sidenav: Sidenav;

  constructor(
    @Inject(MAT_DIALOG_DATA) private data: {
      panelFormGroup: UntypedFormGroup;
      contexts: Array<InlineContext>;
    },
    private dialogRef: MatDialogRef<SidenavPanelEditorComponent>,
    private fb: UntypedFormBuilder,
    private attributeSerializer: AttributeSerializerService
  ) {}

  ngOnInit(): void {
    const settings = this.data.panelFormGroup.get("settings").value;
    this.sidenav = this.toObject(settings);

    // load object → form
    this.contentForm.patchValue(this.sidenav);
  }

  // Convert settings array → QSidenav object
  toObject(settings: any[]): Sidenav {
    const raw = this.attributeSerializer.deserializeAsObject(settings)
    return new Sidenav(raw as Partial<Sidenav>);
  }

  // Convert QSidenav → settings array
  buildSettings(obj: Sidenav) {
    return this.attributeSerializer.serialize(obj, "root").attributes;
  }

  onSubmit() {
    const settingsArray = this.data.panelFormGroup.get("settings") as UntypedFormArray;
    settingsArray.clear();

    const sidenav = new Sidenav(this.contentForm.value);

    // Write new settings (same as TabsPanelEditor)
    this.buildSettings(sidenav).forEach(a => {
      settingsArray.push(this.attributeSerializer.convertToGroup(a));
    });

    this.dialogRef.close();
  }
}