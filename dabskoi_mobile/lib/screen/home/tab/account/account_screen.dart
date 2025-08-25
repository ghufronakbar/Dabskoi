import 'package:dabskoi/core/account_storage.dart';
import 'package:dabskoi/core/token_storage.dart';
import 'package:dabskoi/helper/notify_snack_bar.dart';
import 'package:dabskoi/models/account_responses.dart';
import 'package:dabskoi/screen/home/tab/account/account_edit_screen.dart';
import 'package:dabskoi/screen/splash/_widgets/onboarding_screen.dart';
import 'package:flutter/material.dart';
import 'package:dabskoi/helper/colors.dart';
import 'package:dabskoi/helper/sizes.dart';
import 'package:dabskoi/services/account_service.dart';
import 'package:url_launcher/url_launcher.dart';

class AccountScreen extends StatefulWidget {
  const AccountScreen({super.key});

  @override
  State<AccountScreen> createState() => _AccountScreenState();
}

class _AccountScreenState extends State<AccountScreen> {
  final _svc = AccountService();

  bool _loading = true;
  String _error = '';
  Account? _data;

  @override
  void initState() {
    super.initState();
    _fetch();
  }

  Future<void> _fetch() async {
    setState(() {
      _loading = true;
      _error = '';
    });
    try {
      final res = await _svc.getProfile();
      setState(() {
        _data = res;
        _loading = false;
      });
    } catch (e) {
      setState(() {
        _error = 'Gagal memuat profil: $e';
        _loading = false;
      });
    }
  }

  Future<void> _onEdit() async {
    if (_data == null) return;
    await Navigator.push(
      context,
      MaterialPageRoute(builder: (_) => AccountEditScreen(account: _data!)),
    );
    if (!mounted) return;
    await _fetch();
  }

