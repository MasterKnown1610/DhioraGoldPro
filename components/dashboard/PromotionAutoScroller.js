import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Image,
  Dimensions,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Text,
} from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const HORIZONTAL_PADDING = 16;
const SLIDE_WIDTH = SCREEN_WIDTH - HORIZONTAL_PADDING * 2;
const PROMO_HEIGHT = 160;
const BORDER_RADIUS = 16;
const AUTO_SCROLL_INTERVAL = 4000;

const UNSPLASH = (id, w = 800) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=80`;

const PROMO_SLIDES = [
  {
    id: '1',
    image: { uri: UNSPLASH('1610375461244-8d4e2b5c3b9a') },
    title: 'Pure Gold Excellence',
    subtitle: 'Trusted purity & craftsmanship',
  },
  {
    id: '2',
    image: { uri: UNSPLASH('1515562141207-7a88fb7ce338') },
    title: 'Premium Gold Jewelry',
    subtitle: 'Fine craftsmanship & design',
  },
  {
    id: '3',
    image: { uri: UNSPLASH('1573408301185-9146fe634ad0') },
    title: '24K Gold Coins',
    subtitle: 'Invest in timeless value',
  },
  {
    id: '4',
    image: { uri: UNSPLASH('1490481651871-ab68de25d43d') },
    title: 'Premium Gold Collection',
    subtitle: 'Explore our curated boutiques',
  },
];

const PromotionAutoScroller = ({ onSlidePress, colors = {} }) => {
  const c = { accent: '#F8C24D', textSecondary: '#555', overlay: 'rgba(0,0,0,0.35)', ...colors };
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveIndex((prev) => {
        const next = (prev + 1) % PROMO_SLIDES.length;
        flatListRef.current?.scrollToOffset({
          offset: next * (SLIDE_WIDTH + 12),
          animated: true,
        });
        return next;
      });
    }, AUTO_SCROLL_INTERVAL);
    return () => clearInterval(timer);
  }, []);

  const onMomentumScrollEnd = (e) => {
    const index = Math.round(e.nativeEvent.contentOffset.x / (SLIDE_WIDTH + 12));
    setActiveIndex(Math.min(index, PROMO_SLIDES.length - 1));
  };

  const renderSlide = ({ item }) => (
    <TouchableOpacity
      style={styles.slide}
      onPress={() => onSlidePress?.(item)}
      activeOpacity={1}
    >
      <Image source={item.image} style={styles.image} resizeMode="cover" />
      <View style={[styles.overlay, { backgroundColor: c.overlay }]}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={[styles.subtitle, { color: c.accent }]}>{item.subtitle}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={PROMO_SLIDES}
        renderItem={renderSlide}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={onMomentumScrollEnd}
        decelerationRate="fast"
        contentContainerStyle={styles.listContent}
        snapToInterval={SLIDE_WIDTH + 12}
        snapToAlignment="start"
      />
      <View style={styles.pagination}>
        {PROMO_SLIDES.map((_, index) => (
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
