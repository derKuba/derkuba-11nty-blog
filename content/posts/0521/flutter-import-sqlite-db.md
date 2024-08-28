---
title: How to import SQlite Database File in Flutter (Android)
description: SQlite Database aus der Applikation importieren unter Android
date: 2021-05-13
tags: ["flutter", "sqllite"]
layout: layouts/post.njk
---

Vor kurzem habe ich erklärt wie man aus seiner App die [SQlite-Datenbank](https://www.sqlite.org/index.html) exportiert. In diesem Artikel erkläre ich wie man diese importiert. Voraussetzung ist ein bestehendes Flutter-Projekt und ein SQlite-Datenbank im Download-Verzeichnis des Telefons. <!-- endOfPreview -->

Benötigte Bibliotheken sind folgende:

```yaml
dependencies:
    flutter:
        sdk: flutter
    sqflite:
    path:
    permission_handler: ^7.0.0
    downloads_path_provider: ^0.1.0
```

Die Vorgehensweise strukturiert sich folgendermaßen:

1. Lege eine neue Seite für den Import an und gebe den Dateipfad hinein
2. Lese Dateien aus dem Download-Verzeichnis und filtere nach _".db"_
3. Zeige die Dateien an.
4. Kopiere diese in das Datenbankverzeichnis

Ich gehe davon aus, dass mehrere Dateien für den Import zur Verfügung stehen und man den Nutzer vor die Wahl stellen kann, welche er importieren möchte. Für die Auswahl aus einer Liste bieten sich Radiobuttons an. In Flutter gibt es dazu die **_RadioListTile_**:

```dart
String selectedFile = "";
...
RadioListTile<String>(
    title: Text(fileName.path ?? ""),  // Der Titel ist der Pfad der Datei
    value: fileName.path,             //  und der Wert ebenfalls.
    groupValue: selectedFile,        //   Zum Anzeigen der Auswahl benötigt man eine Merkvariable, die den ausgewählten Wert repräsentiert.
    onChanged: (String value) {     //    In der Change-Funktion wird diese Merkervariabel ge- und überschrieben.
      print(value);
      setState(() {
        selectedFile = value;
      });
    },
  );
```

Das Ganze sieht dann aus wie folgt:

![Dateiauswahl](/content/img/0521/import_ui.png "Dateiauswahl")<div class="has-text-right image-subline">Bild 1: RadioListTile in Aktion</div>

Der grüne Knopf im unteren Bereich heißt **_FloatingActionButton_** und hat auf seiner onPressed-Methode folgende Funktion:

```dart
  _importDB(BuildContext context) async {
    print(selectedFile);
    if (selectedFile == "") return;
    try {
      var status = await Permission.storage.status;
      if (!status.isGranted) {
        await Permission.storage.request();
      } else {
        var srcFile = File(selectedFile);
        var dbFileBytes = srcFile.readAsBytesSync();
        var bytes = ByteData.view(dbFileBytes.buffer);
        final buffer = bytes.buffer;

        var databasesPath = await getDatabasesPath();
        var distPath = join(databasesPath, 'doggy__${DateTime.now()}.db');

        await File(distPath).writeAsBytes(buffer.asUint8List(
            dbFileBytes.offsetInBytes, dbFileBytes.lengthInBytes));
      }
    } catch (error) {
      print(error);
    }
  }
```

Im ersten Teil prüfen wir, ob eine Datei ausgewählt wurde und im Anschluss ob wir überhaupt Lese- und Schreibezugriff auf dem Smartphone haben. Wir holen, bzw. lesen dann die Datei aus dem Downloadverzeichnis aus (Zeile 9-12). Dann lesen wir den Pfad des Downloadverzeichnis aus und bauen aus dem Pfad und dem Dateinamen einen neuen Pfad (Zeile 14-15). In Zeile 17+18 schreiben wir die Datei in das Datenbankverzeichnis des Telefons.

Natürlich kann man hier jetzt viele verschiedene Variationen einbauen. So kann man z.B. die alte Datenbankdatei erstmal umbenennen und als Backup vorhalten. Alternativ kann man die alte Datei auch löschen. Wichtig ist, dass man in der laufenden Anwendung die aktuelle Datenbank schließt und neu ausliest, denn sonst hat die alten Daten im Speicher und muss die App erstmal neustarten.

PS: Ab Android 11 (targetSdkVersion 30) wurde einiges am Rechtemanagement umgestellt. Das hat z.B. den Effekt, dass man die DB-Dateien aus APP A in APP B im Download-Verzeichnis nicht sehen kann. Um dies zu umgehen bin ich in meinen Apps auf targetSdkVersion 29 geblieben bis alle benötigten Flutter-Plugins targetSdkVersion 30 auch ausreichend unterstützen.

Ihr habt Fragen oder Anregungen? Schreibt mir bei [Twitter](https://twitter.com/der_kuba).

\
Tausend Dank fürs Lesen!

Kuba
