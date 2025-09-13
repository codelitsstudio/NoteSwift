import React, { useState, useEffect, useRef } from "react";
import { View, SafeAreaView, Animated } from "react-native";
import DashboardHeader from "./DashboardHeader";
import DashboardSidebar from "./DashboardSidebar";
import { useRouter } from "expo-router";

interface SidebarItem {
  id: string;
  title: string;
  icon: string;
  active: boolean;
}

interface DashboardLayoutProps {
  title: string;
  subtitle?: string;
  activeSection: string;
  children: React.ReactNode;
  isHome?: boolean;
}

export default function DashboardLayout({ 
  title, 
  subtitle, 
  activeSection, 
  children,
  isHome = false
}: DashboardLayoutProps) {
  const router = useRouter();
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const contentMarginAnim = useRef(new Animated.Value(0)).current;

  const sidebarItems: SidebarItem[] = [
    { id: 'home', title: 'Dashboard Home', icon: 'dashboard', active: activeSection === 'home' },
    { id: 'packages', title: 'My Packages', icon: 'library-books', active: activeSection === 'packages' },
    { id: 'history', title: 'Payment History', icon: 'payment', active: activeSection === 'history' },
    { id: 'marketplace', title: 'Add More Packages', icon: 'add-shopping-cart', active: activeSection === 'marketplace' },
    { id: 'settings', title: 'Account Settings', icon: 'settings', active: activeSection === 'settings' },
  ];

  const navigateToSection = (sectionId: string) => {
    switch(sectionId) {
      case 'home':
        router.push('/ProDashboard/DashboardHome' as any);
        break;
      case 'packages':
        router.push('/ProDashboard/MyPackages' as any);
        break;
      case 'history':
        router.push('/ProDashboard/PaymentHistory' as any);
        break;
      case 'marketplace':
        router.push('/ProDashboard/AddMorePackages' as any);
        break;
      case 'settings':
        router.push('/ProDashboard/AccountSettings' as any);
        break;
    }
  };

  useEffect(() => {
    Animated.timing(contentMarginAnim, {
      toValue: sidebarVisible ? 264 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [sidebarVisible, contentMarginAnim]);

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <DashboardHeader 
        title={title}
        onMenuPress={() => setSidebarVisible(!sidebarVisible)}
        isHome={isHome}
      />
      
      <View className="flex-1 relative">
        <DashboardSidebar
          visible={sidebarVisible}
          sidebarItems={sidebarItems}
          onNavigate={navigateToSection}
          subtitle={subtitle}
        />
        
        <Animated.View 
          style={{ 
            flex: 1,
            transform: [{ translateX: contentMarginAnim }],
          }}
          className="bg-gray-50"
        >
          {children}
        </Animated.View>
      </View>
    </SafeAreaView>
  );
}