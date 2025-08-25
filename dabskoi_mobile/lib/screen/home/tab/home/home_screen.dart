import 'package:dabskoi/helper/helper_functions.dart';
import 'package:dabskoi/helper/sizes.dart';
import 'package:dabskoi/screen/home/main_tab.dart';
import 'package:dabskoi/screen/home/tab/home/_widgets/home_auction.dart';
import 'package:dabskoi/screen/home/tab/home/_widgets/home_carousel.dart';
import 'package:dabskoi/screen/home/tab/home/_widgets/home_nego.dart';
import 'package:dabskoi/screen/home/tab/home/_widgets/home_sell.dart';
import 'package:flutter/material.dart';

class HomeScreen extends StatelessWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return SafeArea(
      child: ListView(
        children: [
          // Carousel
          SizedBox(
            height: HelperFunctions.screenHeight(context) * 0.3,
            child: HomeCarousel(),
          ),

          // Gap
          SizedBox(height: UISizes.spaceBtwSections * 2),

          // Auction
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: UISizes.xl),
            child: HomeAuction(),
          ),

          // Gap
          SizedBox(height: UISizes.spaceBtwSections),

          // View auction placements button
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: UISizes.xl),
            child: ElevatedButton.icon(
              onPressed: () {
                Navigator.push(
                  context,
                  MaterialPageRoute(
                    builder: (context) => const MainTab(initialIndex: 1),
                  ),
                );
              },
              icon: const Icon(Icons.gavel, color: Colors.white),
              label: const Text(
                'Lihat Penaruhan Lelang',
                style: TextStyle(color: Colors.white),
              ),
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFFBB0000),
                padding: const EdgeInsets.symmetric(vertical: 12),
                minimumSize: const Size(double.infinity, 0),
              ),
            ),
          ),

          // Gap
          SizedBox(height: UISizes.spaceBtwSections * 2),

          // Sell
          HomeSell(),

          // Gap
          SizedBox(height: UISizes.spaceBtwSections),

          // Sell
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: UISizes.xl),
            child: HomeNego(),
          ),

          // Gap
          SizedBox(height: UISizes.spaceBtwSections),
        ],
      ),
    );
  }
}
