import 'package:dabskoi/helper/colors.dart';
import 'package:dabskoi/helper/images_string.dart';
import 'package:dabskoi/helper/sizes.dart';
import 'package:dabskoi/helper/device_utils.dart';
import 'package:dabskoi/screen/splash/_widgets/onboarding_button.dart';
import 'package:dabskoi/screen/splash/_widgets/onboarding_indicator.dart';
import 'package:dabskoi/screen/splash/_widgets/onboarding_page.dart';
import 'package:dabskoi/screen/splash/_widgets/onboarding_skip.dart';
import 'package:flutter/material.dart';

class OnboardingScreen extends StatefulWidget {
  const OnboardingScreen({super.key});

  @override
  State<OnboardingScreen> createState() => _OnboardingScreenState();
}

class _OnboardingScreenState extends State<OnboardingScreen> {
  final PageController _pageController = PageController();
  int _currentPage = 0;

  // function to get current page
  void _onPageChanged(int index) {
    setState(() {
      _currentPage = index;
    });
  }

  final List<Widget> _pages = [
    OnBoardingPage(
      image: ImagesString.onboardingImages1,
      title: "Temukan Koi",
      subtitle:
          "Selamat datang di DabsKoiHouse, platform untuk menemukan ikan Koi idaman. Kami hadirkan koleksi Koi berkualitas dari penjual terpercaya. Setiap ikan punya foto jernih dan informasi lengkap. Gunakan fitur pencarian cerdas untuk dapatkan yang anda inginkan!",
    ),
    OnBoardingPage(
      image: ImagesString.onboardingImages2,
      title: "Tawar Mudah",
      subtitle:
          "DabsKoiHouse mempermudah Anda menawar ikan Koi. Tawarkan harga tertinggi lewat antarmuka yang simpel dan jelas. Ikuti tawaran secara langsung dan tingkatkan dengan mudah. Setelah menang, bayar dengan aman melalui pembayaran digital.",
    ),
    OnBoardingPage(
      image: ImagesString.onboardingImages3,
      title: "Kirim Aman",
      subtitle:
          "DabsKoiHouse memastikan Koi Anda tiba dengan aman. Lacak perjalanan ikan dari penjual hingga ke tangan Anda. Fitur real-time beri pembaruan status pengiriman yang jelas. Sambut Koi Anda dalam kondisi prima di kolam dengan penuh harapan pasti!",
    ),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: UIColors.mainWhite,
      body: Stack(
        children: [
          // Horizontal Scrollable Pages
          PageView(
            controller: _pageController,
            onPageChanged: _onPageChanged,
            children: _pages,
          ),

          // Skip Button
          OnBoardingSkip(),

          // Dot Navigation SmoothPageIndicator
          OnBoardingIndicator(pageController: _pageController),

          // Button
          if (_currentPage == 2)
            Positioned(
              bottom: DeviceUtils.getBottomNavigationBarHeight(),
              right: UISizes.defaultSpace,
              child: OnboardingButton(),
            ),
        ],
      ),
    );
  }
}
