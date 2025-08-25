import 'package:dabskoi/helper/colors.dart';
import 'package:dabskoi/helper/sizes.dart';
import 'package:dabskoi/helper/device_utils.dart';
import 'package:dabskoi/screen/auth/login_signup_screen.dart';
import 'package:flutter/material.dart';

class OnBoardingSkip extends StatelessWidget {
  const OnBoardingSkip({super.key});

  @override
  Widget build(BuildContext context) {
    return Positioned(
      top: DeviceUtils.getAppBarHeight(),
      right: UISizes.defaultSpace,
      child: TextButton(
        onPressed: () {
          Navigator.pushReplacement(
            context,
            MaterialPageRoute(builder: (context) => LoginSignUpScreen()),
          );
        },
        child: const Text(
          "Skip",
          style: TextStyle(
            color: UIColors.mainRed,
            fontSize: UISizes.fontSizeLg,
          ),
        ),
      ),
    );
  }
}
