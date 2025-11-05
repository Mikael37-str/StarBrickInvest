// src/components/Navbar.tsx
import React, { useContext } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { AuthContext } from '../context/AuthContext';
import { responsive } from '../utils/responsive';

interface NavbarProps {
  navigation: any;
  currentScreen: string;
}

export default function Navbar({ navigation, currentScreen }: NavbarProps) {
  const { user } = useContext(AuthContext);

  // OCULTAR completamente en móviles y tablets - solo desktop
  if (responsive.isMobile || responsive.isTablet || responsive.width < 900) {
    return null;
  }

  const navItems = [
    { icon: 'home', label: 'Inicio', screen: 'Home' },
    { icon: 'cube', label: 'Sets', screen: 'Sets' },
    { icon: 'people', label: 'Minifiguras', screen: 'Minifigures' },
    { icon: 'newspaper', label: 'Artículos', screen: 'Articles' },
  ];

  const handleNavigate = (screen: string) => {
    if (screen !== currentScreen) {
      navigation.navigate(screen);
    }
  };

  return (
    <View style={styles.navbar}>
      <View style={styles.container}>
        {/* Logo */}
        <TouchableOpacity 
          style={styles.logo} 
          onPress={() => navigation.navigate('Home')}
        >
          <Text style={styles.logoIcon}>⭐</Text>
          <Text style={styles.logoText}>STAR BRICK</Text>
        </TouchableOpacity>

        {/* Nav Items */}
        <View style={styles.navItems}>
          {navItems.map((item, index) => {
            const isActive = item.screen === currentScreen;
            return (
              <TouchableOpacity
                key={index}
                style={[styles.navItem, isActive && styles.navItemActive]}
                onPress={() => handleNavigate(item.screen)}
              >
                <Ionicons 
                  name={item.icon as any} 
                  size={20} 
                  color={isActive ? colors.accent : colors.text} 
                />
                <Text style={[styles.navItemText, isActive && styles.navItemTextActive]}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Auth Buttons */}
        <View style={styles.authSection}>
          {!user ? (
            <>
              <TouchableOpacity 
                style={styles.loginButton}
                onPress={() => navigation.navigate('Login')}
              >
                <Text style={styles.loginButtonText}>Entrar</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.registerButton}
                onPress={() => navigation.navigate('Register')}
              >
                <Text style={styles.registerButtonText}>Registrarse</Text>
              </TouchableOpacity>
            </>
          ) : (
            <TouchableOpacity 
              style={styles.profileButton}
              onPress={() => navigation.navigate('Profile')}
            >
              <Ionicons name="person-circle" size={32} color={colors.accent} />
              <Text style={styles.profileName}>{user.name}</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  navbar: {
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.accent + '30',
    paddingVertical: 12,
    ...Platform.select({
      web: {
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
      },
      default: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
      },
    }),
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    maxWidth: 1400,
    marginHorizontal: 'auto',
    width: '100%',
  },
  logo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logoIcon: {
    fontSize: 24,
  },
  logoText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.accent,
    letterSpacing: 1,
  },
  navItems: {
    flexDirection: 'row',
    gap: 8,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  navItemActive: {
    backgroundColor: colors.accent + '20',
  },
  navItemText: {
    fontSize: 15,
    color: colors.text,
    fontWeight: '500',
  },
  navItemTextActive: {
    color: colors.accent,
    fontWeight: 'bold',
  },
  authSection: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  loginButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: colors.accent,
  },
  loginButtonText: {
    color: colors.accent,
    fontWeight: 'bold',
    fontSize: 14,
  },
  registerButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: colors.accent,
  },
  registerButtonText: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 14,
  },
  profileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  profileName: {
    color: colors.text,
    fontWeight: '600',
    fontSize: 14,
  },
});