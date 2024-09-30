---
title: How to export SQLite Database File in Flutter (Android)
description: Exporting SQLite database from the app in Android
date: 2021-05-02
tags: ["flutter", "sqlite"]
layout: layouts/post.njk
lang: "en"
alternate_lang: "de"
alternate_url: "/posts/0521/flutter-export-sqlite-db"
---

One of the many ways to store data in a [Flutter app](https://flutter.dev/) is [SQLite](https://www.sqlite.org/index.html). SQLite offers a relational database within the app without external dependencies or internet traffic. <!-- endOfPreview --> It is very practical and performs well for smaller, simpler queries. If you're looking for an overview of the options for storing data in Flutter, I recommend this [article (flutter-databases-sqflite-hive-objectbox-and-moor)](https://objectbox.io/flutter-databa...

I built an app that stores data in an SQLite database. I then faced the problem of how to migrate the data, for example, when switching phones. Since SQLite writes data to a \*.db file, there must be a way to access this file on the phone and export it from the app. I want to share how this can be achieved.

Prerequisites include a Flutter app and the following libraries:

```yaml
dependencies:
    flutter:
        sdk: flutter
    sqflite:
    path:
    permission_handler: ^7.0.0
    downloads_path_provider: ^0.1.0
```

-   **sqflite**: SQLite library
-   **path**: File paths
-   **permission_handler**: Permissions on the device
-   **downloads_path_provider**: Path to the download folder

The implementation idea was as follows:

1. Check the write permissions on the device.
2. Find the path to the \*.db file.
3. Open the file and write a copy to the download directory on the phone.

<br/>

#### 1. Write Permissions

To read and write files on the phone, you need write permissions. **Note:** I am referring only to the Android system here.
To get write permissions, add the following lines to the **_/android/app/src/main/AndroidManifest.xml_** file:

```xml
<uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE"/>
<uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE"/>
```

To notify the user that these permissions are required, I recommend the _permission_handler_ package. This allows you to prompt the user for the necessary write permissions and request them directly.

```dart
var status = await Permission.storage.status;
if (status.isDenied) {
    await Permission.storage.request();
    return;
}
```

The first line checks if the permissions have been declared in the XML file, and then whether the user has granted them. The third line displays a dialog asking the user to grant the permissions.

![write permissions](/img/0521/right-granted.png "write permissions")

Once the permissions are granted, you can write files.

#### 2. File Paths

The file paths are a bit hidden, and we need the modules mentioned above to help.

**Path to the existing database.db**

```dart
String dbName = "doggie_database.db"; // name of the database
var databasesPath = await getDatabasesPath(); // default database path
var innerPath = join(databasesPath, dbName);
print(innerPath);
// /data/user/0/com.example.flutter_sqlite_database_export/databases/doggie_database.db
```

**Path to the download directory**

```dart
Directory tempDir = await DownloadsPathProvider.downloadsDirectory;
String tempPath = tempDir.path;
```

**Exploring the Android Database Directory**
If you want to inspect your running application, I recommend using the **_Device File Explorer_** in Android Studio.

![device file explorer](/img/0521/file-explorer.png "device file explorer")

Under **_/data/data/[your app name]/databases/[yourDBName].db_** you can find your SQLite database and export it.

#### 3. Exporting the database.db

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

The database file is read as byte data and copied from one location to another using the standard Dart I/O procedure. This allows you to export the database used in the app.

Here is the complete method with invocation:

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
  if (status isDenied) {
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

When you open the "Files" app on your phone and look in the download directory, you should find the exported file.

Great Success! :-)

I have made these code snippets embedded in the Flutter Starter App available to you on [GitHub](https://github.com/derKuba/flutter-sqlite-database-export).

If you have any questions or suggestions, feel free to reach out to me on [Twitter](https://twitter.com/der_kuba).

**_Addendum from 07.05.2021_**
On Android Q, the aforementioned entry in the XML file is not sufficient. You also need to add the following:

```
  android:requestLegacyExternalStorage="true"
```

so that the **_/android/app/src/main/AndroidManifest.xml_** looks like this:

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

If you have any questions or suggestions, feel free to reach out to me on [Twitter](https://twitter.com/der_kuba).

Thank you so much for reading!

Kuba
