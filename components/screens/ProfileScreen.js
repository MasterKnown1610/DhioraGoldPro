import React, { useContext } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import CustomButton from '../CustomButton';
import Context from '../../context/Context';

const ProfileScreen = ({ navigation }) => {
  const { theme } = useContext(Context);
  const c = theme.colors;

  return (
  <SafeAreaView style={[styles.safeArea, { backgroundColor: c.background }]}>
  <ScrollView contentContainerStyle={[styles.container, { backgroundColor: c.background }]}>
    <View style={[styles.avatar, { backgroundColor: c.surface }]}>
      <Icon name="person" size={64} color={c.textSecondary} />
    </View>
    <Text style={[styles.title, { color: c.text }]}>Profile</Text>
    <Text style={[styles.subtitle, { color: c.textSecondary }]}>Alexander</Text>
    <TouchableOpacity
      style={[styles.themeToggle, { backgroundColor: c.surface, borderColor: c.border }]}
      onPress={theme.toggleTheme}
    >
      <Icon name={theme.isDark ? 'wb-sunny' : 'nights-stay'} size={24} color={c.accent} style={{ marginRight: 10 }} />
      <Text style={[styles.themeToggleText, { color: c.text }]}>
        {theme.isDark ? 'Light Mode' : 'Dark Mode'}
      </Text>
    </TouchableOpacity>
    <View style={styles.registerSection}>
      <Text style={[styles.sectionTitle, { color: c.text }]}>Register</Text>
      <CustomButton
        title="Register as Shop"
        onPress={() => navigation.navigate('Register Shop')}
      />
      <View style={styles.buttonSpacer} />
      <CustomButton
        title="Register as User"
        onPress={() => navigation.navigate('Register User')}
      />
    </View>
  </ScrollView>
  </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flexGrow: 1,
    alignItems: 'center',
    paddingVertical: 24,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#2A2A2A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  themeToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    borderRadius: 12,
    marginTop: 20,
    width: '85%',
    borderWidth: 1,
  },
  themeToggleText: {
    fontSize: 16,
    fontWeight: '600',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginTop: 16,
  },
  subtitle: {
    fontSize: 14,
    marginTop: 8,
  },
  registerSection: {
    width: '85%',
    marginTop: 32,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    textAlign: 'center',
  },
  buttonSpacer: {
    height: 12,
  },
});

export default ProfileScreen;
