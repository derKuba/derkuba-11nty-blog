---
title: How to export SQlite Database File in Flutter (Android)
description: SQlite Database aus der Applikation exportieren unter Android
date: 2021-05-02
tags: ["flutter", "sqllite"]
layout: layouts/post.njk
---

Eine der vielen Möglichkeiten für das Speichern von Daten innerhalb einer [Flutter-App](https://flutter.dev/) ist [SQlite](https://www.sqlite.org/index.html). SQlite bietet eine Relationale-Datenbank innerhalb der App ohne externe Ahhänigkeit und ohne Datenverkehr über das Internet. <!-- endOfPreview -->Es ist sehr praktisch und für kleinere, einfachere Statements performant. Wer eine Übersicht über die Möglichkeiten zum Speichern von Daten innerhalb von Flutter sucht, dem empfehle ich folgenden [Artikel (flutter-databases-sqflite-hive-objectbox-and-moor)](https://objectbox.io/flutter-databases-sqflite-hive-objectbox-and-moor/). [Die Flutter-Doku](https://flutter.dev/docs/cookbook/persistence/sqlite) erklärt sehr gut wie man SQlite in seiner App integriert.

Ich habe eine App gebaut, die Daten in der SQlite abspeichert. Nun stand ich vor dem Problem wie ich die Daten migrieren kann, falls ich z.B. das Handy wechsle. Da SQlite die Daten in eine \*.db Datei schreibt, muss es eine Möglichkeit geben an diese Datei auf dem Telefon zu gelangen und diese aus der App zu exportieren. Wie man das erreichen kann, möchte ich mit euch teilen.

Voraussetzung ist eine Flutter App und folgende Bibliotheken:

```yaml
dependencies:
    flutter:
        sdk: flutter
    sqflite:
    path:
    permission_handler: ^7.0.0
    downloads_path_provider: ^0.1.0
```

-   **sqflite**: SQlite-Bibliothek
-   **path**: Pfade
-   **permission_handler**: Rechte auf dem Gerät
-   **downloads_path_provider**: Pfad zum Downloads-Ordner

Die Idee der Umsetzung war folgende:

1. Überprüfe die Schreibrechte auf dem Gerät.
2. Finde den Pfad zur \*.db-Datei.
3. Öffne diese Datei und schreibe eine Kopie in das Download-Verzeichnis des Telefons.

<br/>

#### 1. Schreibrechte

Damit man Dateien auf dem Telefon schreiben und lesen kann, benötigt man Schreibrechte. **Achtung!** Ich beziehe mich hier nur auf das Android-System.
Um an Schreibrechte zu gelangen muss man folgende Zeilen in die Datei **_/android/app/src/main/AndroidManifest.xml_** hinzufügen.

```xml
<uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE"/>
<uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE"/>
```

Damit der Nutzer überhaupt mitbekommt, dass diese Rechte benötigt werden, empfehle ich das Paket _permission_handler_. Damit kann man den Nutzer komfortabel auf Schreibrechte hinweisen und diese direkt auch abfragen.

```dart
var status = await Permission.storage.status;
if (status.isDenied) {
    await Permission.storage.request();
    return;
}
```

Die erste Zeile fragt das System an, ob überhaupt Rechte in der oben beschriebenen xml eingetragen wurden und dann das Telefon, ob der Telefonnutzer die Rechte freigegeben hat. Die dritte Zeile lässt einen Dialog erscheinen, der dem Nutzer diese Auwahl anbietet.

![schreibrechte](/content/img/0521/right-granted.png "schreibrechte")

Wurden diese Rechte erlaubt, können wir die Dateien schreiben.

#### 2. Dateipfade

Die Dateipfade sind etwas versteckt und wir benötigen die oben genannten Module als Hilfe.

**Pfad zur bestehenden Datenbank.db**

```dart
String dbName = "doggie_database.db"; // name of the db
var databasesPath = await getDatabasesPath(); // default database path
var innerPath = join(databasesPath, dbName);
print(innerPath);
// /data/user/0/com.example.flutter_sqlite_database_export/databases/doggie_database.db
```

**Pfad ins Downloadverzeichnis**

```dart
Directory tempDir = await DownloadsPathProvider.downloadsDirectory;
String tempPath = tempDir.path;
```

**Ausflug in dein Android-Datenbankverzeichnis**
Wer in seine bestehende und laufende Applikation reinschauen möchte, dem empfehle ich im Android-Studio den **_Device-File-Explorer_**.

![device file explorer](/content/img/0521/file-explorer.png "device file explorer")

Unter **_/data/data/[name eurer applikation]/databases/nameEurerDB.db_** findet ihr eure SQlite Datenbank und könnte diese exportieren.

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

Die Datenbank-Datei wird als Bytes gelesen, und im Standard Dart I/O Verfahren von einem Ort zum anderen geschrieben. So erhält man eine Datenbank-Export für die in der App verwendete Datenbank.

Hier nochmal die ganze Methode samt Aufruf:

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

Schaut man nun auf dem Telefon über die App "Files" in das Downloadverzeichnis, findet man die besagte Datei.

Great Success! :-)

Diese Code-Blöcke eingebacken in die Flutter-Starter-Applikation habe ich unter [Github](https://github.com/derKuba/flutter-sqlite-database-export) für euch zur Verfügung gestellt.

Ihr habt Fragen oder Anregungen? Schreibt mir bei [Twitter](https://twitter.com/der_kuba)

**_Nachtrag vom 07.05.2021_**
Auf Android Q reicht der oben erwähnte Zusatz in der XML nicht aus. Man muss noch folgendes ergänzen:

```
  android:requestLegacyExternalStorage="true"
```

sodass die **_/android/app/src/main/AndroidManifest.xml_** wie folgt aussieht:

```
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

\
Tausend Dank fürs Lesen!

Kuba
