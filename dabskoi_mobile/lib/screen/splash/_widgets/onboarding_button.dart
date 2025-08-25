import 'package:dabskoi/helper/colors.dart';
import 'package:dabskoi/helper/sizes.dart';
import 'package:dabskoi/screen/auth/login_signup_screen.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';

class OnboardingButton extends StatelessWidget {
  const OnboardingButton({super.key});

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      child: ElevatedButton(
        style: ElevatedButton.styleFrom(
          backgroundColor: UIColors.mainRed,
          padding: const EdgeInsets.symmetric(
            horizontal: UISizes.md,
            vertical: UISizes.xs,
          ),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(UISizes.borderRadiusMd),
          ),
        ),
        onPressed: () {
          Navigator.pushReplacement(
            context,
            MaterialPageRoute(builder: (context) => LoginSignUpScreen()),
          );
        },
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            Text(
              "Next",
              style: TextStyle(
                color: UIColors.mainWhite,
                fontSize: UISizes.fontSizeMd,
              ),
            ),
            SizedBox(width: UISizes.md),
            Icon(
              CupertinoIcons.chevron_forward,
              color: UIColors.mainWhite,
              size: UISizes.iconMd,
            ),
          ],
        ),
      ),
    );
  }
}
