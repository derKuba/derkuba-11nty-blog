---
title: "StencilJS-Tutorial: Einführung"
description: Start der Tutorial Reihe zur Webanwendung mit Stenciljs
date: 2021-05-29
tags: ["stenciljs"]
layout: layouts/post.njk
---

[StencilJS](https://stenciljs.com/) ist ein sehr gutes Framework mit dem man schnell robuste Webanwendungen bauen kann. Der Einstieg ist recht einfach, bzw. der Umstieg von zb. React macht es noch leichter. Der Grundgedanke ist leicht erklärt. Anstatt schwerfällige Runtimes/Kernbibliotheken mitauszuliefern, kompiliert StencilJS einfach den Webstandard Webcomponents, der in allen modernen Browsern out-of-the-box funktioniert. Weil diese Webcomponents, meiner Meinung nach, nicht schön zu programmieren sind, dient StencilJS als Luxuswerkzeug. <!-- endOfPreview -->

Da ein einziger Blogpost nicht ausreichen wird, strukturiere ich das Tutorial in mehrere Teile und werde versuchen jede Woche einen neuen Teil fertig zu stellen. Der aktuelle Code befindet sich [in meinem Github-Repo](https://github.com/derKuba/stenciljs-tutorial).

Das Tutorial gliedere ich in folgende Punkte:

1. **StencilJS** aufsetzen.
2. Entwicklerwerkzeuge hinzufügen.
3. Die **UI Grundstruktur**: Erste Webkomponenten.
4. Der StencilJS **Store** und die Interaktion.
5. E2E Blackbox Testing mit **Playwright**.

Der Techstack sieht aus wie folgt:

-   _StencilJS_ => Webcomponents
-   _Eslint/Prettier/Jest_ => Code-Qualität
-   _KOA_ => Backend
-   _Playwright_ => E2E Tests

Als fachlichen Unterbau eignet sich hervorragend eine CRUD-Anwendung und ich habe mich für ein Adressbuch entschieden. Weil ich ein begnadeter UX/UI-ler :-) bin, habe ich auch folgendes Design entworfen.

<br/>

#### Scribbles der Anwendung

Man erkennt eine einfach Liste, die alle Einträge des Adressbuchs enthält. Wenn man auf den Editieren-Link klickt, wird man auf die Detailseite geleitet. Bei einem Klick auf Löschen wird dieser Eintrag entfernt.
![Liste](/content/img/stenciljs-tutorial/list-design.png "Liste")<div class="has-text-right image-subline">Bild 1: Kontaktliste</div>

![Detailseite](/content/img/stenciljs-tutorial/detail-page-design.png "Detailseite")<div class="has-text-right image-subline">Bild 2: Detailseite</div>

Auf der Detailseite gibt es für jedes Feld eine Eingabebox. Der Speichern-Button persistiert die Eingaben, man wird auf die Liste zurückgeleitet und man sieht, dass ein Eintrag zusätzlich vorhanden ist.

Auf der nächsten Seite geht es los mit dem Aufsetzen des Projekts.
