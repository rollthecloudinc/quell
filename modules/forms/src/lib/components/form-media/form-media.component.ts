import { Component } from "@angular/core";
import { ControlContainer } from "@angular/forms";
import { AttributeSerializerService } from '@rollthecloudinc/attributes';
import { FilesService, MediaFile } from "@rollthecloudinc/media";
import { TokenizerService } from "@rollthecloudinc/token";
import { NgxDropzoneChangeEvent } from "ngx-dropzone";
import { filter, map, mergeMap, Subject, switchMap, tap } from "rxjs";
import { FormElementBase } from "../../directives/form-element-base.directive";
import { OptionsResolverService } from '../../services/options-resolver.services';
import { FormsContextHelperService } from "../../services/forms-context-helper.service";

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
    mergeMap(e => this.filesService.bulkUpload({ files: [ e.addedFiles[0] ] }).pipe(
      map(mfs => ({ mfs, e}))
    )),
    tap(({ mfs }) => this.formControl.setValue(mfs[0])),
    tap(({ e }) => this.files.push(...e.addedFiles))
  ).subscribe();

  readonly valueSub = this.value$.pipe(
    filter(v => typeof(v) === 'object'),
    map(v => new MediaFile(v)),
    tap(v => {
      console.log('populate value', v);
    }),
    switchMap(v => this.filesService.convertToFiles([v])),
    tap(f => {
      console.log('populate as file', f);
      this.files = f;
    })
  ).subscribe();

  constructor(
    attributeSerializer: AttributeSerializerService,
    optionsResolverService: OptionsResolverService,
    filesService: FilesService,
    tokenizerService: TokenizerService,
    formsContextHelper: FormsContextHelperService,
    controlContainer?: ControlContainer
  ) {
    super(attributeSerializer, optionsResolverService, tokenizerService, formsContextHelper, controlContainer);
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

  isType(f: File, type: string): boolean {
    switch(type) {
        case 'image':
          return this.filesService.isImage({ file: f });
        case 'video':
          return this.filesService.isVideo({ file: f });
        default:
          return false;
    }
  }

}