  Future<void> _onLogout() async {
    if (!mounted) return;
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text("Logout"),
        content: const Text("Apakah Anda yakin ingin logout?"),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text("Batal"),
          ),
          TextButton(
            onPressed: () async {
              NotifySnackBar.showSuccess(context, "Berhasil Logout");
              await TokenStorage.clear();
              await AccountStorage.clear();
              if (!mounted) return;
              Navigator.pushAndRemoveUntil(
                context,
                MaterialPageRoute(builder: (_) => OnboardingScreen()),
                (route) => false,
              );
            },
            child: const Text("Logout"),
          ),
        ],
      ),
    );
  }

  Future<void> _openExternal(String url) async {
    final uri = Uri.tryParse(url);
    if (uri == null) return;
    await launchUrl(uri, mode: LaunchMode.externalApplication);
  }

  @override
  Widget build(BuildContext context) {
    final primary = UIColors.mainRed;

    return Scaffold(
      backgroundColor: Colors.grey[100],
      appBar: AppBar(
        backgroundColor: UIColors.mainWhite,
        elevation: 0.5,
        title: const Text(
          'Akun',
          style: TextStyle(fontWeight: FontWeight.bold, fontSize: UISizes.md),
        ),
        actions: [
          IconButton(
            tooltip: 'Refresh',
            icon: const Icon(Icons.refresh),
            onPressed: _fetch,
          ),
        ],
      ),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : _error.isNotEmpty
          ? _ErrorView(message: _error, onRetry: _fetch)
          : RefreshIndicator(
              onRefresh: _fetch,
              child: SingleChildScrollView(
                physics: const AlwaysScrollableScrollPhysics(),
                child: Column(
                  children: [
                    // === PROFILE CARD (centered like legacy) ===
                    Container(
                      width: double.infinity,
                      margin: const EdgeInsets.fromLTRB(20, 20, 20, 20),
                      padding: const EdgeInsets.all(20),
                      decoration: BoxDecoration(
                        color: UIColors.mainWhite,
                        borderRadius: BorderRadius.circular(
                          UISizes.borderRadiusMd,
                        ),
                        boxShadow: const [
                          BoxShadow(
                            color: Color.fromRGBO(158, 158, 158, 0.1),
                            spreadRadius: 1,
                            blurRadius: 2,
                            offset: Offset(0, 1),
                          ),
                        ],
                        border: Border.all(color: Colors.black12),
                      ),
                      child: Column(
                        children: [
                          // Avatar
                          Container(
                            width: 100,
                            height: 100,
                            decoration: BoxDecoration(
                              shape: BoxShape.circle,
                              color: Colors.grey[200],
                              border: Border.all(
                                color: Colors.grey[300]!,
                                width: 2,
                              ),
                            ),
                            clipBehavior: Clip.antiAlias,
                            child:
                                (_data!.picture != null &&
                                    _data!.picture!.isNotEmpty)
                                ? Image.network(
                                    _data!.picture!,
                                    fit: BoxFit.cover,
                                    errorBuilder: (_, __, ___) => Icon(
                                      Icons.person,
                                      size: 50,
                                      color: Colors.grey[600],
                                    ),
                                  )
                                : Icon(
                                    Icons.person,
                                    size: 50,
                                    color: Colors.grey[600],
                                  ),
                          ),
                          const SizedBox(height: 12),

                          // Name
                          Text(
                            _data!.name.isEmpty ? 'Pengguna' : _data!.name,
                            style: const TextStyle(
                              fontWeight: FontWeight.bold,
                              fontSize: 18,
                            ),
                          ),
                          const SizedBox(height: 4),

                          // "username" ala legacy -> pakai local-part email
                          Text(
                            _data!.email,
                            style: TextStyle(
                              color: Colors.grey[600],
                              fontSize: 14,
                            ),
                          ),
                          const SizedBox(height: 20),

                          // Edit Profile Button
                          SizedBox(
                            width: double.infinity,
                            child: ElevatedButton(
                              onPressed: _onEdit,
                              style: ElevatedButton.styleFrom(
                                foregroundColor: Colors.white,
                                backgroundColor: primary,
                                padding: const EdgeInsets.symmetric(
                                  vertical: 15,
                                ),
                                shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(5),
                                ),
                              ),
                              child: const Text(
                                'Edit Profile',
                                style: TextStyle(
                                  fontSize: 16,
                                  fontWeight: FontWeight.w500,
                                ),
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),

                    // === PERSONAL INFO CARD + SOCIAL + LOGOUT (legacy-like) ===
                    Container(
                      width: double.infinity,
                      margin: const EdgeInsets.fromLTRB(20, 0, 20, 20),
                      padding: const EdgeInsets.all(20),
                      decoration: BoxDecoration(
                        color: UIColors.mainWhite,
                        borderRadius: BorderRadius.circular(
                          UISizes.borderRadiusMd,
                        ),
                        boxShadow: const [
                          BoxShadow(
                            color: Color.fromRGBO(158, 158, 158, 0.1),
                            spreadRadius: 1,
                            blurRadius: 2,
                            offset: Offset(0, 1),
                          ),
                        ],
                        border: Border.all(color: Colors.black12),
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text(
                            'Informasi Pribadi',
                            style: TextStyle(
                              fontWeight: FontWeight.bold,
                              fontSize: 16,
                            ),
                          ),
                          const SizedBox(height: 20),

                          _fieldBlock(title: 'Email', value: _data!.email),
                          const SizedBox(height: 15),

                          _fieldBlock(
                            title: 'No Telepon',
                            value: _data!.phone?.isNotEmpty == true
                                ? _data!.phone!
                                : 'Belum diisi',
                          ),
                          const SizedBox(height: 15),

                          _fieldBlock(
                            title: 'Alamat',
                            value: _data!.address?.isNotEmpty == true
                                ? _data!.address!
                                : 'Belum diisi',
                          ),
                          const SizedBox(height: 20),

                          Row(
                            children: [
                              _SocialCircleButton(
                                icon: Icons.phone,
                                tooltip: 'Facebook',
                                color: primary,
                                onTap: () => _openExternal(
                                  'https://www.facebook.com/DABSKOIHOUSE',
                                ),
                              ),
                              const SizedBox(width: 15),
                              _SocialCircleButton(
                                icon: Icons.camera_alt_outlined,
                                tooltip: 'Instagram',
                                color: primary,
                                onTap: () => _openExternal(
                                  'https://instagram.com/dabskoihouse',
                                ),
                              ),
                              const SizedBox(width: 15),
                              _SocialCircleButton(
                                icon: Icons.play_arrow,
                                tooltip: 'YouTube',
                                color: primary,
                                onTap: () => _openExternal(
                                  'https://www.youtube.com/@dabskoihouse',
                                ),
                              ),
                              const Spacer(),
                              TextButton.icon(
                                onPressed: _onLogout,
                                icon: Icon(
                                  Icons.logout,
                                  color: primary,
                                  size: 20,
                                ),
                                label: Text(
                                  'Log Out',
                                  style: TextStyle(
                                    color: primary,
                                    fontWeight: FontWeight.w500,
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ),
    );
  }

  Widget _fieldBlock({required String title, required String value}) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(title, style: TextStyle(color: Colors.grey[600], fontSize: 14)),
        const SizedBox(height: 4),
        Text(
          value,
          style: const TextStyle(fontWeight: FontWeight.w500, fontSize: 14),
        ),
      ],
    );
  }
}

class _SocialCircleButton extends StatelessWidget {
  final IconData icon;
  final String tooltip;
  final Color color;
  final VoidCallback onTap;

  const _SocialCircleButton({
    required this.icon,
    required this.tooltip,
    required this.color,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Tooltip(
      message: tooltip,
      child: GestureDetector(
        onTap: onTap,
        child: Container(
          width: 40,
          height: 40,
          decoration: BoxDecoration(color: color, shape: BoxShape.circle),
          child: Icon(icon, color: Colors.white, size: 20),
        ),
      ),
    );
  }
}

class _ErrorView extends StatelessWidget {
  final String message;
  final VoidCallback onRetry;
  const _ErrorView({required this.message, required this.onRetry});

  @override
  Widget build(BuildContext context) {
    final m = message.isEmpty ? 'Terjadi kesalahan' : message;
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(UISizes.md),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Icon(Icons.error_outline, size: 48, color: Colors.red),
            const SizedBox(height: UISizes.sm),
            Text(m, textAlign: TextAlign.center),
            const SizedBox(height: UISizes.sm),
            ElevatedButton.icon(
              onPressed: onRetry,
              icon: const Icon(Icons.refresh),
              label: const Text('Coba lagi'),
            ),
          ],
        ),
      ),
    );
  }
}
