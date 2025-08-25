import 'package:dabskoi/core/home_navigation.dart';
import 'package:dabskoi/helper/colors.dart';
import 'package:dabskoi/helper/sizes.dart';
import 'package:dabskoi/services/realtime_service.dart';
import 'package:flutter/material.dart';
import 'package:google_nav_bar/google_nav_bar.dart';

class MainTab extends StatefulWidget {
  final int initialIndex;
  const MainTab({super.key, this.initialIndex = 0});

  @override
  State<MainTab> createState() => _MainTabState();
}

class _MainTabState extends State<MainTab> {
  late int _selectedIndex;

  @override
  void initState() {
    super.initState();
    RealtimeService.I.connect();
    _selectedIndex = widget.initialIndex;
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: UIColors.tabMainBacground,
      body: tabScreen[_selectedIndex],
      bottomNavigationBar: Container(
        color: UIColors.mainWhite,
        child: Padding(
          padding: const EdgeInsets.symmetric(
            horizontal: UISizes.horizontalPadding,
            vertical: UISizes.md,
          ),
          child: GNav(
            tabs: tabsMenu,
            backgroundColor: UIColors.mainWhite,
            gap: UISizes.xs,
            color: UIColors.mainRed,
            activeColor: UIColors.mainWhite,
            tabBackgroundColor: UIColors.mainRed,
            iconSize: UISizes.iconMd,
            padding: EdgeInsets.all(UISizes.sm),
            tabBorderRadius: UISizes.borderRadiusMd,
            onTabChange: (index) {
              setState(() {
                _selectedIndex = index;
              });
            },
          ),
        ),
      ),
    );
  }
}
