import 'package:dabskoi/helper/notify_snack_bar.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:dabskoi/helper/colors.dart';
import 'package:dabskoi/helper/sizes.dart';
import 'package:dabskoi/services/account_service.dart';
import 'package:dabskoi/models/account_requests.dart';
import 'package:dabskoi/models/account_responses.dart';
import 'package:dabskoi/services/image_upload_service.dart';
import 'package:image_picker/image_picker.dart';

class AccountEditScreen extends StatefulWidget {
  final Account account;
  const AccountEditScreen({super.key, required this.account});

  @override
  State<AccountEditScreen> createState() => _AccountEditScreenState();
}

class _AccountEditScreenState extends State<AccountEditScreen> {
  final _formKey = GlobalKey<FormState>();
  final _svc = AccountService();
  final _imgSvc = ImageUploadService();

  late final TextEditingController _emailC;
  late final TextEditingController _nameC;
  late final TextEditingController _phoneC;
  late final TextEditingController _addressC;

  bool _saving = false;

  // NEW: state picture
  String? _pictureUrl; // null = tidak ada / dihapus
  bool _uploadingPicture = false;

  @override
  void initState() {
    super.initState();
    _emailC = TextEditingController(text: widget.account.email);
    _nameC = TextEditingController(text: widget.account.name);
    _phoneC = TextEditingController(text: widget.account.phone ?? '');
    _addressC = TextEditingController(text: widget.account.address ?? '');
    _pictureUrl = widget.account.picture; // init dari akun
  }

  @override
  void dispose() {
    _emailC.dispose();
    _nameC.dispose();
    _phoneC.dispose();
    _addressC.dispose();
    super.dispose();
  }

  bool get _hasChanges =>
      _emailC.text.trim() != widget.account.email ||
      _nameC.text.trim() != widget.account.name ||
      _phoneC.text.trim() != (widget.account.phone ?? '') ||
      _addressC.text.trim() != (widget.account.address ?? '') ||
      (_pictureUrl ?? '') != (widget.account.picture ?? '');

  String? _validateEmail(String? v) {
    final s = v?.trim() ?? '';
    if (s.isEmpty) return 'Email wajib diisi';
    final ok = RegExp(r'^[^@\s]+@[^@\s]+\.[^@\s]+$').hasMatch(s);
    if (!ok) return 'Format email tidak valid';
    return null;
  }

  String? _validateRequired(String? v, {String field = 'Field'}) {
    if ((v ?? '').trim().isEmpty) return '$field wajib diisi';
    return null;
  }

  Future<void> _save() async {
    if (!_formKey.currentState!.validate()) return;
    if (!_hasChanges) {
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(const SnackBar(content: Text('Tidak ada perubahan')));
      return;
    }

    setState(() => _saving = true);
    try {
      final body = UpdateProfileRequest(
        email: _emailC.text.trim(),
        name: _nameC.text.trim(),
        phone: _phoneC.text.trim(),
        address: _addressC.text.trim(),
        // NEW: kirim URL gambar (null jika dihapus/tidak ada)
        picture: (_pictureUrl != null && _pictureUrl!.trim().isNotEmpty)
            ? _pictureUrl!.trim()
            : null,
      );

      await _svc.updateProfile(body);

      if (!mounted) return;
      NotifySnackBar.showSuccess(context, "Profil berhasil diperbarui");
      Navigator.pop(context);
    } catch (e) {
      if (!mounted) return;
      NotifySnackBar.showError(context, e);
    } finally {
      if (mounted) setState(() => _saving = false);
    }
  }

