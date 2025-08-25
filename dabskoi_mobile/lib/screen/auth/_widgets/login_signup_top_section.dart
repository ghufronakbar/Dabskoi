import 'package:dabskoi/helper/images_string.dart';
import 'package:dabskoi/helper/sizes.dart';
import 'package:dabskoi/helper/device_utils.dart';
import 'package:dabskoi/helper/helper_functions.dart';
import 'package:flutter/material.dart';

class LoginSignupTopSection extends StatelessWidget {
  const LoginSignupTopSection({super.key, required this.text});

  final String text;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: EdgeInsets.only(
        top: DeviceUtils.getAppBarHeight(),
        left: UISizes.defaultSpace,
        right: UISizes.defaultSpace,
      ),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.start,
        crossAxisAlignment: CrossAxisAlignment.center,
        mainAxisSize: MainAxisSize.max,
        children: [
          Container(
            color: Colors.transparent,
            child: Image(
              width: HelperFunctions.screenWidth(context) * 0.35,
              height: HelperFunctions.screenHeight(context) * 0.1,
              image: AssetImage(ImagesString.dabKoiHouseLogoSml),
              fit: BoxFit.contain,
            ),
          ),
          Text(
            text,
            style: TextStyle(
              fontSize: UISizes.fontTitle,
              fontWeight: FontWeight.bold,
            ),
            textAlign: TextAlign.left,
          ),
        ],
      ),
    );
  }
}
