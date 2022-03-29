import { Component } from "@angular/core";
import { ControlContainer } from "@angular/forms";
import { AttributeSerializerService } from '@ng-druid/attributes';
import { FilesService } from "@ng-druid/media";
import { NgxDropzoneChangeEvent } from "ngx-dropzone";
import { map, mergeMap, Subject, tap } from "rxjs";
import { FormElementBase } from "../../directives/form-element-base.directive";
import { OptionsResolverService } from '../../services/options-resolver.services';

@Component({
  selector: 'druid-forms-form-media',
  styleUrls: ['./form-media.component.scss'],
  templateUrl: './form-media.component.html'
})
export class FormMediaComponent extends FormElementBase {

  private filesService: FilesService;

  files: File[] = [];

  readonly select$ = new Subject<NgxDropzoneChangeEvent>();

  readonly selectSub = this.select$.pipe(
    tap(e => console.log(e)),
    mergeMap(e => this.filesService.bulkUpload([ e.addedFiles[0] ]).pipe(
      map(mfs => ({ mfs, e}))
    )),
    tap(({ mfs }) => this.formControl.setValue(mfs[0])),
    tap(({ e }) => this.files.push(...e.addedFiles))
  ).subscribe();

  constructor(
    attributeSerializer: AttributeSerializerService,
    optionsResolverService: OptionsResolverService,
    filesService: FilesService,
    controlContainer?: ControlContainer
  ) {
    super(attributeSerializer, optionsResolverService, controlContainer);
    this.filesService = filesService;
  }

  onSelect(event: NgxDropzoneChangeEvent) {
    this.select$.next(event);
  }
  
  onRemove(event: File) {
    console.log(event);
    this.formControl.setValue('');
    this.files.splice(this.files.indexOf(event), 1);
  }

}