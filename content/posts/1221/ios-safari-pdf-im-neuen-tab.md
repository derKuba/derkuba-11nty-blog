---
title: "IOS & Safari: Öffne PDF im neuen Tab"
description: Hickup der Woche
date: 2021-12-10
tags: ["web", "safari"]
layout: layouts/post.njk
---

Ein Thema, das mich in den letzten Wochen beschäftigt hat, war das Öffnen einer PDF im mobilen Safar-Browsers.<!-- endOfPreview --> Der UseCase sieht aus wie folgt:

-   In einer Single-Page-Application wird
-   ein base64-codierter String wird aus einem Service geliefert
-   und soll in einem neuen Tab geöffnet werden, damit der State der Anwendung erhalten bleibt.

Klang beim ersten Lesen der Anforderung wie ein 0815-Ticket, das dementsprechend klein bewertet wurde. Eine PDF im neuen Tab zu öffnen ist ja auch sehr einfach. Man erzeugt ein virtuelles Anchor-DOM-Element, übergibt den Base64-String im _href_-Attribut und klickt dann programmatisch drauf.

```ts
const anchor = document.createElement("a");
anchor.href = "data:application/application/pdf;base64," + data64;
anchor.download = "documentName.pdf";
anchor.target = "blank";
anchor.click();
```

Das funktioniert in allen Browsern auch im Safari. In allen "normalen :-)" Browsern öffnet sich in einem neuen Tab die PDF. Auch im Safari öffnet sich ein schicker PDF-Viewer. Also Ticket fertig! Zu. Nächstes Ticket!

HALT STOP! :-)

Im Safari öffnet sich der Spaß im selben Tab. Wenn man nun ein Browser-Back aktiviert, ist der State weg. In meinem Fall eine Katastrophe, weil dann sehr viele Daten erneut eingegeben werden müssten. Das Internet ist vollgestopft Fragen zu genau diesem Fall. Applehasser erklären, dass es keine Lösung gibt. Die Apple-Foren überschlagen sich mit Vorschlägen, die alle nicht für mich funktionierten.

Nach wirklich endlosen Versuchen, haben wir dann eine Lösung gefunden die für uns funktioniert:

```ts
  private downloadPDF = async (base64String: string) => {
    if (base64String?.length === 0) return;

    // https://pretagteam.com/question/display-pdf-in-base64-in-a-new-tab-in-ipad-safari-or-chrome-for-ios-2021
    const blob = this.b64toBlob(base64String, "application/pdf");
    const url = URL.createObjectURL(blob);
    window.open(url);
  };
```

Der base64String wird zu einem Blob gewandelt. Die Funktion habe ich mir aus dem Blog-Artikel geliehen. Sie tut was sie soll. Anschließend wird der Blob in eine ObjectURL gewandelt und über das _window_-Objekt gewandelt. Die PDF öffnet sich im neuen Tab im nativen PDF-Viewer. Es gibt auch Lösungen die ein PDF in einem IFrame öffnen. Aber auch dort bitte aufpassen. Es wird immer nur die erste Seite des PDFs angezeigt.

Was sich hier so einfach liest war ein sehr langer Prozess, um die Funktionalität umzusetzen. Aber Ende gut, alles gut. Vielleicht hat ja noch jemand dieses Problem und kann mit dieser Lösung was anfangen :-)

Ihr habt Fragen oder Anregungen? Schreibt mir bei [Twitter](https://twitter.com/der_kuba) oder per <a href="mailto:jacob@derkuba.de"> E-Mail</a> .

\
Tausend Dank fürs Lesen!

Kuba
