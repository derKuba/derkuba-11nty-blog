---
title: "Warum du Bibliotheken nicht manuell speichern solltest: npm als bessere Lösung"
description: Frühjahresputz im Herbst
date: 2024-09-18
tags: ["html"]
layout: layouts/post.njk
#lang: "de"
#alternate_lang: "en"
#alternate_url: "/posts/en/0122/connecting-address-book-to-backend"
---

Im Webentwicklungskontext sehe ich häufig, dass Entwickler Bibliotheken wie CSS- und JS-Dateien direkt in ihre Projekte kopieren und in Ordnern ablegen. Doch das ist ein veralteter Ansatz, der mehr Nachteile als Vorteile mit sich bringt. <!-- endOfPreview -->

### Wie es früher gemacht wurde

Ein häufiges Vorgehen bestand darin, die Bibliotheken manuell herunterzuladen und in Ordner wie `css` und `js` zu speichern. Die Struktur sah etwa so aus:

```
/project
|-- /css
|   |-- bootstrap.css
|-- /js
|   |-- jquery.js
|-- index.html
```

In der `index.html` wurden die Dateien dann folgendermaßen eingebunden:

```html
<!doctype html>
<html lang="en">
    <head>
        <link rel="stylesheet" href="css/bootstrap.css" />
    </head>
    <body>
        <script src="js/jquery.js"></script>
    </body>
</html>
```

Dieses manuelle Vorgehen brachte jedoch Probleme mit sich, wie z. B. die Notwendigkeit, bei jeder neuen Version die Dateien zu aktualisieren und sicherzustellen, dass sie korrekt verlinkt und geladen werden.

### Warum npm?

**1. Einfaches Versioning**  
Mit npm kannst du Bibliotheken gezielt in den benötigten Versionen installieren und aktualisieren. Dadurch vermeidest du Inkompatibilitäten und erhältst Sicherheitsupdates automatisch.

**2. Dependency Management**  
npm übernimmt für dich das Verwalten von Abhängigkeiten. Anstatt mehrere Dateien manuell herunterzuladen und zu aktualisieren, ziehst du mit einem Befehl (z.B. `npm install`) alle Abhängigkeiten ins Projekt.

**3. Modularität**  
Mit npm kannst du spezifische Teile von Bibliotheken einbinden und nur das verwenden, was du tatsächlich benötigst. Das spart Platz und verbessert die Ladezeiten deiner Webseite.

### Der Build-Prozess: Mehr als nur Dateien verschieben

Moderne Build-Tools wie Webpack oder Vite nutzen npm, um CSS und JS zu verarbeiten und zu optimieren. Anstatt unkomprimierte, riesige Bibliotheksdateien zu laden, bündelt npm diese und optimiert sie für die Produktion. Dadurch wird deine Webseite schneller und performanter.

### Wie geht's? Ein einfaches Beispiel

Statt Bootstrap herunterzuladen und in einen Ordner zu legen, kannst du es so in dein Projekt integrieren:

```bash
npm install bootstrap
```

Anschließend kannst du die benötigten Teile importieren und in deinem Build-Prozess verarbeiten:

```javascript
import "bootstrap/dist/css/bootstrap.min.css";
```

## Fazit

Das manuelle Hinzufügen von Bibliotheken gehört der Vergangenheit an. Mit npm hast du die Kontrolle, Flexibilität und Effizienz, um deine Projekte skalierbarer und sicherer zu machen. Wer heutzutage noch auf die manuelle Methode setzt, verpasst wesentliche Vorteile moderner Webentwicklung.
