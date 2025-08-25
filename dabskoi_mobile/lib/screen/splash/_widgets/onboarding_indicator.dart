import 'package:dabskoi/helper/colors.dart';
import 'package:dabskoi/helper/device_utils.dart';
import 'package:flutter/material.dart';
import 'package:smooth_page_indicator/smooth_page_indicator.dart';

class OnBoardingIndicator extends StatelessWidget {
  const OnBoardingIndicator({super.key, required PageController pageController})
    : _pageController = pageController;

  final PageController _pageController;

  @override
  Widget build(BuildContext context) {
    return Positioned(
      bottom: DeviceUtils.getBottomNavigationBarHeight(), // posisi scroll bar
      left: 0,
      right: 0,
      child: Center(
        child: SmoothPageIndicator(
          controller: _pageController,
          count: 3,
          effect: ExpandingDotsEffect(
            activeDotColor: UIColors.mainRed,
            dotColor: UIColors.dotColors,
            dotHeight: 10,
          ),
        ),
      ),
    );
  }
}
