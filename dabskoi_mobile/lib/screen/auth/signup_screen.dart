import 'package:dabskoi/helper/colors.dart';
import 'package:dabskoi/helper/sizes.dart';
import 'package:dabskoi/screen/auth/_widgets/login_signup_top_section.dart';
import 'package:dabskoi/screen/auth/_widgets/signup_bottom_section.dart';

import 'package:flutter/material.dart';

class SignupScreen extends StatefulWidget {
  const SignupScreen({super.key});

  @override
  State<SignupScreen> createState() => _SignupScreenState();
}

class _SignupScreenState extends State<SignupScreen> {
  final _emailController = TextEditingController();
  final _phoneNumberController = TextEditingController();
  final _passwordController = TextEditingController();
  final _confirmPasswordController = TextEditingController();
  final _nameController = TextEditingController();
  final _addressController = TextEditingController();

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () => FocusScope.of(context).unfocus(),
      child: Scaffold(
        backgroundColor: UIColors.mainWhite,
        resizeToAvoidBottomInset:
            false, // Mencegah perubahan ukuran saat keyboard muncul
        body: Column(
          children: [
            // Top section
            LoginSignupTopSection(
              text: "Selamat Datang Silahkan Buat Akun Dahulu",
            ),

            // Spacer
            SizedBox(height: UISizes.spaceBtwSections),
            // Bottom section
            SignupBottomSection(
              nameController: _nameController,
              emailController: _emailController,
              phoneNumberController: _phoneNumberController,
              passwordController: _passwordController,
              confirmPasswordController: _confirmPasswordController,
              addressController: _addressController,
            ),
          ],
        ),
      ),
    );
  }
}
