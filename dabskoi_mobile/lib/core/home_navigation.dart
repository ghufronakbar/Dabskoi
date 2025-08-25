import 'package:dabskoi/screen/home/tab/chat/chat_screen.dart';
import 'package:dabskoi/screen/home/tab/home/home_screen.dart';
import 'package:dabskoi/screen/home/tab/koi/koi_screen.dart';
import 'package:dabskoi/screen/home/tab/payment/payment_screen.dart';
import 'package:dabskoi/screen/home/tab/account/account_screen.dart';
import 'package:flutter/cupertino.dart';
import 'package:google_nav_bar/google_nav_bar.dart';

const List<GButton> tabsMenu = [
  GButton(icon: CupertinoIcons.home, text: "Beranda"),
  GButton(icon: CupertinoIcons.cube_box, text: "Koi"),
  GButton(icon: CupertinoIcons.chat_bubble_text, text: "Percakapan"),
  GButton(icon: CupertinoIcons.creditcard, text: "Riwayat"),
  GButton(icon: CupertinoIcons.person, text: "Akun"),
];

const List<Widget> tabScreen = [
  HomeScreen(),
  KoiScreen(),
  ChatScreen(),
  PaymentScreen(),
  AccountScreen(),
];
