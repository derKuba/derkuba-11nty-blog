---
title: End to End Tests in Flutter
description: Wie teste ich die Applikation unter Android
date: 2021-10-01
tags: ["flutter", "testing"]
layout: layouts/post.njk
---

Aktuell arbeite ich an einer APP mit Flutter. Letzte Woche habe ich einen ersten Prototypen auf mein Handy überspielt. Stolz habe ich es jemanden gegeben, um zuzuschauen wie mit der APP interagiert wird. Nach drei Klicks wurde der Bildschirm rot. Crash. <!-- endOfPreview --> Ende der Präsentation. Ich habe vorher zigfach durch die Applikation geklickt. Aber den einen Pfad habe ich ausgelassen. Jetzt kann man natürlich von dem bekannten Vorführeffekt sprechen. Schön und gut. Aber wie kann man so eine Situation vermeiden?
Richtig! Testen Testen Testen. :-)

Mir hätte ein Unit-Testing an der Stelle nicht geholfen. Die Komponenten funktionierten geschlossen in sich perfekt. Allerdings das Zusammenspiel krachte. Ich brauche End2End Tests. Als alter Webentwickler habe ich natürlich an Selenium gedacht. Jedoch habe ich ein Google-Framework vor mir. Es wäre gelacht, wenn die nicht etwas in diese Richtung gebaut hätten. [Siehe da, das haben sie getan.](https://flutter.dev/docs/cookbook/testing/integration/introduction). Es gibt dazu eine [zweite Doku](https://flutter.dev/docs/testing/integration-tests), die sich etwas unterscheidet. Da es aber verschiedene Versionen gibt und die Dokumentation für mich etwas verwirrend war, beschreibe ich in diesem Artikel wie ich ans Ziel gekommen bin.

#### Ausgangslage

Mein aktuelles Setup sieht so aus:

```ts
~ flutter --version
Flutter 2.6.0-12.0.pre.59 • channel master •
https://github.com/flutter/flutter.git
Framework • revision 64161b6caa (vor 9 Tagen) • 2021-09-22 18:38:04 -0400
Engine • revision dd28b6f1c8
Tools • Dart 2.15.0 (build 2.15.0-137.0.dev)
```

#### Installation

Vorab die Info, dass man zwar noch auf den _flutter_driver_ setzt. Dieser aber nicht mehr aus dem Paket heraus referenziert wird. Dazu schreibe ich gleich noch etwas.

Man benötigt folgende Dependencies/Paketabhängigkeiten, die man in die _pubspec.yaml_ schreibt als _dev-dependencies_:

```yaml
dev_dependencies:
    integration_test:
        sdk: flutter
    flutter_test:
        sdk: flutter
    flutter_driver:
        sdk: flutter
```

Je nach IDE werden diese automatisch nachgeladen. Händisch geht dies im Projektverzeichnis so:

```bash
flutter pub get
```

#### Ordner- und Dateistruktur

Es werden folgende Ordner benötigt:

-   /integration_test
-   /test
-   /test_driver

Der erste Ordner beinhaltet die Integration-/E2E-Tests. Im zweiten Ordner befinden sich die Unit-Tests ( spielt in diesem Artikel keine Rolle -> aber ich hoffe sie sind da :-) ). Der dritte Ordner beinhaltet ein bisschen Konfiguration, bzw. Setup für die Integrationstests.

Der Ordner _test_driver_ beinhaltet die Datei **test-driver.dart** und hat diesen Inhalt:

```dart
import 'package:integration_test/integration_test_driver.dart';

Future<void> main() => integrationDriver();
```

#### Testfall

