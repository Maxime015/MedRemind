import { SignOutButton } from "@/components/SignOutButton";
import { useUser } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Image, Text, TouchableOpacity, View } from "react-native";
import { styles } from "../assets/styles/Header.styles";

const Header = ({ todaysMedications = [], onShowNotifications }) => {
  const { user, isLoaded } = useUser();
  const router = useRouter();

  // Attente du chargement complet de Clerk
  if (!isLoaded) {
    return (
      <View style={styles.header}>
        <Text style={{ color: "white", fontSize: 16 }}>Loading...</Text>
      </View>
    );
  }

  // Récupération des infos utilisateur
  const firstName = user?.firstName || "";
  const lastName = user?.lastName || "";
  const username =
    user?.username ||
    `${firstName} ${lastName}`.trim() ||
    user?.emailAddresses?.[0]?.emailAddress?.split("@")[0] ||
    "User";

  // Génération d’un avatar DiceBear cohérent
  const avatarSeed =
    username.replace(/\s+/g, "_").toLowerCase() || "default_user";
  const avatarUrl = `https://api.dicebear.com/7.x/avataaars/png?seed=${encodeURIComponent(
    avatarSeed
  )}&radius=50&backgroundColor=b6e3f4,c0aede,d1d4f9`;

  return (
    <View style={styles.header}>
      {/* Partie gauche : avatar + nom utilisateur */}
      <View style={styles.headerLeft}>
        <Image
          source={{ uri: avatarUrl }}
          style={styles.headerLogo}
          resizeMode="cover"
        />
        <View style={styles.welcomeContainer}>
          <Text style={styles.welcomeText}>Welcome,</Text>
          <Text style={styles.usernameText} numberOfLines={1}>
            {username}
          </Text>
        </View>
      </View>

      {/* Partie droite : notifications + bouton d’ajout + déconnexion */}
      <View style={styles.headerRight}>
        <TouchableOpacity
          style={styles.notificationButton}
          onPress={onShowNotifications}
        >
          <Ionicons name="notifications-outline" size={24} color="white" />
          {todaysMedications.length > 0 && (
            <View style={styles.notificationBadge}>
              <Text style={styles.notificationCount}>
                {todaysMedications.length}
              </Text>
            </View>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.8}
          style={styles.addButton}
          onPress={() => router.push("/(modals)/createMedication")}
        >
          <Ionicons name="add" size={20} color="#FFF" />
          <Text style={styles.addButtonText}>Add</Text>
        </TouchableOpacity>

        <SignOutButton />
      </View>
    </View>
  );
};

export default Header;
