import React, { useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Linking,
  Platform,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Context from '../../context/Context';

const SUPPORT_TOPICS = [
  {
    id: '1',
    title: 'Chat With Support',
    subtitle: 'Get instant answers from our team.',
    icon: 'chat-bubble-outline',
  },
  {
    id: '2',
    title: 'Add Promotions',
    subtitle: 'Promote your products and services.',
    icon: 'campaign',
  },
  {
    id: '3',
    title: 'How to Register',
    subtitle: 'Step-by-step registration guide.',
    icon: 'person-add',
  },
  {
    id: '4',
    title: 'Send Feedback',
    subtitle: 'We value your suggestions.',
    icon: 'rate-review',
  },
  {
    id: '5',
    title: 'Website Development',
    subtitle: 'Technical support and integrations.',
    icon: 'code',
  },
];

const SUPPORT_EMAIL = 'dhioragroups@gmail.com';
const OFFICE_ADDRESS = 'Hyderabad, Addagutta society JNTUH';
const PHONE_NUMBER = '+91 9505143534';
const WHATSAPP_NUMBER = '919505143534';
const DEFAULT_WHATSAPP_MESSAGE = 'Hi, I need support from Dhiora Gold Pro. Please help me.';

const HelpScreen = () => {
  const { theme } = useContext(Context);
  const c = theme.colors;

  const openWhatsApp = (customMessage) => {
    const text = encodeURIComponent(customMessage || DEFAULT_WHATSAPP_MESSAGE);
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${text}`;
    Linking.openURL(url).catch(() =>
      Alert.alert('Cannot open', 'Unable to open WhatsApp. Please ensure it is installed.'),
    );
  };

  const handleCall = () => {
    const number = PHONE_NUMBER.replace(/\D/g, '');
    const url = Platform.select({
      ios: `telprompt:+${number}`,
      default: `tel:+${number}`,
    });
    Linking.openURL(url).catch(() =>
      Alert.alert('Cannot call', 'Unable to open phone dialer. Try on a physical device.'),
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: c.background }]}>
      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {SUPPORT_TOPICS.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={[styles.topicCard, { backgroundColor: c.surface }]}
            activeOpacity={0.8}
            onPress={() => openWhatsApp(`Hi, I need help with: ${item.title}. Please assist me.`)}
          >
            <View style={[styles.iconBox, { backgroundColor: c.accent }]}>
              <Icon name={item.icon} size={24} color={c.accentText} />
            </View>
            <View style={styles.topicText}>
              <Text style={[styles.topicTitle, { color: c.text }]}>{item.title}</Text>
              <Text style={[styles.topicSubtitle, { color: c.textSecondary }]}>
                {item.subtitle}
              </Text>
            </View>
            <Icon name="chevron-right" size={24} color={c.accent} />
          </TouchableOpacity>
        ))}

        <View style={styles.contactSection}>
          <TouchableOpacity
            style={styles.contactRow}
            onPress={() => openWhatsApp()}
            activeOpacity={0.8}
          >
            <Icon name="email" size={20} color={c.accent} style={styles.contactIcon} />
            <View>
              <Text style={[styles.contactLabel, { color: c.textSecondary }]}>
                SUPPORT EMAIL
              </Text>
              <Text style={[styles.contactValue, { color: c.text }]}>{SUPPORT_EMAIL}</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.contactRow}
            onPress={() => openWhatsApp()}
            activeOpacity={0.8}
          >
            <Icon name="location-on" size={20} color={c.accent} style={styles.contactIcon} />
            <View>
              <Text style={[styles.contactLabel, { color: c.textSecondary }]}>
                OFFICE ADDRESS
              </Text>
              <Text style={[styles.contactValue, { color: c.text }]}>{OFFICE_ADDRESS}</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.contactRow}
            onPress={() => openWhatsApp()}
            activeOpacity={0.8}
          >
            <MaterialCommunityIcons
              name="whatsapp"
              size={22}
              color={c.accent}
              style={styles.contactIcon}
            />
            <View>
              <Text style={[styles.contactLabel, { color: c.textSecondary }]}>
                WHATSAPP SUPPORT
              </Text>
              <Text style={[styles.contactValue, { color: c.text }]}>{PHONE_NUMBER}</Text>
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={[styles.callBtn, { backgroundColor: c.accent }]}
            onPress={handleCall}
            activeOpacity={0.85}
          >
            <Icon name="phone" size={22} color={c.accentText} style={styles.actionIcon} />
            <Text style={[styles.callBtnText, { color: c.accentText }]}>Call Now</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.whatsappBtn, { backgroundColor: c.surface }]}
            onPress={() => openWhatsApp()}
            activeOpacity={0.85}
          >
            <MaterialCommunityIcons
              name="whatsapp"
              size={24}
              color={c.accent}
              style={styles.actionIcon}
            />
            <Text style={[styles.whatsappBtnText, { color: c.accent }]}>WhatsApp</Text>
          </TouchableOpacity>
        </View>

        <Text style={[styles.footer, { color: c.textSecondary }]}>
          © 2024 SUPPORT SERVICES. ALL RIGHTS RESERVED.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  topicCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  topicText: {
    flex: 1,
  },
  topicTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  topicSubtitle: {
    fontSize: 13,
  },
  contactSection: {
    marginTop: 8,
    marginBottom: 24,
    gap: 20,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  contactIcon: {
    marginRight: 14,
    marginTop: 2,
  },
  contactLabel: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 1,
    marginBottom: 4,
  },
  contactValue: {
    fontSize: 15,
    lineHeight: 22,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 28,
  },
  callBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
  },
  whatsappBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
  },
  actionIcon: {
    marginRight: 8,
  },
  callBtnText: {
    fontSize: 15,
    fontWeight: '700',
  },
  whatsappBtnText: {
    fontSize: 15,
    fontWeight: '700',
  },
  footer: {
    fontSize: 11,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
});

export default HelpScreen;