Im Ordner /integration*test liegen die Testfälle. Als Konvention hat man sich auf das Suffix (die Endung) test.dart geeinigt. Hier würde ich empfehlen noch ein "unit*" oder "integration\_" davor hängen. Als Dateinamen ergibt sich **happy-path_integration_test.dart**. Die Syntax orientiert sich an bekannten BDD-Frameworks, wie z.B. [Jest](https://jestjs.io/).

```dart
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:integration_test/integration_test.dart';

import "package:myApp/main.dart" as app;

void main() {
  IntegrationTestWidgetsFlutterBinding.ensureInitialized();

  group('Example', () {
    testWidgets('should add new contact', (WidgetTester tester) async {
      app.main();
      await tester.pumpAndSettle();

      final Finder addButton = find.byKey(Key("add_new"));
      await tester.tap(addButton);

      await tester.pumpAndSettle();

      final Finder inputField = find.byKey(Key("input"));
      await tester.enterText(inputField, "ExampleName");

      await tester.pumpAndSettle();

      final Finder saveButton = find.byKey(Key("save_button"));
      await tester.tap(saveButton);

      await tester.pumpAndSettle();

      expect(find.text('ExampleName'), findsOneWidget);
    });
  });
}
```

Die erste Zeile importiert das Hauptpaket, weil ich auf Widgets zugreifen möchte. Die nächsten zwei Zeilen importieren die Testbibliotheken.
Die erste individuelle Zeile ist die fünfte Zeile. Hier wird die _main.dart_-Datei der zu testenden Applikation importiert.

Man findet sich sehr schnell zurecht. Die Testfälle sind in der Main-Funktion gekapselt.

Das _IntegrationTestWidgetsFlutterBinding_ kümmert sich laut der Doku darum, dass die Testergebnisse eingesammelt werden. Die Methode _ensureInitialized_ initialisiert dies.

Analog zum Modell _describe_ und _test/it_ kommt hier _group_ und _testWidgets_ daher. Group gibt den Tests einen Rahmen, in dem die Testfälle unter gebündelt werden. Man findet sich auch hier schnell zurecht.

Wer andere Frameworks kennt, kennt das Vorgehen.

-   Initialisiere den Test
-   Finde eine/n Knoten/Komponente.
-   Führe darauf eine (Steuerungs-)Aktion aus.
-   Erwarte eine Änderung der Oberfläche

Nach genau diesem Schema läuft der Test auch ab.

In Zeile 13 startet man die App. Man hat das Objekt [_WidgetTester tester_](https://api.flutter.dev/flutter/flutter_test/WidgetTester-class.html) zur Verfügung. In anderen Frameworks ist dies häufig der _driver_ oder die _page_. Dabei handelt es sich um das Interface für die Oberfläche. Mit anderen Worten die Schnittstelle oder Steuerung des Browsers oder in diesem Fall des Smartphones.

Zum Finden der Komponente gibt es das globale Objekt vom Typ [CommonFinders](https://api.flutter.dev/flutter/flutter_test/CommonFinders-class.html). Über das globale _find_ kann man z.B. die Methoden _byKey_, _byTooltip_ oder _byWidget_ aufrufen. Diese suchen dann in der App nach einem bestimmten Key, Tooltip oder nach einem spezifischen Widget und geben eine Instanz der Klasse _Finder_ zurück.
Ich hab meinen Widgets eindeutige [Keys](https://api.flutter.dev/flutter/foundation/Key-class.html) gegeben, und kann so einfach danach suchen. Wenn ein Widget gefunden wird, übergibt man dieses als Parameter an eine Interaktionsmethode des _testers_.
Dieser verfügt über Operationen wie z.B. _.enterText(finder, text)_, _.tap(finder)_, _showKeyboard(finder)_. Ich empfehle den Blick in die [Doku](https://api.flutter.dev/flutter/flutter_test/WidgetTester-class.html).

Der aufmerksamer Leser wird sich über das vermehrte Aufrufen der Funktion _pumpAndSettle_ wundern. In früheren Versionen stand dort noch ein _driver.wait_. Diese Funktion wartet eigenständig bis alle Operationen, bzw. sich veränderten Frames auf der Oberfläche zum Stillstand gekommen sind. Das brauchen, um die jeweils nächste Operation zu starten (damit sich keine Operation in die Quere kommt) und um das Endresultat abzufragen.

Das letzte Vorgehe im Test ist auch etwas kniffelig. Was erwartet man nun und wie prüft man es. In meinem kleinen Codebeispiel teste ich ein Inputfeld. Ein Knopf öffnet die Editierseite (Zeile 15), füllt das Formular aus (Zeile 21), speichert (Zeile 26) und kehrt damit zur Listenansicht zurück. Ich suche dann global nach dem neuen Text, den ich ersetzt habe (Zeile 30). Hier wäre es natürlich möglich über die oben genannten Keys oder Tooltips zu suchen.

Damit wäre der erste einfach Test geschrieben. Wie ruft man diesen nun auf?

```bash
flutter drive
  --driver=test_driver/integration_test.dart
  --target=integration_test/happy-path_integration_test.dart
  -d emulator-5554
```

Der Befehl zum Auführen lautet **flutter drive** und bekommt noch einige Parameter mitgegeben. Der erste Parameter gibt den Pfad zum Driver an. Dieser befindet sich im oben genannten Ordner. Der Inhalt wurde bereits behandelt. Der zweite Parameter gibt das Target an. Ich finde es etwas unglücklich ausgedrückt. Es handelt sich hierbei um den Testfall, den man starten möchte. Ich habe nach Möglichkeiten gesucht alle Testfälle zu starten. Aber da muss man sich selber helfen und ein eigenes Bash-Skript schreiben. Der letzte Parameter gibt den Ausführungsort an. Hierbei handelt es sich um ein Device, das man unter Flutter einsehen kann.

Führt man diesen Befehl aus, bekommt man eine Übersicht über die mit Flutter verbundenen "Testgeräte".

```bash
flutter devices
2 connected devices:

Android SDK built for x86 (mobile) • emulator-5554 • android-x86    • Android 10
(API 29) (emulator)

Chrome (web)                       • chrome        • web-javascript • Google
Chrome 94.0.4606.71
```

Das erste Wort nach dem weißen Punkt ist der Devicename. Diesen gibt man als letzten Parameter im Befehl ein: _-d emulator-5554_. Hierbei handelt es sich um den Android-Emulator aus dem Android-Studio. Im Codebeispiel sieht man noch den Browser Chrome. Auch dieser könnte theoretisch genutzt werden, wenn man eine Flutter-Webanwendung gebaut hätte. Wäre eine physisches Telefon per USB verbunden, würde dieses hier auch auftauchen.

Führt man diesen Befehl aus, dauert es eine gute Weile. Alles wird kompiliert, die App auf dem Emulator installiert. Man sieht die Klickfolge. Der nachfolgende Text sollte den Test krönen.

```bash
I/flutter ( 8223): 00:03 +2: All tests passed!
All tests passed.
```

#### Fazit

Dieser Artikel ist nur der Einstieg in das Testing. Er zeigt die Installation, beschreibt die Ordnerstrukturen und führt einen ersten Test aus. Damit hat man das Handwerkszeug ( und die richtigen Links zur Dokumentation), um weitere Tests zu schreiben und eine hohe Testabdeckung zu erreichen. Ich wünsche viel Spass beim Testen.

Ihr habt Fragen oder Anregungen? Schreibt mir bei [Twitter](https://twitter.com/der_kuba).

\
Tausend Dank fürs Lesen!

Kuba
