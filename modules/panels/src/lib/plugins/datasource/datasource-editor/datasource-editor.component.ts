import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { AttributeSerializerService } from 'attributes';
import { Datasource } from 'datasource';
@Component({
  selector: 'classifieds-ui-datasource-editor',
  templateUrl: './datasource-editor.component.html',
  styleUrls: ['./datasource-editor.component.scss']
})
export class DatasourceEditorComponent implements OnInit {

  formGroup = this.fb.group({
    datasource: this.fb.control('')
  });

  constructor(
    private fb: FormBuilder,
    private attributeSerializer: AttributeSerializerService 
  ) { }

  ngOnInit(): void {
  }

  onSubmit() {
    const plugin = this.formGroup.value.datasource.plugin;
    const settings = this.attributeSerializer.serialize(this.formGroup.value.datasource.settings, 'settings');
    const datasource = new Datasource({ plugin, settings: settings.attributes });
    console.log(datasource);
  }

}
