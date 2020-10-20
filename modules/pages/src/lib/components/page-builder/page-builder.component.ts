import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';

@Component({
  selector: 'classifieds-ui-page-builder',
  templateUrl: './page-builder.component.html',
  styleUrls: ['./page-builder.component.scss']
})
export class PageBuilderComponent implements OnInit {

  section = '';

  pageForm = this.fb.group({
    name: this.fb.control(''),
    title: this.fb.control(''),
    contexts: this.fb.control(''),
    path: this.fb.control(''),
    rule: this.fb.control(''),
    content: this.fb.control('')
  });

  constructor(private fb: FormBuilder) { }

  ngOnInit(): void {
  }

  changeSection(section: string) {
    this.section = section;
  }

  onSubmit() {
    console.log(this.pageForm.value);
  }

}