  Future<bool> _confirmLeaveIfDirty() async {
    if (!_hasChanges || _saving) return true;
    final res = await showDialog<bool>(
      context: context,
      builder: (_) => AlertDialog(
        title: const Text('Batal mengedit?'),
        content: const Text('Perubahan belum disimpan. Keluar dari halaman?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: const Text('Tetap di sini'),
          ),
          TextButton(
            onPressed: () => Navigator.pop(context, true),
            child: const Text('Keluar'),
          ),
        ],
      ),
    );
    return res == true;
  }

  // ====== NEW: Upload & Action Sheet ======

  Future<void> _onTapAvatar() async {
    if (_uploadingPicture) return;
    showModalBottomSheet(
      context: context,
      showDragHandle: true,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(UISizes.borderRadiusLg),
      ),
      builder: (_) => SafeArea(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            ListTile(
              leading: const Icon(Icons.photo_camera_outlined),
              title: const Text('Kamera'),
              onTap: () async {
                Navigator.pop(context);
                await _pickAndUpload(ImageSource.camera);
              },
            ),
            ListTile(
              leading: const Icon(Icons.photo_outlined),
              title: const Text('Galeri'),
              onTap: () async {
                Navigator.pop(context);
                await _pickAndUpload(ImageSource.gallery);
              },
            ),
            if ((_pictureUrl ?? '').isNotEmpty)
              ListTile(
                leading: const Icon(Icons.delete_outline, color: Colors.red),
                title: const Text(
                  'Hapus foto',
                  style: TextStyle(color: Colors.red),
                ),
                onTap: () {
                  Navigator.pop(context);
                  setState(() => _pictureUrl = null);
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('Foto profil dihapus')),
                  );
                },
              ),
            ListTile(
              leading: const Icon(Icons.close),
              title: const Text('Batal'),
              onTap: () => Navigator.pop(context),
            ),
          ],
        ),
      ),
    );
  }

  Future<void> _pickAndUpload(ImageSource src) async {
    try {
      final picker = ImagePicker();
      final XFile? file = await picker.pickImage(source: src, imageQuality: 85);
      if (file == null) return;

      setState(() => _uploadingPicture = true);

      final url = await _imgSvc.uploadXFile(
        file,
        onSendProgress: (s, t) {
          // optional: bisa tampilkan progress kalau mau
        },
      );

      if (!mounted) return;
      setState(() => _pictureUrl = url);
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(const SnackBar(content: Text('Foto berhasil diunggah')));
    } catch (e) {
      if (!mounted) return;
      NotifySnackBar.showError(context, 'Gagal mengunggah foto: $e');
    } finally {
      if (mounted) setState(() => _uploadingPicture = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final primary = UIColors.mainRed;
    final picture = _pictureUrl?.trim(); // gunakan state terbaru

    return WillPopScope(
      onWillPop: _confirmLeaveIfDirty,
      child: Scaffold(
        backgroundColor: UIColors.tabMainBacground,
        appBar: AppBar(
          backgroundColor: UIColors.mainWhite,
          elevation: 0.5,
          leading: IconButton(
            icon: const Icon(Icons.arrow_back),
            onPressed: () async {
              if (await _confirmLeaveIfDirty()) {
                if (!mounted) return;
                Navigator.pop(context);
              }
            },
          ),
          title: const Text(
            'Edit Profil',
            style: TextStyle(fontWeight: FontWeight.bold, fontSize: UISizes.md),
          ),
        ),
        body: SingleChildScrollView(
          padding: const EdgeInsets.fromLTRB(16, UISizes.md, 16, UISizes.lg),
          child: Column(
            children: [
              // Header avatar + nama
              Container(
                padding: const EdgeInsets.all(UISizes.md),
                decoration: BoxDecoration(
                  color: UIColors.mainWhite,
                  borderRadius: BorderRadius.circular(UISizes.borderRadiusMd),
                  border: Border.all(color: Colors.black12),
                  boxShadow: const [
                    BoxShadow(
                      color: Color.fromRGBO(0, 0, 0, 0.05),
                      blurRadius: 8,
                      offset: Offset(0, 3),
                    ),
                  ],
                ),
                child: Row(
                  children: [
                    GestureDetector(
                      onTap: _onTapAvatar,
                      child: Stack(
                        alignment: Alignment.center,
                        children: [
                          CircleAvatar(
                            radius: 36,
                            backgroundColor: primary.withOpacity(0.1),
                            backgroundImage:
                                (picture != null && picture.isNotEmpty)
                                ? NetworkImage(picture)
                                : null,
                            child: (picture == null || picture.isEmpty)
                                ? Text(
                                    widget.account.name.isNotEmpty
                                        ? widget.account.name[0].toUpperCase()
                                        : '?',
                                    style: TextStyle(
                                      color: primary,
                                      fontWeight: FontWeight.bold,
                                      fontSize: 24,
                                    ),
                                  )
                                : null,
                          ),
                          // edit overlay kecil
                          Positioned(
                            bottom: -2,
                            right: -2,
                            child: Container(
                              decoration: BoxDecoration(
                                color: UIColors.mainWhite,
                                shape: BoxShape.circle,
                                boxShadow: const [
                                  BoxShadow(
                                    color: Color.fromRGBO(0, 0, 0, 0.15),
                                    blurRadius: 4,
                                  ),
                                ],
                              ),
                              padding: const EdgeInsets.all(4),
                              child: Icon(Icons.edit, size: 16, color: primary),
                            ),
                          ),
                          if (_uploadingPicture)
                            Container(
                              width: 72,
                              height: 72,
                              decoration: BoxDecoration(
                                color: Colors.black.withOpacity(0.35),
                                shape: BoxShape.circle,
                              ),
                              child: const Padding(
                                padding: EdgeInsets.all(12),
                                child: CircularProgressIndicator(
                                  strokeWidth: 2.5,
                                  color: Colors.white,
                                ),
                              ),
                            ),
                        ],
                      ),
                    ),
                    const SizedBox(width: UISizes.md),
                    Expanded(
                      child: Text(
                        'Perbarui informasi Anda',
                        style: TextStyle(color: Colors.grey[700]),
                      ),
                    ),
                  ],
                ),
              ),

              const SizedBox(height: UISizes.spaceBtwSections),

              // Form
              Container(
                padding: const EdgeInsets.all(UISizes.md),
                decoration: BoxDecoration(
                  color: UIColors.mainWhite,
                  borderRadius: BorderRadius.circular(UISizes.borderRadiusMd),
                  border: Border.all(color: Colors.black12),
                ),
                child: Form(
                  key: _formKey,
                  child: Column(
                    children: [
                      _LabeledField(
                        label: 'Email',
                        child: TextFormField(
                          controller: _emailC,
                          keyboardType: TextInputType.emailAddress,
                          autofillHints: const [AutofillHints.email],
                          validator: _validateEmail,
                          decoration: const InputDecoration(
                            prefixIcon: Icon(Icons.mail_outline),
                            hintText: 'nama@email.com',
                            border: OutlineInputBorder(),
                          ),
                        ),
                      ),
                      const SizedBox(height: UISizes.sm),

                      _LabeledField(
                        label: 'Nama',
                        child: TextFormField(
                          controller: _nameC,
                          textCapitalization: TextCapitalization.words,
                          autofillHints: const [AutofillHints.name],
                          validator: (v) => _validateRequired(v, field: 'Nama'),
                          decoration: const InputDecoration(
                            prefixIcon: Icon(Icons.person_outline),
                            hintText: 'Nama lengkap',
                            border: OutlineInputBorder(),
                          ),
                        ),
                      ),
                      const SizedBox(height: UISizes.sm),

                      _LabeledField(
                        label: 'Nomor HP',
                        child: TextFormField(
                          controller: _phoneC,
                          keyboardType: TextInputType.phone,
                          autofillHints: const [AutofillHints.telephoneNumber],
                          inputFormatters: [
                            FilteringTextInputFormatter.allow(
                              RegExp(r'[0-9+ ]'),
                            ),
                          ],
                          validator: (v) =>
                              _validateRequired(v, field: 'Nomor HP'),
                          decoration: const InputDecoration(
                            prefixIcon: Icon(Icons.phone_outlined),
                            hintText: '08xxxxxxxxxx',
                            border: OutlineInputBorder(),
                          ),
                        ),
                      ),
                      const SizedBox(height: UISizes.sm),

                      _LabeledField(
                        label: 'Alamat',
                        child: TextFormField(
                          controller: _addressC,
                          minLines: 2,
                          maxLines: 4,
                          textCapitalization: TextCapitalization.sentences,
                          autofillHints: const [
                            AutofillHints.fullStreetAddress,
                          ],
                          validator: (v) =>
                              _validateRequired(v, field: 'Alamat'),
                          decoration: const InputDecoration(
                            prefixIcon: Icon(Icons.home_outlined),
                            hintText: 'Alamat lengkap',
                            border: OutlineInputBorder(),
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ),

              const SizedBox(height: UISizes.spaceBtwSections),

              // Tombol simpan
              SizedBox(
                width: double.infinity,
                child: ElevatedButton.icon(
                  onPressed: _saving ? null : _save,
                  icon: _saving
                      ? const SizedBox(
                          width: 16,
                          height: 16,
                          child: CircularProgressIndicator(strokeWidth: 2),
                        )
                      : const Icon(Icons.save_outlined, color: Colors.white),
                  label: const Text(
                    'Simpan Perubahan',
                    style: TextStyle(
                      fontWeight: FontWeight.bold,
                      color: Colors.white,
                    ),
                  ),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: primary,
                    padding: const EdgeInsets.symmetric(vertical: 14),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(UISizes.md),
                    ),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _LabeledField extends StatelessWidget {
  final String label;
  final Widget child;
  const _LabeledField({required this.label, required this.child});

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: TextStyle(
            fontSize: 12,
            color: Colors.grey[700],
            fontWeight: FontWeight.w600,
          ),
        ),
        const SizedBox(height: 6),
        child,
      ],
    );
  }
}
