Forget using ngOnInit
Forget using ngOnChanges

Instead use input setter(s) that interact with observables.

@Input() set blog(blog: Blog) {
  this.blog$.next(blog);
}

blog$ = new BehaviorSubject<Blog>(new Blog());

blobSub = this.blog$.subscribe(b => {
  if (b.id) {
    ...
  } else {
    ...
  }
});

Avoid convoluted conditionals inside ngOnChanges
No need for ngOnInit

All dependencies passed into the constructor can be immediately accessed.

class Biden {
  this.mouthPiece.speaks.subscribe(() => {
    console.log('call bs');
  });
  constructor(
    private mouthPiece: MouthPiece
  ) {}
}