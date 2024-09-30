---
title: How to export SQlite Database File in Flutter (Android)
description: SQlite-Datenbank aus der App unter Android exportieren
date: 2021-05-02
tags: ["flutter", "sqlite"]
layout: layouts/post.njk
lang: "de"
alternate_lang: "en"
alternate_url: "/posts/en/0521/flutter-export-sqlite-db"
---

Eine der vielen Möglichkeiten, Daten in einer [Flutter-App](https://flutter.dev/) zu speichern, ist [SQLite](https://www.sqlite.org/index.html). SQLite bietet eine relationale Datenbank innerhalb der App, ohne externe Abhängigkeiten und ohne Datenverkehr über das Internet. <!-- endOfPreview --> Es ist sehr praktisch und für kleinere, einfachere Anfragen performant. Wer eine Übersicht über die Möglichkeiten zum Speichern von Daten in Flutter sucht, dem empfehle ich diesen [Artikel (flutter-databases-sqf...

Ich habe eine App erstellt, die Daten in einer SQLite-Datenbank speichert. Nun stand ich vor dem Problem, wie ich die Daten migrieren kann, z. B. wenn ich das Handy wechsle. Da SQLite die Daten in eine \*.db-Datei schreibt, muss es eine Möglichkeit geben, auf diese Datei auf dem Telefon zuzugreifen und sie aus der App zu exportieren. Wie man das erreicht, möchte ich hier teilen.

Voraussetzung ist eine Flutter-App und die folgenden Bibliotheken:

```yaml
dependencies:
    flutter:
        sdk: flutter
    sqflite:
    path:
    permission_handler: ^7.0.0
    downloads_path_provider: ^0.1.0
```

-   **sqflite**: SQLite-Bibliothek
-   **path**: Dateipfade
-   **permission_handler**: Berechtigungen auf dem Gerät
-   **downloads_path_provider**: Pfad zum Download-Ordner

Die Umsetzungsidee war wie folgt:

1. Überprüfe die Schreibrechte auf dem Gerät.
2. Finde den Pfad zur \*.db-Datei.
3. Öffne die Datei und speichere eine Kopie im Download-Ordner des Telefons.

<br/>

#### 1. Schreibrechte

Um Dateien auf dem Telefon lesen und schreiben zu können, benötigt man Schreibrechte. **Achtung!** Ich beziehe mich hier nur auf das Android-System.
Um Schreibrechte zu erhalten, füge die folgenden Zeilen in die Datei **_/android/app/src/main/AndroidManifest.xml_** ein:

```xml
<uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE"/>
<uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE"/>
```

Damit der Nutzer überhaupt erkennt, dass diese Rechte benötigt werden, empfehle ich das Paket _permission_handler_. Damit kann man den Nutzer komfortabel auf die benötigten Schreibrechte hinweisen und diese direkt abfragen.

```dart
var status = await Permission.storage.status;
if (status.isDenied) {
    await Permission.storage.request();
    return;
}
```

Die erste Zeile prüft, ob die Rechte in der oben beschriebenen XML-Datei eingetragen wurden, und anschließend, ob der Nutzer die Rechte freigegeben hat. Die dritte Zeile lässt einen Dialog erscheinen, der dem Nutzer diese Auswahl anbietet.

![schreibrechte](/img/0521/right-granted.png "schreibrechte")

Sobald die Rechte erteilt wurden, können wir Dateien schreiben.

#### 2. Dateipfade

Die Dateipfade sind etwas versteckt, und wir benötigen die oben genannten Module als Hilfe.

**Pfad zur bestehenden Datenbank.db**

```dart
String dbName = "doggie_database.db"; // Name der Datenbank
var databasesPath = await getDatabasesPath(); // Standard-Datenbankpfad
var innerPath = join(databasesPath, dbName);
print(innerPath);
// /data/user/0/com.example.flutter_sqlite_database_export/databases/doggie_database.db
```

**Pfad zum Download-Verzeichnis**

```dart
Directory tempDir = await DownloadsPathProvider.downloadsDirectory;
String tempPath = tempDir.path;
```

**Einblick ins Android-Datenbankverzeichnis**
Wer in seine laufende Applikation schauen möchte, dem empfehle ich im Android-Studio den **_Device-File-Explorer_**.

![device file explorer](/img/0521/file-explorer.png "device file explorer")

Unter **_/data/data/[name eurer Applikation]/databases/[NameEurerDB].db_** findet ihr eure SQLite-Datenbank und könnt diese exportieren.

#### 3. Datenbank.db exportieren

```dart
var dbFile = File(innerPath);
var filePath = tempPath + '/$dbName';
var dbFileBytes = dbFile.readAsBytesSync();
var bytes = ByteData.view(dbFileBytes.buffer);
final buffer = bytes.buffer;

File(filePath).writeAsBytes(
  buffer.asUint8List(
    dbFileBytes.offsetInBytes, dbFileBytes.lengthInBytes
));
```

Die Datenbankdatei wird als Byte-Daten gelesen und im Standard-Dart-I/O-Verfahren von einem Ort an einen anderen kopiert. So erhält man einen Export der in der App verwendeten Datenbank.

Hier nochmal die komplette Methode mit Aufruf:

```dart
Future<File> _writeDBFileToDownloadFolder() async {
    String dbName = "doggie_database.db";
    var databasesPath = await getDatabasesPath();
    var innerPath = join(databasesPath, dbName);
    print(innerPath);

    Directory tempDir = await DownloadsPathProvider.downloadsDirectory;
    String tempPath = tempDir.path;

    var dbFile = File(innerPath);
    var filePath = tempPath + '/$dbName';
    var dbFileBytes = dbFile.readAsBytesSync();
    var bytes = ByteData.view(dbFileBytes.buffer);
    final buffer = bytes.buffer;

    return File(filePath).writeAsBytes(buffer.asUint8List(
        dbFileBytes.offsetInBytes, dbFileBytes.lengthInBytes));
  }

...
onPressed: () async {
  var status = await Permission.storage.status;
  if (status.isDenied) {
    await Permission.storage.request();
    return;
  }

  File file = await _writeDBFileToDownloadFolder();
  if (await file.length() > 0) { // not null safe
    print("success");
  }
},
...

```

Wenn man auf dem Telefon die App "Files" öffnet und in das Download-Verzeichnis schaut, findet man die exportierte Datei.

Great Success! :-)

Diese Code-Blöcke, eingebettet in die Flutter-Starter-App, habe ich für euch auf [GitHub](https://github.com/derKuba/flutter-sqlite-database-export) bereitgestellt.

Ihr habt Fragen oder Anregungen? Schreibt mir bei [Twitter](https://twitter.com/der_kuba).

**_Nachtrag vom 07.05.2021_**
In Android Q reicht der oben erwähnte Eintrag in der XML nicht aus. Es muss noch Folgendes hinzugefügt werden:

```
  android:requestLegacyExternalStorage="true"
```

sodass die **_/android/app/src/main/AndroidManifest.xml_** wie folgt aussieht:

```xml
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
  package="com.example.flutter_sqlite_database_export">
  <application
    android:label="flutter_sqlite_database_export"
    android:requestLegacyExternalStorage="true"
    android:icon="@mipmap/ic_launcher">
    ....
    </application>
    <uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE"/>
    <uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE"/>
</manifest>
```

Ihr habt Fragen oder Anregungen? Schreibt mir bei [Twitter](https://twitter.com/der_kuba).

Tausend Dank fürs Lesen!

Kuba
