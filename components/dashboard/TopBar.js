import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const defaultColors = { surface: '#2A2A2A', textSecondary: '#888', text: '#fff', accent: '#F8C24D' };

const TopBar = ({ userName = 'User', profileImageUri, onNotificationPress, onProfilePress, colors = {} }) => {
  const c = { ...defaultColors, ...colors };
  return (
  <View style={styles.container}>
    <TouchableOpacity style={styles.profileSection} onPress={onProfilePress} activeOpacity={0.7}>
      <View style={styles.avatarWrapper}>
        <View style={[styles.avatar, { backgroundColor: c.surface }]}>
          {profileImageUri ? (
            <Image source={{ uri: profileImageUri }} style={styles.avatarImage} resizeMode="cover" />
          ) : (
            <Icon name="person" size={28} color={c.textSecondary} />
          )}
        </View>
        <View style={styles.onlineDot} />
      </View>
      <View style={styles.userInfo}>
        <Text style={styles.premiumLabel}>PREMIUM MEMBER</Text>
        <Text style={[styles.welcomeText, { color: c.text }]}>Welcome, {userName}</Text>
      </View>
    </TouchableOpacity>
    {/* <TouchableOpacity style={styles.notificationBtn} onPress={onNotificationPress} activeOpacity={0.7}>
      <Icon name="notifications" size={26} color={c.accent} />
    </TouchableOpacity> */}
  </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 12,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatarWrapper: {
    position: 'relative',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#2A2A2A',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  onlineDot: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#4CAF50',
    borderWidth: 2,
    borderColor: '#1A1A1A',
  },
  userInfo: {
    marginLeft: 12,
  },
  premiumLabel: {
    fontSize: 11,
    color: '#F8C24D',
    fontWeight: '600',
    letterSpacing: 1,
  },
  welcomeText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 2,
  },
  notificationBtn: {
    padding: 8,
  },
});

export default TopBar;
