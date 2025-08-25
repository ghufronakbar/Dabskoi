import 'package:dabskoi/helper/sizes.dart';
import 'package:dabskoi/screen/home/tab/home/_widgets/koi_sell_widget.dart';
import 'package:flutter/material.dart';
import 'package:dabskoi/services/koi_service.dart';
import 'package:dabskoi/models/koi_responses.dart';

class HomeSell extends StatefulWidget {
  const HomeSell({super.key});

  @override
  State<HomeSell> createState() => _HomeSellState();
}

class _HomeSellState extends State<HomeSell> {
  bool _isLoading = true;
  String _error = '';

  final List<_SellItem> _items = [];

  @override
  void initState() {
    super.initState();
    _fetchSells();
  }

  Future<void> _fetchSells() async {
    setState(() {
      _isLoading = true;
      _error = '';
    });
    try {
      final list = await KoiService().getKoiSellList();
      // Ambil 6 item teratas agar serupa dengan legacy
      final mapped = list.take(6).map((r) => _SellItem(r, r)).toList();
      setState(() {
        _items
          ..clear()
          ..addAll(mapped);
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _error = 'Gagal memuat data jual beli: $e';
        _isLoading = false;
      });
    }
  }

  bool _isSoldOut(KoiResponse r) {
    // Anggap SELL dianggap sold out jika backend menandai selesai/dihapus atau ada winnerId
    return r.status == KoiStatus.SELESAI ||
        r.status == KoiStatus.DIHAPUS ||
        (r.winnerId != null && r.winnerId!.isNotEmpty);
  }

  @override
  Widget build(BuildContext context) {
    // bottom padding agar tidak ketutup nav bar
    final bottomPadding =
        MediaQuery.of(context).padding.bottom + kBottomNavigationBarHeight / 2;

    return Padding(
      padding: EdgeInsets.fromLTRB(
        UISizes.defaultSpace,
        UISizes.defaultSpace,
        UISizes.defaultSpace,
        bottomPadding,
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisSize: MainAxisSize.min,
        children: [
          // Title
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Expanded(
                child: Text(
                  'Jual Beli',
                  style: TextStyle(
                    fontWeight: FontWeight.bold,
                    fontSize: UISizes.md,
                  ),
                  overflow: TextOverflow.ellipsis,
                ),
              ),
            ],
          ),
          const SizedBox(height: UISizes.spaceBtwItems),

          if (_isLoading)
            const Center(
              child: Padding(
                padding: EdgeInsets.all(16.0),
                child: CircularProgressIndicator(),
              ),
            )
          else if (_error.isNotEmpty)
            _buildErrorWidget()
          else
            _buildKoiSoldGrid(context),
        ],
      ),
    );
  }

  Widget _buildKoiSoldGrid(BuildContext context) {
    final padding = MediaQuery.of(context).padding;
    final bottom = padding.bottom + kBottomNavigationBarHeight;

    if (_items.isEmpty) {
      return const Center(child: Text('No koi available for sale'));
    }

    return GridView.builder(
      padding: EdgeInsets.only(bottom: bottom),
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 2,
        childAspectRatio: 0.815,
        crossAxisSpacing: 12,
        mainAxisSpacing: 12,
      ),
      itemCount: _items.length,
      itemBuilder: (context, index) {
        final item = _items[index];
        final soldOut = _isSoldOut(item.data);

        return Stack(
          children: [
            KoiSellWidget(koi: item.ui, textSize: UISizes.xs),
            if (soldOut)
              Positioned.fill(
                child: Container(
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(16),
                    color: Colors.black.withAlpha(179),
                    border: Border.all(color: Colors.redAccent, width: 2),
                  ),
                  child: Container(
                    decoration: BoxDecoration(
                      borderRadius: BorderRadius.circular(14),
                      gradient: const LinearGradient(
                        colors: [
                          Color.fromRGBO(255, 0, 0, 0.5),
                          Color.fromRGBO(255, 0, 0, 0.7),
                        ],
                        begin: Alignment.topLeft,
                        end: Alignment.bottomRight,
                      ),
                    ),
                    child: const Center(
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(Icons.block, color: Colors.white, size: 40),
                          SizedBox(height: 8),
                          Text(
                            'SOLD OUT',
                            style: TextStyle(
                              color: Colors.white,
                              fontWeight: FontWeight.bold,
                              fontSize: 16,
                              letterSpacing: 1.5,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
              ),
          ],
        );
      },
    );
  }

  Widget _buildErrorWidget() {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Icon(Icons.error_outline, size: 48, color: Colors.red),
            const SizedBox(height: 8),
            Text(
              _error,
              textAlign: TextAlign.center,
              style: const TextStyle(fontSize: 14),
            ),
            const SizedBox(height: 16),
            ElevatedButton.icon(
              onPressed: _fetchSells,
              icon: const Icon(Icons.refresh),
              label: const Text('Retry'),
            ),
          ],
        ),
      ),
    );
  }
}

class _SellItem {
  final KoiResponse ui;
  final KoiResponse data;
  _SellItem(this.ui, this.data);
}
