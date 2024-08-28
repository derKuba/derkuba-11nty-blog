---
title: "Fuckup der Woche: 'no-break space' - das geschützte Leerzeichen"
description: Man sieht es nicht und dennoch ist es da
date: 2021-05-21
tags: ["typescript"]
layout: layouts/post.njk
---

#### Warum "23.42 €" nicht gleich "23.42 €" sind ?

Die Antwort auf diese Frage hat mich diese Woche viel Zeit gekostet. Um sicherzustellen, dass meine Webanwendung auch das macht was sie verspricht setze ich auf E2E Tests. Dieser Blackbox-Test benutzt einen Browser, gibt die URL meiner Webanwendung ein und klickt diese dann anhand der definierten Testfälle durch. Anschließend liest er Werte aus und vergleicht diese mit vorher definierten Werten. Im konkreten Fall sollte er eine Rechnung überprüfen. <!-- endOfPreview -->Die Überprüfung ist ein einfacher Textvergleich, wie z.B.:

```
"23,42 €" == "18.24 $"
```

Man sieht sofort, dass da was nicht stimmt und kann nach der Ursache forschen.

In meinem Fall lautete der Fehler auf der Konsole aber:

```
Error: '231,63 €' is not included in '231,63 €'...
```

Nach einem Vergleich Zeichen für Zeichen kam dann die Verwunderung. Scheinbar ist das Leerzeichen schuld. Das Leerzeichen wird aber nicht manuell eingefügt, sondern kommt aus der TS/JS-internen Bibliothek. Für die Darstellung des Preises soll aus der typescript number "232.23" die deutsche Schreibweise für einen Preis inklusive Währung erscheinen. Dafür wird die Methode **"toLocaleString"** benutzt. Diese generiert mir die Anzeige automatisch.

```typescript
// Wir nehmen eine einfach Summe:
const sum = 232.23;

// Wandeln diese in die deutsche Schreibweise inklusive Währung.
let sumDisplay = sum.toLocaleString("de-DE", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
});

// output: 232,23 €
```

Vergleicht man nun das Ouput aus der Konsole mit dem erwarteten Ergebnis:

```typescript
console.log(
    `Ist "${sumDisplay}" === "232,23 €" ??? ${sumDisplay === "232,23 €"} \n`
);

// output: Ist "232,23 €" === "232,23 €" ??? false
```

Den Grund dafür kann man sich auf der Konsole ausgeben lassen, wenn man sich Zeichen für Zeichen aus der UTF-16 Tabelle ausgibt:

```typescript
console.log("Zeige dich Zeichen in UTF-16 an: \n");
sumDisplay.split("").forEach(
  (character) => console.log(`${character} => ${character.charCodeAt(0)}`) // print Ascii Code
);

// output:
2 => 50
3 => 51
2 => 50
, => 44
2 => 50
3 => 51
  => 160
€ => 8364
```

Welche Nummer hat denn das " "-Whitespace? (32):

```typescript
console.log("\n whitespace ' ' ist nicht gleich ' ' ");
console.log(`${" ".charCodeAt(0)} ist nicht gleich ${" ".charCodeAt(0)}`);
console.log("Whitespace ist nicht gleich NO-BREAK SPACE");
```

Es handelt sich nicht um das "normale" Whitespace, sondern um das "No-Break-Space". Der grundlegende Unterschied ist, dass diese nicht umgebrochen werden darf, damit der Preis nicht vom Währungszeichen getrennt wird. Der Stringvergleich scheitert dabei natürlich.
Bei der Recherche bin ich auf [eine ganze Liste von Whitespaces](https://de.wikipedia.org/wiki/Gesch%C3%BCtztes_Leerzeichen) gestoßen.
Mein Learning der Woche war damit abgeschlossen. Vertraue keinen Zeichen, die du nicht siehst.

Wer sich mehr Zeichen anschauen möchte, kann diese natürlich sich ausgeben. Hier ein kleines Beispiel für unser Alphabet:

```typescript
console.log("\n\n\n\n UTF-16 code TABLE");
const alphabet = [];
for (let index = 49; index < 127; index++) {
    alphabet.push([index, String.fromCharCode(index)]);
}
console.table(alphabet);

┌─────────┬─────┬──────┐
│ (index) │  0  │  1   │
├─────────┼─────┼──────┤
│    0    │ 49  │ '1'  │
│    1    │ 50  │ '2'  │
│    2    │ 51  │ '3'  │
│    3    │ 52  │ '4'  │
│    4    │ 53  │ '5'  │
│    5    │ 54  │ '6'  │
│    6    │ 55  │ '7'  │
│    7    │ 56  │ '8'  │
│    8    │ 57  │ '9'  │

......
```

Diese Code-Blöcke habe ich unter [Github](https://github.com/derKuba/fun-with-typescript/tree/main/fun-with-localstring) für euch zur Verfügung gestellt.

Ihr habt Fragen oder Anregungen? Schreibt mir bei [Twitter](https://twitter.com/der_kuba).
\
\
Tausend Dank fürs Lesen!

Kuba
