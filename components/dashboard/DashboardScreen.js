import React, { useState, useContext, useMemo, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  RefreshControl,
} from 'react-native';
import Context from '../../context/Context';
import TopBar from './TopBar';
import SearchBar from './SearchBar';
import PromotionAutoScroller from './PromotionAutoScroller';
import BrowseCards from './BrowseCards';
import CuratedBoutiques from './CuratedBoutiques';
import CustomButton from '../CustomButton';

const DashboardScreen = ({ navigation }) => {
  const { theme, auth } = useContext(Context);
  const [searchQuery, setSearchQuery] = useState('');
  const [browseMode, setBrowseMode] = useState('shops');
  const [refreshing, setRefreshing] = useState(false);
  const promotionScrollerRef = useRef(null);

  const displayName =
    auth?.token && auth?.user
      ? auth.user?.userProfile?.userName ||
        auth.user?.name ||
        auth.user?.email ||
        auth.user?.phoneNumber ||
        'User'
      : 'User';

  const profileImageUri =
    auth?.token && auth?.user
      ? auth.user?.userProfile?.profileImage || auth.user?.profileImage || null
      : null;

  const styles = useMemo(() => createStyles(theme.colors), [theme.colors]);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await promotionScrollerRef.current?.refresh?.();
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[theme.colors.accent]} />
        }
      >
        <TopBar
          userName={displayName}
          profileImageUri={profileImageUri}
          onNotificationPress={() => {}}
          onProfilePress={() => navigation.getParent()?.navigate('Profile')}
          colors={theme.colors}
        />
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          colors={theme.colors}
          editable={false}
          onPress={() => {
            navigation.getParent()?.navigate('Shops', {
              screen: 'ShopsList',
              params: { focusSearch: true },
            });
          }}
        />
        <PromotionAutoScroller ref={promotionScrollerRef} onSlidePress={(slide) => {}} colors={theme.colors} />
        <BrowseCards
          selected={browseMode}
          onSelectShops={() => {
            setBrowseMode('shops');
            navigation.getParent()?.navigate('Shops');
          }}
          onSelectUsers={() => {
            setBrowseMode('users');
            navigation.getParent()?.navigate('Users');
          }}
          colors={theme.colors}
        />
       
        <View style={styles.toolsSection}>
          <Text style={[styles.toolsTitle, { color: theme.colors.text }]}>Tools</Text>
          <CustomButton title="Gold Converter" onPress={() => navigation.navigate('Gold Converter')} />
          <CustomButton title="Purity Converter" onPress={() => navigation.navigate('Purity Converter')} />
          <CustomButton title="Purity Calculator" onPress={() => navigation.navigate('Purity Calculator')} />
          <CustomButton title="Purity Generator" onPress={() => navigation.navigate('Purity Generator')} />
        </View>
        {/* <CuratedBoutiques
          onViewAll={() => {}}
          onBoutiquePress={(item) => {}}
          colors={theme.colors}
        /> */}
      </ScrollView>
    </SafeAreaView>
  );
};

const createStyles = (colors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scrollView: {
      flex: 1,
    },
    scrollContent: {
      paddingBottom: 100,
    },
    toolsSection: {
      paddingHorizontal: 16,
      marginTop: 8,
      marginBottom: 20,
      gap: 12,
    },
    toolsTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: colors.text,
      marginBottom: 8,
    },
  });

export default DashboardScreen;
