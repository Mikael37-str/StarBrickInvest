"use client"

import { useContext } from "react"
import { createStackNavigator } from "@react-navigation/stack"
import { NavigationContainer } from "@react-navigation/native"
import { View, ActivityIndicator, TouchableOpacity, Text, StyleSheet, Platform, StatusBar, Dimensions } from "react-native"
import { Ionicons } from "@expo/vector-icons"

// Screens (Asegúrate de que estas importaciones sean correctas)
import LoginScreen from "../screens/LoginScreen"
import RegisterScreen from "../screens/RegisterScreen"
import HomeScreen from "../screens/HomeScreen"
import SetsScreen from "../screens/SetsScreen"
import MinifiguresScreen from "../screens/MinifiguresScreen"
import CollectionScreen from "../screens/CollectionScreen"
import AddToCollectionScreen from "../screens/AddToCollectionScreen"
import ProfileScreen from "../screens/ProfileScreen"
import AdminPanel from "../screens/AdminPanel"
import EditProfileScreen from "../screens/EditProfileScreen"
import ArticlesScreen from "../screens/ArticleScreen"
import ArticleDetailScreen from "../screens/ArticleDetailScreen"
import CreateArticleScreen from "../screens/CreateArticleScreen"
import EditArticleScreen from "../screens/EditArticleScreen"
import CreateSetScreen from "../screens/CreateSetScreen"
import CreateMinifigureScreen from "../screens/CreateMinifigureScreen"

import { AuthContext } from "../context/AuthContext"
import { colors } from "../theme/colors"

const Stack = createStackNavigator()
const { width } = Dimensions.get("window")

function CustomHeader({ navigation, user, logout }: any) {
  const isMobile = width < 768

  return (
    <View style={styles.header}>
      <View style={styles.headerLeft}>
        <Ionicons name="planet" size={isMobile ? 20 : 24} color={colors.accent} />
        <Text style={styles.headerTitle}>STAR BRICK</Text>
      </View>

      <View style={styles.headerRight}>
        {user ? (
          <>
            {!isMobile && (
              <>
                {/* Escritorio - Logueado */}
                <TouchableOpacity style={styles.navButton} onPress={() => navigation.navigate("Home")}>
                  <Ionicons name="home" size={20} color={colors.text} />
                  <Text style={styles.navButtonText}>Inicio</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.navButton} onPress={() => navigation.navigate("Sets")}>
                  <Ionicons name="cube" size={20} color={colors.text} />
                  <Text style={styles.navButtonText}>Sets</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.navButton} onPress={() => navigation.navigate("Minifigures")}>
                  <Ionicons name="people" size={20} color={colors.text} />
                  <Text style={styles.navButtonText}>Minifigs</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.navButton} onPress={() => navigation.navigate("Articles")}>
                  <Ionicons name="newspaper" size={20} color={colors.text} />
                  <Text style={styles.navButtonText}>Artículos</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.navButton} onPress={() => navigation.navigate("Collection")}>
                  <Ionicons name="albums" size={20} color={colors.text} />
                  <Text style={styles.navButtonText}>Colección</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.navButton} onPress={() => navigation.navigate("Profile")}>
                  <Ionicons name="person" size={20} color={colors.text} />
                  <Text style={styles.navButtonText}>Perfil</Text>
                </TouchableOpacity>
                {user.role === "admin" && (
                  <TouchableOpacity style={styles.navButton} onPress={() => navigation.navigate("Admin")}>
                    <Ionicons name="shield-checkmark" size={20} color={colors.accent} />
                    <Text style={[styles.navButtonText, { color: colors.accent }]}>Admin</Text>
                  </TouchableOpacity>
                )}
              </>
            )}
            {/* Móvil - Logueado */}
            {isMobile ? (
              <View style={styles.mobileNav}>
                <TouchableOpacity style={styles.mobileNavBtn} onPress={() => navigation.navigate("Home")}>
                  <Ionicons name="home" size={20} color={colors.text} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.mobileNavBtn} onPress={() => navigation.navigate("Articles")}>
                  <Ionicons name="newspaper" size={20} color={colors.text} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.mobileNavBtn} onPress={() => navigation.navigate("Collection")}>
                  <Ionicons name="albums" size={20} color={colors.text} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.mobileNavBtn} onPress={() => navigation.navigate("Profile")}>
                  <Ionicons name="person" size={20} color={colors.text} />
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity style={styles.logoutButton} onPress={logout}>
                <Ionicons name="log-out" size={20} color={colors.error} />
              </TouchableOpacity>
            )}
          </>
        ) : (
          <>
            {/* Escritorio - No Logueado */}
            {!isMobile ? (
              <>
                <TouchableOpacity style={styles.navButton} onPress={() => navigation.navigate("Home")}>
                  <Ionicons name="home" size={20} color={colors.text} />
                  <Text style={styles.navButtonText}>Inicio</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.navButton} onPress={() => navigation.navigate("Sets")}>
                  <Ionicons name="cube" size={20} color={colors.text} />
                  <Text style={styles.navButtonText}>Sets</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.navButton} onPress={() => navigation.navigate("Minifigures")}>
                  <Ionicons name="people" size={20} color={colors.text} />
                  <Text style={styles.navButtonText}>Minifigs</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.navButton} onPress={() => navigation.navigate("Articles")}>
                  <Ionicons name="newspaper" size={20} color={colors.text} />
                  <Text style={styles.navButtonText}>Artículos</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.loginButton} onPress={() => navigation.navigate("Login")}>
                  <Text style={styles.loginButtonText}>Entrar</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.registerButton} onPress={() => navigation.navigate("Register")}>
                  <Text style={styles.registerButtonText}>Registrarse</Text>
                </TouchableOpacity>
              </>
            ) : (
              /* Móvil - No Logueado */
              <View style={styles.mobileNav}>
                <TouchableOpacity style={styles.mobileNavBtn} onPress={() => navigation.navigate("Home")}>
                  <Ionicons name="home" size={20} color={colors.text} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.mobileNavBtn} onPress={() => navigation.navigate("Articles")}>
                  <Ionicons name="newspaper" size={20} color={colors.text} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.loginButton} onPress={() => navigation.navigate("Login")}>
                  <Text style={styles.loginButtonText}>Entrar</Text>
                </TouchableOpacity>
              </View>
            )}
          </>
        )}
      </View>
    </View>
  )
}

