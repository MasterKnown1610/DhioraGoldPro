import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Image,
  Dimensions,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Text,
  ActivityIndicator,
} from 'react-native';
import { API_URLS } from '../../service/config';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const HORIZONTAL_PADDING = 16;
const SLIDE_WIDTH = SCREEN_WIDTH - HORIZONTAL_PADDING * 2;
const PROMO_HEIGHT = 160;
const BORDER_RADIUS = 16;
const AUTO_SCROLL_INTERVAL = 4000;

const PromotionAutoScroller = ({ onSlidePress, colors = {} }) => {
  const c = { accent: '#F8C24D', textSecondary: '#555', overlay: 'rgba(0,0,0,0.35)', ...colors };
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef(null);

  useEffect(() => {
    let mounted = true;
    fetch(API_URLS.Promotions)
      .then((res) => res.json())
      .then((data) => {
        if (!mounted) return;
        if (data?.success && Array.isArray(data.data)) {
          setPromotions(data.data);
        } else {
          setPromotions([]);
        }
      })
      .catch(() => {
        if (mounted) setPromotions([]);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    if (promotions.length <= 1) return;
    const timer = setInterval(() => {
      setActiveIndex((prev) => {
        const next = (prev + 1) % promotions.length;
        flatListRef.current?.scrollToOffset({
          offset: next * (SLIDE_WIDTH + 12),
          animated: true,
        });
        return next;
      });
    }, AUTO_SCROLL_INTERVAL);
    return () => clearInterval(timer);
  }, [promotions.length]);

  const onMomentumScrollEnd = (e) => {
    const index = Math.round(e.nativeEvent.contentOffset.x / (SLIDE_WIDTH + 12));
    setActiveIndex(Math.min(index, Math.max(0, promotions.length - 1)));
  };

  const renderSlide = ({ item }) => {
    const imageSource = item.imageUrl
      ? { uri: item.imageUrl }
      : require('../../assets/birdGold.png');
    const subtitle = item.description?.trim()
      ? (item.description.length > 60 ? item.description.slice(0, 60) + '…' : item.description)
      : 'Tap for details';
    return (
      <TouchableOpacity
        style={styles.slide}
        onPress={() => onSlidePress?.(item)}
        activeOpacity={1}
      >
        <Image source={imageSource} style={styles.image} resizeMode="cover" />
        <View style={[styles.overlay, { backgroundColor: c.overlay }]}>
          <Text style={styles.title}>{item.title || 'Promotion'}</Text>
          <Text style={[styles.subtitle, { color: c.accent }]}>{subtitle}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.loadingWrap]}>
        <ActivityIndicator size="large" color={c.accent} />
      </View>
    );
  }

  if (promotions.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={promotions}
        renderItem={renderSlide}
        keyExtractor={(item) => item._id}
        horizontal
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={onMomentumScrollEnd}
        decelerationRate="fast"
        contentContainerStyle={styles.listContent}
        snapToInterval={SLIDE_WIDTH + 12}
        snapToAlignment="start"
      />
      <View style={styles.pagination}>
        {promotions.map((_, index) => (
          <View
            key={index}
            style={[
              styles.dot,
              index === activeIndex ? [styles.dotActive, { backgroundColor: c.accent }] : { backgroundColor: c.textSecondary },
            ]}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
    paddingHorizontal: HORIZONTAL_PADDING,
  },
  loadingWrap: {
    height: PROMO_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    paddingRight: HORIZONTAL_PADDING,
  },
  slide: {
    width: SLIDE_WIDTH,
    height: PROMO_HEIGHT,
    marginRight: 12,
    borderRadius: BORDER_RADIUS,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: BORDER_RADIUS,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
    padding: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  subtitle: {
    fontSize: 13,
    color: '#F8C24D',
    marginTop: 4,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  dot: {
    marginHorizontal: 3,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#555',
  },
  dotActive: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#F8C24D',
  },
});

export default PromotionAutoScroller;
