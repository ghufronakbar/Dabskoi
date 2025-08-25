import 'dart:typed_data';
import 'dart:io' show File;
import 'package:dio/dio.dart';
import 'package:flutter/foundation.dart' show kIsWeb;
import 'package:image_picker/image_picker.dart';
import 'package:dabskoi/core/dio_client.dart';

class ImageUploadService {
  final Dio _dio;
  ImageUploadService({Dio? dio}) : _dio = dio ?? DioClient.I;

  Future<String> uploadFile(
    File file, {
    String fieldName = 'image',
    void Function(int sent, int total)? onSendProgress,
  }) async {
    final fileName = file.path.split('/').last;

    final formData = FormData.fromMap({
      fieldName: await MultipartFile.fromFile(file.path, filename: fileName),
    });

    final res = await _dio.post(
      '/image',
      data: formData,
      options: Options(contentType: 'multipart/form-data'),
      onSendProgress: onSendProgress,
    );

    final path = res.data?['data']?['path']?.toString();
    if (path == null || path.isEmpty) {
      throw Exception(
        'Upload berhasil, namun path tidak ditemukan pada response.',
      );
    }
    return path;
  }

  Future<String> uploadBytes(
    Uint8List bytes, {
    String filename = 'upload.jpg',
    String fieldName = 'image',
    void Function(int sent, int total)? onSendProgress,
  }) async {
    final formData = FormData.fromMap({
      fieldName: MultipartFile.fromBytes(bytes, filename: filename),
    });

    final res = await _dio.post(
      '/image',
      data: formData,
      options: Options(contentType: 'multipart/form-data'),
      onSendProgress: onSendProgress,
    );

    final path = res.data?['data']?['path']?.toString();
    if (path == null || path.isEmpty) {
      throw Exception(
        'Upload berhasil, namun path tidak ditemukan pada response.',
      );
    }
    return path;
  }

  Future<String> uploadXFile(
    XFile xfile, {
    String fieldName = 'image',
    void Function(int sent, int total)? onSendProgress,
  }) async {
    if (kIsWeb) {
      final bytes = await xfile.readAsBytes();
      final name = xfile.name.isNotEmpty ? xfile.name : 'upload.jpg';
      return uploadBytes(
        bytes,
        filename: name,
        fieldName: fieldName,
        onSendProgress: onSendProgress,
      );
    } else {
      return uploadFile(
        File(xfile.path),
        fieldName: fieldName,
        onSendProgress: onSendProgress,
      );
    }
  }

  /// (Opsional) upload multiple files. Mengembalikan list path.
  Future<List<String>> uploadFiles(
    List<File> files, {
    String fieldName = 'images', // jika backend menerima array
    void Function(int sent, int total)? onSendProgress,
  }) async {
    final formData = FormData();

    for (final f in files) {
      final name = f.path.split('/').last;
      formData.files.add(
        MapEntry(
          fieldName,
          await MultipartFile.fromFile(f.path, filename: name),
        ),
      );
    }

    final res = await _dio.post(
      '/image',
      data: formData,
      options: Options(contentType: 'multipart/form-data'),
      onSendProgress: onSendProgress,
    );

    // Sesuaikan parsing kalau backend return array path
    final data = res.data?['data'];
    if (data is List) {
      return data
          .map((e) => e?['path']?.toString())
          .whereType<String>()
          .toList();
    } else if (data is Map) {
      final path = data['path']?.toString();
      if (path != null && path.isNotEmpty) return [path];
    }
    throw Exception('Tidak dapat membaca path dari response.');
  }
}
