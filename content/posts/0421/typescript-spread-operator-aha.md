---
title: "Spass mit Typescript: Spread-Operator AHA-Moment"
description: Meine Stolperfalle der Woche
date: 2021-04-24
tags: ["typescript"]
layout: layouts/post.njk
---

Diese Woche bin ich über den Spread-Operator gestolpert und möchte diese Erfahrung teilen. <!-- endOfPreview -->

Folgendes Szenario:
Ich möchte ein Objekt erstellen, dass aus einem Key "Name eines Testfalls" und als Value ein weiteres Objekt aus benannnte Zahlenpaaren enthält. Ich habe dazu ein Array aus Namen der Testfälle und ein ein Objekt, das ein Objektschema enthält.

```typescript
const testCases = ["testcase 0", "testcase 1", "testcase 2", "testcase 3"];
const schema = {
     "first": {
        a: 0,
        b: 0,
        c: 0
    },
    "second": {
        a: 0,
        b: 0,
        c: 0
    },
    "third": {
        a: 0,
        b: 0,
        c: 0
    },
}
```

Aus den Namen und dem Schema, soll dann ein großes Objekt entstehen, das wie folgt aussieht.


```typescript
const testDataDefaults = {
    "testcase 0": {
        "first": {
            a: 0,
            b: 0,
            c: 0
        },
         "second": {
            a: 0,
            b: 0,
            c: 0
        },
         "third": {
            a: 0,
            b: 0,
            c: 0
        },
    },
    ...
}
```

Man schreibt ganz schnell eine kleine Schleife über die Namen der Testfälle, initiiert das Sammelobjekt und setzt für jeden Testfall das Schema:

```typescript
const testDataDefaults = {};
testCases.forEach(testCase => {
    testDataDefaults[testCase] = {
        ...numbers,
    };
});
```

Die Zeile {...numbers} erzeugt ein Klon des Schemas und weißt ihm dann dem Namen des Testfalls zu.

Dieses DefaultObjekt wird dann im nächsten Schritt mit echten Daten gefüllt. Mein erster Ansatz ohne viel nachzudenken war wie folgt:

```typescript
testDataDefaults["testcase 0"].first.a = 23;
testDataDefaults["testcase 0"].first.b = 42;
testDataDefaults["testcase 0"].first.b = 13;
```

Meine Erwartung war, dass im ersten Testcase das "first"-Objekt an der Stelle "a" die Zahl 23 enthält. Die Wahrheit sah anders aus:

```typescript
{
  'testcase 0': {
    first: { a: 23, b: 42, c: 13 },
    second: { a: 0, b: 0, c: 0 },
    third: { a: 0, b: 0, c: 0 }
  },
  'testcase 1': {
    first: { a: 23, b: 42, c: 13 },
    second: { a: 0, b: 0, c: 0 },
    third: { a: 0, b: 0, c: 0 }
  },
  'testcase 2': {
    first: { a: 23, b: 42, c: 13 },
    second: { a: 0, b: 0, c: 0 },
    third: { a: 0, b: 0, c: 0 }
  },
    ...
}
```

Waaaaaat. 

Laut https://developer.mozilla.org/de/docs/Web/JavaScript/Reference/Operators/Spread_syntax#spread_f%C3%BCr_objektliterale hätte doch alles klappen sollen.

Schnell mal googeln wie man sonst noch Objekte klonen kann:

https://www.samanthaming.com/tidbits/70-3-ways-to-clone-objects/

Also nochmal von vorne und das mit allen 3 Lösungen:

```typescript
tests.forEach(testCase => {
    spreadMapped[testCase] = {
        ...numbers,
    };
    jsonMapped[testCase] = JSON.parse(JSON.stringify(numbers))
    objectAssignMapped[testCase] = Object.assign({}, numbers);
});

spreadMapped["testcase 0"].first.a = 23;
spreadMapped["testcase 0"].first.b = 42;
spreadMapped["testcase 0"].first.c = 13;

jsonMapped["testcase 0"].first.a = 23;
jsonMapped["testcase 0"].first.b = 42;
jsonMapped["testcase 0"].first.c = 13;

objectAssignMapped["testcase 0"].first.a = 23;
objectAssignMapped["testcase 0"].first.b = 42;
objectAssignMapped["testcase 0"].first.c = 13;
```

und das Ergebnis ist auch etwas durchwachsen:

```typescript
// spread
{
  'testcase 0': {
    first: { a: 23, b: 42, c: 13 },
    second: { a: 0, b: 0, c: 0 },
    third: { a: 0, b: 0, c: 0 }
  },
  'testcase 1': {
    first: { a: 23, b: 42, c: 13 },
    second: { a: 0, b: 0, c: 0 },
    third: { a: 0, b: 0, c: 0 }
  },
    ...
}
// json
{
  'testcase 0': {
    first: { a: 23, b: 42, c: 13 },
    second: { a: 0, b: 0, c: 0 },
    third: { a: 0, b: 0, c: 0 }
  },
  'testcase 1': {
    first: { a: 0, b: 0, c: 0 },
    second: { a: 0, b: 0, c: 0 },
    third: { a: 0, b: 0, c: 0 }
  },
    ...
}

// Object assign
{
  'testcase 0': {
    first: { a: 23, b: 42, c: 13 },
    second: { a: 0, b: 0, c: 0 },
    third: { a: 0, b: 0, c: 0 }
  },
  'testcase 1': {
    first: { a: 23, b: 42, c: 13 },
    second: { a: 0, b: 0, c: 0 },
    third: { a: 0, b: 0, c: 0 }
  }
  ...
}
```
Der Spreadoperator und das Object.assign halten nicht so ganz was sie im ersten Moment versprechen. Ich bin über die Formulierung "flache Klonen" gestolpert. Es wird zwar das Defaultobjekt geklont, allerdings bleiben die Referenzen von "first", "second", "third" erhalten. Das JSON-Konstrukt geht über das flache Klonen hinaus.

Die Zuweisung über spreadMapped["testcase 0"].first.a = 23; funktioniert nicht. Man muss das zugewiesene Object mit einem frischen Objekt überschreiben:

```typescript
spreadMapped["testcase 0"] = {
    ...spreadMapped["testcase 0"],
    first: {
        ...spreadMapped["testcase 0"].first,
        a: 23
    }
}

// output
{
  'testcase 0': {
    first: { a: 23, b: 0, c: 0 },
    second: { a: 0, b: 0, c: 0 },
    third: { a: 0, b: 0, c: 0 }
  },
  'testcase 1': {
    first: { a: 0, b: 0, c: 0 },
    second: { a: 0, b: 0, c: 0 },
    third: { a: 0, b: 0, c: 0 }
  },
}
```

Das war mein hartes Learning der Woche. Code gibts unter 
 [Code gibts unter](https://github.com/derKuba/fun-with-typescript/tree/main/240121-spread-aha-moment)


 Ihr habt Fragen oder Anregungen? Schreibt mir bei [Twitter](https://twitter.com/der_kuba)
