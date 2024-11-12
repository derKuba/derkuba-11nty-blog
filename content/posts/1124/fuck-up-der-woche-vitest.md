---
title: "Fuckup der Woche: Spaß mit Vitest, Jest und der CI"
description: Eine Leidensgeschichte aus dem Web-Frontend
date: 2024-11-12
tags: ["vite", "vitest", "testing", "fuckup"]
layout: layouts/post.njk
---

In meinem SolidJS-Projekt wollte ich unsere firmeninterne Präferenz für Vite nutzen, was nahelegt, auch **Vitest** als Test-Framework zu verwenden. Das schien der naheliegende Schritt für Unit-Tests zu sein, und die Integration funktionierte anfangs auch ziemlich gut. Die Tests liefen reibungslos und waren leicht zu schreiben. Aber dann fing das eigentliche Drama an…

![Image](/img/1124/121124-fuckup.png "github error")

<!-- endOfPreview -->

## Die erste Hürde: Coverage und Test-Thresholds

Nachdem ich den Projekt-Root auf `src` geändert hatte, funktionierte die Coverage-Berichterstattung plötzlich nicht mehr wie erwartet. Die Anzeige der Testabdeckung wollte einfach nicht wie gewünscht funktionieren, und das Einrichten von Test-Thresholds (um sicherzustellen, dass die Coverage eine bestimmte Mindestabdeckung erreicht) schlug durchweg fehl.

Trotz intensiver Recherchen und diverser Konfigurationsanpassungen ließ sich kein stabiler Zustand erzielen. Immer wieder gab es kleine Probleme und Unregelmäßigkeiten in der Ausgabe der Coverage-Reports.

## CI-Albtraum: Inkonsistentes Verhalten

Nachdem die Tests lokal endlich liefen, ging der Code in die CI. Und hier fing der wahre Spaß an. Trotz sämtlicher gleicher Parameter und Konfigurationen zeigte sich in der CI-Umgebung durchweg ein **anderes Verhalten** als lokal:

-   **Mocks ließen sich nicht zuverlässig zurücksetzen**: In der CI-Umgebung verhielten sich Mocks anders und ließen sich teilweise nicht korrekt zurücksetzen. Dies führte dazu, dass Tests fehlschlugen, die lokal grün waren.
-   **Tests schlugen ohne erkennbaren Grund fehl**: Ständig gab es Fehler, die in der lokalen Umgebung einfach nicht auftraten. Es war, als ob die CI eine völlig andere Umgebung interpretierte, selbst mit denselben Node-Versionen und Abhängigkeiten.

## Lösung: Migration auf Jest

Nach langem Hin und Her und zahllosen Versuchen, Vitest in der CI stabil zu bekommen, blieb schließlich nur eine Lösung: **die Migration auf Jest**. Nachdem Jest eingerichtet war, lief alles stabil, sowohl lokal als auch in der CI. Die Konfiguration und der Testaufbau dauerten zwar etwas länger, aber die Tests zeigten nun das erwartete Verhalten – überall.

### Lessons Learned

Dieser Prozess hat mich gelehrt, dass es oft sinnvoll ist, pragmatisch zu bleiben. Auch wenn ein Tool wie Vitest für Vite-Projekte naheliegt, ist es manchmal besser, auf bewährte Werkzeuge wie Jest zurückzugreifen, insbesondere wenn Stabilität in verschiedenen Umgebungen gefragt ist.

**Moral der Geschichte**: Manchmal ist der einfachste Weg tatsächlich der beste, und der „neue heiße Scheiß“ muss sich erst noch in der Praxis bewähren.

---

**Ende**

Für Feedback bin ich immer dankbar.
Gerne an jacob@derkuba.de

Viele Grüße

Euer Kuba
