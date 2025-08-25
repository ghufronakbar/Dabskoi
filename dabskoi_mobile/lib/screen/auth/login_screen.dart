import 'package:dabskoi/helper/colors.dart';
import 'package:dabskoi/helper/sizes.dart';
import 'package:dabskoi/screen/auth/_widgets/login_bottom_section.dart';
import 'package:dabskoi/screen/auth/_widgets/login_signup_top_section.dart';
import 'package:flutter/material.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () => FocusScope.of(context).unfocus(),
      child: Scaffold(
        backgroundColor: UIColors.mainWhite,
        resizeToAvoidBottomInset: false,
        body: Column(
          children: [
            LoginSignupTopSection(text: "Selamat Datang Silahkan Login Dahulu"),
            SizedBox(height: UISizes.gap),
            LoginBottomSection(
              emailController: _emailController,
              passwordController: _passwordController,
            ),
          ],
        ),
      ),
    );
  }
}
