import { Component, Inject, OnInit } from '@angular/core';
import { UntypedFormArray, UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AttributeSerializerService } from '@rollthecloudinc/attributes';
import { Pane } from '@rollthecloudinc/panels';
import { InlineContext } from '@rollthecloudinc/context';
import { MenuContentHandler } from '../../../handlers/menu-content.handler';
import { Subject } from 'rxjs';
import { QMenu, MenuItem } from '../../../models/plugin.models';

@Component({
    selector: 'classifieds-ui-menu-editor',
    templateUrl: './menu-editor.component.html',
    styleUrls: ['./menu-editor.component.scss'],
    standalone: false
})
export class MenuEditorComponent implements OnInit {

  contentForm = this.fb.group({
    iconName: this.fb.control('', [ Validators.required ]),
    label: this.fb.control('', [ Validators.required ]),
    items: this.fb.array([])
  });

  get items(): UntypedFormArray {
    return this.contentForm.get('items') as UntypedFormArray;
  }

  menu: QMenu;

  constructor(
    @Inject(MAT_DIALOG_DATA) private dialogData: { panelFormGroup: UntypedFormGroup; pane: Pane; panelIndex: number; paneIndex: number; contexts: Array<InlineContext>; contentAdded: Subject<[number, number]> },
    private dialogRef: MatDialogRef<MenuEditorComponent>,
    private fb: UntypedFormBuilder,
    private attributeSerializer: AttributeSerializerService,
    private handler: MenuContentHandler
  ) { }

  ngOnInit(): void {

    // Editing existing menu
    if (this.dialogData.pane !== undefined) {
      this.handler.toObject(this.dialogData.pane.settings).subscribe((menu: QMenu) => {
        this.menu = menu;

        // Populate form fields
        if (menu.label) {
          this.contentForm.get('label').patchValue(menu.label);
        }

        if (menu.iconName) {
          this.contentForm.get('iconName').patchValue(menu.iconName);
        }

        // Populate menu items
        if (menu.items && menu.items.length > 0) {
          menu.items.forEach(item => this.addItem(item));
        }
      });
    }
  }

  createItemGroup(item?: MenuItem): UntypedFormGroup {
    return this.fb.group({
      iconName: new UntypedFormControl(item ? item.iconName : '', Validators.required),
      text: new UntypedFormControl(item ? item.text : '', Validators.required),
      action: new UntypedFormControl(item ? item.action : '')  // optional, no validators
    });
  }

  addItem(item?: MenuItem) {
    this.items.push(this.createItemGroup(item));
  }

  removeItem(index: number) {
    this.items.removeAt(index);
  }

  onSubmit() {
    let paneIndex: number;

    if (this.dialogData.paneIndex === undefined) {
      (this.dialogData.panelFormGroup.get('panes') as UntypedFormArray).push(this.fb.group({
        contentPlugin: new UntypedFormControl('menu'),
        name: new UntypedFormControl(''),
        label: new UntypedFormControl(''),
        rule: new UntypedFormControl(''),
        settings: new UntypedFormArray([])
      }));
      paneIndex = (this.dialogData.panelFormGroup.get('panes') as UntypedFormArray).length - 1;
    } else {
      paneIndex = this.dialogData.paneIndex;
    }

    // Build QMenu object from form
    const menu = new QMenu({
      label: this.contentForm.get('label').value,
      iconName: this.contentForm.get('iconName').value,
      items: this.items.controls.map(c => new MenuItem({
        iconName: c.get('iconName').value,
        text: c.get('text').value,
        action: c.get('action').value
      }))
    });

    const paneForm = (this.dialogData.panelFormGroup.get('panes') as UntypedFormArray).at(paneIndex);

    (paneForm.get('settings') as UntypedFormArray).clear();

    const controls = this.handler.buildSettings(menu).map(s => this.attributeSerializer.convertToGroup(s));
    controls.forEach(c => (paneForm.get('settings') as UntypedFormArray).push(c));

    this.dialogRef.close();
  }
}