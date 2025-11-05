// src/components/HamburgerMenu.tsx
import React, { useState, useContext } from 'react';
import {
  Modal,
  TouchableOpacity,
  View,
  Text,
  StyleSheet,
  Platform,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { responsive } from '../utils/responsive';
import { AuthContext } from '../context/AuthContext';

interface HamburgerMenuProps {
  navigation: any;
  currentScreen: string;
}

export default function HamburgerMenu({ navigation, currentScreen }: HamburgerMenuProps) {
  const [menuVisible, setMenuVisible] = useState(false);
  const { user } = useContext(AuthContext);

  // Solo mostrar en móviles y tablets (cuando navbar está oculto)
  const shouldShow = responsive.isMobile || responsive.isTablet || responsive.width < 900;
  
  if (!shouldShow) return null;

  const menuItems = [
    { icon: 'home-outline', label: 'Inicio', screen: 'Home', requiresAuth: false },
    { icon: 'cube-outline', label: 'Sets', screen: 'Sets', requiresAuth: false },
    { icon: 'people-outline', label: 'Minifiguras', screen: 'Minifigures', requiresAuth: false },
    { icon: 'newspaper-outline', label: 'Artículos', screen: 'Articles', requiresAuth: false },
    { icon: 'albums-outline', label: 'Colección', screen: 'Collection', requiresAuth: true },
    { icon: 'person-outline', label: 'Perfil', screen: 'Profile', requiresAuth: true },
  ];

  const handleNavigate = (screen: string) => {
    setMenuVisible(false);
    setTimeout(() => {
      if (screen !== currentScreen) {
        navigation.navigate(screen);
      }
    }, 300);
  };

  return (
    <>
      {/* Botón Hamburguesa - Más pequeño y elegante */}
      <TouchableOpacity
        style={styles.hamburgerButton}
        onPress={() => setMenuVisible(true)}
        activeOpacity={0.7}
      >
        <Ionicons name="menu" size={22} color={colors.accent} />
      </TouchableOpacity>

      {/* Modal del Menú */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={menuVisible}
        onRequestClose={() => setMenuVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={styles.overlay}
            activeOpacity={1}
            onPress={() => setMenuVisible(false)}
          />
          
          <View style={styles.menuContent}>
            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Header compacto */}
              <View style={styles.menuHeader}>
                <View style={styles.logoContainer}>
                  <Text style={styles.logoIcon}>⭐</Text>
                  <Text style={styles.logoText}>STAR BRICK</Text>
                </View>
                <TouchableOpacity 
                  onPress={() => setMenuVisible(false)}
                  style={styles.closeButton}
                >
                  <Ionicons name="close" size={24} color={colors.text} />
                </TouchableOpacity>
              </View>

              {/* Usuario info (si está logueado) */}
              {user && (
                <View style={styles.userSection}>
                  <View style={styles.userAvatar}>
                    <Ionicons name="person" size={20} color={colors.accent} />
                  </View>
                  <View style={styles.userInfo}>
                    <Text style={styles.userName} numberOfLines={1}>
                      {user.name}
                    </Text>
                    <Text style={styles.userEmail} numberOfLines={1}>
                      {user.email}
                    </Text>
                  </View>
                </View>
              )}

              <View style={styles.divider} />

              {/* Items del Menú - Más compactos */}
              <View style={styles.menuItems}>
                {menuItems.map((item, index) => {
                  if (item.requiresAuth && !user) return null;

                  const isActive = item.screen === currentScreen;

                  return (
                    <TouchableOpacity
                      key={index}
                      style={[styles.menuItem, isActive && styles.menuItemActive]}
                      onPress={() => handleNavigate(item.screen)}
                      activeOpacity={0.7}
                    >
                      <View style={styles.menuItemContent}>
                        <Ionicons
                          name={item.icon as any}
                          size={20}
                          color={isActive ? colors.accent : colors.text}
                        />
                        <Text style={[styles.menuItemText, isActive && styles.menuItemTextActive]}>
                          {item.label}
                        </Text>
                      </View>
                      {isActive && <View style={styles.activeIndicator} />}
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Botones de Auth - Más compactos */}
              {!user && (
                <>
                  <View style={styles.divider} />
                  <View style={styles.authButtons}>
                    <TouchableOpacity
                      style={styles.loginButton}
                      onPress={() => {
                        setMenuVisible(false);
                        setTimeout(() => navigation.navigate('Login'), 300);
                      }}
                    >
                      <Ionicons name="log-in-outline" size={18} color={colors.accent} />
                      <Text style={styles.loginButtonText}>Iniciar Sesión</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                      style={styles.registerButton}
                      onPress={() => {
                        setMenuVisible(false);
                        setTimeout(() => navigation.navigate('Register'), 300);
                      }}
                    >
                      <Ionicons name="person-add-outline" size={18} color="#000" />
                      <Text style={styles.registerButtonText}>Registrarse</Text>
                    </TouchableOpacity>
                  </View>
                </>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  hamburgerButton: {
    position: 'absolute',
    top: 12,
    left: 16,
    zIndex: 1000,
    backgroundColor: colors.surface,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.accent + '50',
    ...Platform.select({
      web: {
        boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.15)',
      },
      default: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
        elevation: 4,
      },
    }),
  },
  
  modalOverlay: {
    flex: 1,
    flexDirection: 'row',
  },
  
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  
  menuContent: {
    backgroundColor: colors.surface,
    width: responsive.isSmallPhone ? '75%' : '70%',
    maxWidth: 280,
    height: '100%',
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
    ...Platform.select({
      web: {
        boxShadow: '-4px 0 12px rgba(0, 0, 0, 0.2)',
      },
      default: {
        shadowColor: '#000',
        shadowOffset: { width: -2, height: 0 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 8,
      },
    }),
  },
  
  menuHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  
  logoIcon: {
    fontSize: 20,
  },
  
  logoText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.accent,
    letterSpacing: 0.5,
  },
  
  closeButton: {
    padding: 4,
  },
  
  userSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.background,
    marginHorizontal: 12,
    borderRadius: 8,
  },
  
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.accent + '20',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: colors.accent,
  },
  
  userInfo: {
    flex: 1,
  },
  
  userName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.text,
  },
  
  userEmail: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
  },
  
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 12,
    marginHorizontal: 16,
  },
  
  menuItems: {
    paddingHorizontal: 8,
  },
  
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 4,
  },
  
  menuItemActive: {
    backgroundColor: colors.accent + '15',
  },
  
  menuItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  
  menuItemText: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '500',
  },
  
  menuItemTextActive: {
    color: colors.accent,
    fontWeight: 'bold',
  },
  
  activeIndicator: {
    width: 3,
    height: 20,
    backgroundColor: colors.accent,
    borderRadius: 2,
  },
  
  authButtons: {
    paddingHorizontal: 16,
    gap: 8,
  },
  
  loginButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: colors.accent,
  },
  
  loginButtonText: {
    fontSize: 13,
    color: colors.accent,
    fontWeight: 'bold',
  },
  
  registerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: colors.accent,
  },
  
  registerButtonText: {
    fontSize: 13,
    color: '#000',
    fontWeight: 'bold',
  },
});