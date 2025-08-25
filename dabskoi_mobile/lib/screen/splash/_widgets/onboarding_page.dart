import 'package:dabskoi/helper/colors.dart';
import 'package:dabskoi/helper/helper_functions.dart';
import 'package:dabskoi/helper/sizes.dart';
import 'package:flutter/material.dart';

class OnBoardingPage extends StatelessWidget {
  const OnBoardingPage({
    super.key,
    required this.image,
    required this.title,
    required this.subtitle,
  });

  final String image, title, subtitle;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(UISizes.defaultSpace),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Image(
            width: HelperFunctions.responsiveWidth(context, 274), // 0.8
            height: HelperFunctions.responsiveHeight(context, 210), // 0.6
            image: AssetImage(image),
          ),
          const SizedBox(height: UISizes.spaceBtwItems),
          Text(
            title,
            style: Theme.of(context).textTheme.headlineMedium!.copyWith(
              color: UIColors.onboardingSubtitle,
              fontWeight: FontWeight.bold,
            ),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: UISizes.spaceBtwItems),
          Text(
            subtitle,
            style: Theme.of(context).textTheme.bodyMedium!.copyWith(
              color: UIColors.onboardingSubtitle,
              fontWeight: FontWeight.bold,
            ),
            textAlign: TextAlign.center,
          ),
        ],
      ),
    );
  }
}
