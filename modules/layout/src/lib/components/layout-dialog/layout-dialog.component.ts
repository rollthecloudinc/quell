import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { LayoutPlugin } from '../../models/layout.models';
import { AttributeValue, ValueComputerService } from '@rollthecloudinc/attributes';

@Component({
  selector: 'druid-layout-dialog',
  templateUrl: './layout-dialog.component.html',
  styleUrls: ['./layout-dialog.component.scss']
})
export class LayoutDialogComponent implements OnInit {

  layout: LayoutPlugin;
  type: string;
  settingValues: Array<AttributeValue> = [];

  dialogForm = this.fb.group({
    layout: this.fb.control('')
  });

  get attrValues(): Array<AttributeValue> {
    return this.dialogForm.get('layout').value === '' ? this.settingValues : this.dialogForm.get('layout').value.settings.map(a => new AttributeValue(a));
  }

  constructor(
    @Inject(MAT_DIALOG_DATA) private data: { layout: LayoutPlugin; type: string; settingValues: Array<AttributeValue> },
    private dialogRef: MatDialogRef<LayoutDialogComponent>,
    private valueComputerService: ValueComputerService,
    private fb: FormBuilder
  ) {
  }

  ngOnInit(): void {
    this.layout = this.data.layout;
    this.type = this.data.type;
    this.settingValues = this.data.settingValues;
  }

  submit() {
    console.log(this.attrValues);
    const values = this.valueComputerService.compute(this.attrValues);
    this.dialogRef.close(values);
  }

}