export default function AppNavigator() {
  const { user, loading, logout } = useContext(AuthContext)

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    )
  }

  return (
    <View style={styles.appContainer}>
      <NavigationContainer>
        <Stack.Navigator
          screenOptions={({ navigation }) => ({
            header: () => <CustomHeader navigation={navigation} user={user} logout={logout} />,
            cardStyle: { flex: 1 },
          })}
        >
          {/* Rutas Públicas (Siempre definidas) */}
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="Sets" component={SetsScreen} />
          <Stack.Screen name="Minifigures" component={MinifiguresScreen} />
          <Stack.Screen name="Articles" component={ArticlesScreen} />
          <Stack.Screen name="ArticleDetail" component={ArticleDetailScreen} />
          <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
          <Stack.Screen name="Register" component={RegisterScreen} options={{ headerShown: false }} />

          {/* Rutas Protegidas (Siempre definidas para evitar errores de navegación) */}
          <Stack.Screen name="Collection" component={CollectionScreen} />
          <Stack.Screen name="AddToCollection" component={AddToCollectionScreen} />
          <Stack.Screen name="Profile" component={ProfileScreen} />
          <Stack.Screen name="EditProfile" component={EditProfileScreen} />

          {/* Rutas de Administrador (Siempre definidas para evitar errores de navegación) */}
          <Stack.Screen name="Admin" component={AdminPanel} />
          <Stack.Screen name="CreateArticle" component={CreateArticleScreen} />
          <Stack.Screen name="EditArticle" component={EditArticleScreen} />
          <Stack.Screen name="CreateSet" component={CreateSetScreen} /> 
          <Stack.Screen name="CreateMinifigure" component={CreateMinifigureScreen} /> 
        
        </Stack.Navigator>
      </NavigationContainer>
    </View>
  )
}

const styles = StyleSheet.create({
  appContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: colors.surface,
    paddingHorizontal: width < 768 ? 12 : 16,
    paddingVertical: width < 768 ? 8 : 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.accent + "30",
    paddingTop: Platform.OS === "ios" ? (StatusBar.currentHeight || 44) : Math.max((StatusBar.currentHeight || 0), 8),
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  headerTitle: {
    color: colors.accent,
    fontSize: width < 768 ? 14 : 18,
    fontWeight: "bold",
    fontFamily: "SparTakus",
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: width < 768 ? 4 : 8,
  },
  navButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
  },
  navButtonText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "500",
  },
  mobileNav: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  mobileNavBtn: {
    padding: 8,
    borderRadius: 6,
  },
  loginButton: {
    paddingHorizontal: width < 768 ? 12 : 16,
    paddingVertical: width < 768 ? 6 : 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.accent,
  },
  loginButtonText: {
    color: colors.accent,
    fontSize: width < 768 ? 12 : 14,
    fontWeight: "bold",
  },
  registerButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    backgroundColor: colors.accent,
  },
  registerButtonText: {
    color: "#000",
    fontSize: 14,
    fontWeight: "bold",
  },
  logoutButton: {
    padding: 8,
    borderRadius: 6,
  },
})