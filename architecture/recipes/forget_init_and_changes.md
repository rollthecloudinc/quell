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

```typescript
class Biden {
  bidenSub = this.mouthPiece.speaks.subscribe(() => {
    console.log('call bs');
  });
  constructor(
    private mouthPiece: MouthPiece
  ) {}
}
```

--------------------

```typescript
class RaidCapitalBuilding {
  persons$ = new BehaviorSubject<Array<Person>>([]);
  personsSub = this.persons$.subscribe(persons => {
    console.log('all idiots destined to be f**ked by the fbi: ' + persons.map(p => `${p.firstName} ${p.lastName}`).join(','));
  });
  addPerson(person: Person) {
    this.persons$.next([ ...this.persons$.value, person ]);
  }
}
```

---------------------

```typescript
class Rape {
  rape$ = new BehaviorSubject<[Person, Array<Person>]>([]);
  rapeSub = this.rape$.pipe(
    tap(([victum, persons]) => {
      persons.forEach(p => console.log(`${p.firstName} ${p.lastName} burn. ${victum.firstName} ${victum.lastName} these people should be gone for what they did to you. Are they even people... monsters more like it. So lets transform them into what they are...`));
    }),
    switchMap(([victum, persons]) => this.rapistService.convertToMonsters(persons).pipe(
      map<Array<Monster>, [Person, Array<Monster>]>(monsters => [victum, monsters])
    )),
    switchMap(([v, mn]) => iif(
      () => mn.length > 0,
      of(...mn.map(m => this.monsterDestruction.removeMonsterFromfaceOfPlanet(m).pipe(
        concatAll(),
        map(() => [v, mn])
      ))),)),
      of([v, mn])
    ))
  ).subscribe(([v, monsters]) => {
    console.log(`${v.firstName} ${v.lastName}`);
    monsters.forEach(m => console.log(`${m.monsterName} monster destroyed.`));
  });
}
```