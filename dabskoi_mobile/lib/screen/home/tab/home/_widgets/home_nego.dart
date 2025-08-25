import 'package:dabskoi/screen/home/tab/koi/koi_detail_screen.dart';
import 'package:flutter/material.dart';
import 'package:dabskoi/services/koi_service.dart';
import 'package:dabskoi/models/koi_responses.dart';
import 'package:dabskoi/helper/colors.dart';
import 'package:dabskoi/helper/sizes.dart';

class HomeNego extends StatefulWidget {
  const HomeNego({super.key});

  @override
  State<HomeNego> createState() => _HomeNegoState();
}

class _HomeNegoState extends State<HomeNego> {
  bool _isLoading = true;
  String _error = '';
  KoiResponse? _latest;

  static const _imgPlaceholder = 'assets/carousel/koi_image.png';

  @override
  void initState() {
    super.initState();
    _fetchLatestNego();
  }

  Future<void> _fetchLatestNego() async {
    setState(() {
      _isLoading = true;
      _error = '';
    });

    try {
      final list = await KoiService().getKoiNegoList();
      if (list.isEmpty) {
        setState(() {
          _latest = null;
          _isLoading = false;
        });
        return;
      }

      // Ambil yang terbaru berdasar createdAt (descending)
      list.sort((a, b) => b.createdAt.compareTo(a.createdAt));
      setState(() {
        _latest = list.first;
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _error = 'Gagal memuat item negosiasi: $e';
        _isLoading = false;
      });
    }
  }

  String _fmtPrice(num v) => 'Rp ${v.toStringAsFixed(0)}';

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      mainAxisSize: MainAxisSize.min, // cegah overflow vertikal
      children: [
        Text(
          "Koi Terbaru Untuk Negosiasi",
          style: TextStyle(fontWeight: FontWeight.bold, fontSize: UISizes.md),
        ),
        const SizedBox(height: UISizes.spaceBtwItems),

        if (_isLoading)
          const Center(child: CircularProgressIndicator())
        else if (_error.isNotEmpty)
          Padding(
            padding: const EdgeInsets.all(UISizes.md),
            child: Column(
              children: [
                const Icon(Icons.error_outline, color: Colors.red),
                const SizedBox(height: UISizes.xs),
                Text(
                  _error,
                  textAlign: TextAlign.center,
                  style: const TextStyle(color: Colors.red),
                ),
                const SizedBox(height: UISizes.sm),
                ElevatedButton.icon(
                  onPressed: _fetchLatestNego,
                  icon: const Icon(Icons.refresh),
                  label: const Text('Coba lagi'),
                ),
              ],
            ),
          )
        else if (_latest == null)
          const Center(child: Text('No negotiable items available'))
        else
          SingleChildScrollView(
            child: Container(
              decoration: BoxDecoration(
                color: UIColors.mainWhite,
                borderRadius: BorderRadius.circular(UISizes.borderRadiusMd),
                boxShadow: [
                  BoxShadow(
                    color: Colors.grey.withOpacity(0.1),
                    spreadRadius: 1,
                    blurRadius: 2,
                    offset: const Offset(0, 1),
                  ),
                ],
              ),
              child: Padding(
                padding: const EdgeInsets.all(UISizes.md),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    // Gambar
                    Container(
                      width: double.infinity,
                      height: 150,
                      decoration: BoxDecoration(
                        borderRadius: BorderRadius.circular(
                          UISizes.borderRadiusMd,
                        ),
                      ),
                      clipBehavior: Clip.antiAlias,
                      child: Stack(
                        children: [
                          // Ambil gambar pertama jika ada, jika tidak pakai asset lokal
                          if ((_latest!.images).isNotEmpty)
                            Image.network(
                              _latest!.images.first,
                              width: double.infinity,
                              height: double.infinity,
                              fit: BoxFit.cover,
                              errorBuilder: (_, __, ___) => Image.asset(
                                _imgPlaceholder,
                                fit: BoxFit.cover,
                                width: double.infinity,
                                height: double.infinity,
                              ),
                            )
                          else
                            Image.asset(
                              _imgPlaceholder,
                              fit: BoxFit.cover,
                              width: double.infinity,
                              height: double.infinity,
                            ),
                        ],
                      ),
                    ),
                    const SizedBox(height: UISizes.spaceBtwItems),

                    // Detail
                    Container(
                      width: double.infinity,
                      padding: const EdgeInsets.all(UISizes.md),
                      decoration: BoxDecoration(
                        color: UIColors.mainWhite,
                        borderRadius: BorderRadius.circular(
                          UISizes.borderRadiusMd,
                        ),
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            _latest!.name,
                            style: const TextStyle(
                              fontSize: UISizes.fontSizeLg,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                          const SizedBox(height: UISizes.spaceBtwItems),
                          Row(
                            children: [
                              Text(
                                _fmtPrice(_latest!.price),
                                style: const TextStyle(
                                  fontSize: UISizes.fontSizeMd,
                                  fontWeight: FontWeight.bold,
                                  color: UIColors.mainRed,
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: UISizes.spaceBtwItems),
                          Text(
                            // contoh: "32 cm • 1100 g • Jantan"
                            '${_latest!.length} cm • ${_latest!.weight} g • ${_latest!.gender.label}',
                            style: TextStyle(
                              fontSize: UISizes.fontSizeSm,
                              color: Colors.grey[600],
                            ),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: UISizes.spaceBtwItems),

                    // Tombol Negosiasi
                    SizedBox(
                      width: double.infinity,
                      child: ElevatedButton(
                        onPressed: () {
                          Navigator.push(
                            context,
                            MaterialPageRoute(
                              builder: (_) => KoiDetailScreen(
                                id: _latest!.id,
                                type: KoiFetchType.negos,
                              ),
                            ),
                          );
                        },
                        style: ElevatedButton.styleFrom(
                          backgroundColor: UIColors.mainRed,
                          padding: const EdgeInsets.symmetric(
                            vertical: UISizes.sm,
                          ),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(
                              UISizes.borderRadiusSm,
                            ),
                          ),
                        ),
                        child: const Text(
                          'Negosiasi',
                          style: TextStyle(color: UIColors.mainWhite),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
      ],
    );
  }
}
