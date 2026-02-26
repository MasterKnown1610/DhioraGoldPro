import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  FlatList,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { getStates, getDistricts } from '../data/locations';

const PINCODE_MAX_LENGTH = 6;

const FilterModal = ({ visible, onClose, initialFilters = {}, onApply, colors = {} }) => {
  const insets = useSafeAreaInsets();
  const c = {
    surface: '#2A2A2A',
    background: '#1A1A1A',
    text: '#fff',
    textSecondary: '#888',
    accent: '#F8C24D',
    surfaceSecondary: '#333',
    ...colors,
  };

  const [draft, setDraft] = useState({ state: '', district: '', pincode: '' });
  const [step, setStep] = useState('form'); // 'form' | 'stateList' | 'districtList'

  useEffect(() => {
    if (visible) {
      setDraft({
        state: initialFilters.state || '',
        district: initialFilters.district || '',
        pincode: initialFilters.pincode || '',
      });
      setStep('form');
    }
  }, [visible]);

  const states = getStates();
  const districts = getDistricts(draft.state);

  const handleApply = () => {
    onApply(draft);
    onClose();
  };

  const handleClearAll = () => {
    const empty = { state: '', district: '', pincode: '' };
    setDraft(empty);
    onApply(empty);
    onClose();
  };

  const handlePincodeChange = (text) => {
    const digits = text.replace(/\D/g, '').slice(0, PINCODE_MAX_LENGTH);
    setDraft((s) => ({ ...s, pincode: digits }));
  };

  if (!visible) return null;

  const bottomSafe = Math.max(insets.bottom, 20);

  const renderFormBody = () => (
    <View style={styles.formBody}>
      <View style={styles.fieldRow}>
        <Text style={[styles.fieldLabel, { color: c.textSecondary }]}>State</Text>
        <View style={styles.fieldValueRow}>
          <TouchableOpacity
            style={[styles.dropdownBtn, { backgroundColor: c.background }]}
            onPress={() => setStep('stateList')}
            activeOpacity={0.8}
          >
            <Text style={[styles.dropdownText, { color: draft.state ? c.text : c.textSecondary }]} numberOfLines={1}>
              {draft.state || 'Select state'}
            </Text>
            <Icon name="keyboard-arrow-down" size={22} color={c.textSecondary} />
          </TouchableOpacity>
          {draft.state ? (
            <TouchableOpacity
              onPress={() => setDraft((s) => ({ ...s, state: '', district: '' }))}
              hitSlop={8}
              style={styles.xWrap}
            >
              <Icon name="close" size={18} color={c.accent} />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      <View style={styles.fieldRow}>
        <Text style={[styles.fieldLabel, { color: c.textSecondary }]}>District</Text>
        <View style={styles.fieldValueRow}>
          <TouchableOpacity
            style={[styles.dropdownBtn, { backgroundColor: c.background }]}
            onPress={() => draft.state && setStep('districtList')}
            disabled={!draft.state}
            activeOpacity={0.8}
          >
            <Text style={[styles.dropdownText, { color: draft.district ? c.text : c.textSecondary }]} numberOfLines={1}>
              {draft.district || (draft.state ? 'Select district' : 'Select state first')}
            </Text>
            <Icon name="keyboard-arrow-down" size={22} color={c.textSecondary} />
          </TouchableOpacity>
          {draft.district ? (
            <TouchableOpacity
              onPress={() => setDraft((s) => ({ ...s, district: '' }))}
              hitSlop={8}
              style={styles.xWrap}
            >
              <Icon name="close" size={18} color={c.accent} />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      <View style={styles.fieldRow}>
        <Text style={[styles.fieldLabel, { color: c.textSecondary }]}>Pincode</Text>
        <View style={styles.fieldValueRow}>
          <TextInput
            style={[styles.pincodeInput, { backgroundColor: c.background, color: c.text }]}
            value={draft.pincode}
            onChangeText={handlePincodeChange}
            placeholder="6 digits"
            placeholderTextColor={c.textSecondary}
            keyboardType="number-pad"
            maxLength={PINCODE_MAX_LENGTH}
          />
          {draft.pincode ? (
            <TouchableOpacity
              onPress={() => setDraft((s) => ({ ...s, pincode: '' }))}
              hitSlop={8}
              style={styles.xWrap}
            >
              <Icon name="close" size={18} color={c.accent} />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>
    </View>
  );

  const renderFormFooter = () => (
    <View style={[styles.footer, { borderTopColor: c.surfaceSecondary, paddingBottom: bottomSafe }]}>
      <TouchableOpacity
        style={[styles.clearBtn, { backgroundColor: c.surfaceSecondary }]}
        onPress={handleClearAll}
        activeOpacity={0.8}
      >
        <Text style={[styles.clearBtnText, { color: c.text }]}>Clear</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.applyBtn, { backgroundColor: c.accent }]}
        onPress={handleApply}
        activeOpacity={0.8}
      >
        <Text style={styles.applyBtnText}>Apply</Text>
      </TouchableOpacity>
    </View>
  );

  const renderList = (title, data, onSelect) => (
    <>
      <View style={[styles.listHeader, { borderBottomColor: c.surfaceSecondary }]}>
        <TouchableOpacity onPress={() => setStep('form')} hitSlop={12} style={styles.backBtn}>
          <Icon name="arrow-back" size={24} color={c.text} />
        </TouchableOpacity>
        <Text style={[styles.listTitle, { color: c.text }]}>{title}</Text>
        <View style={styles.listHeaderSpacer} />
      </View>
      <FlatList
        data={data}
        keyExtractor={(item) => item}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.listOption, { borderBottomColor: c.surfaceSecondary }]}
            onPress={() => onSelect(item)}
            activeOpacity={0.7}
          >
            <Text style={[styles.listOptionText, { color: c.text }]}>{item}</Text>
          </TouchableOpacity>
        )}
        style={styles.list}
        contentContainerStyle={styles.listContent}
      />
    </>
  );

  return (
    <Modal visible={visible} transparent animationType="slide">
      <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={onClose}>
        <View style={styles.sheetWrapper} pointerEvents="box-none">
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={styles.avoid}
          >
            <View
              style={[styles.content, { backgroundColor: c.surface }]}
              onStartShouldSetResponder={() => true}
            >
            <View style={[styles.header, { borderBottomColor: c.surfaceSecondary }]}>
              <Text style={[styles.headerTitle, { color: c.text }]}>Filters</Text>
              <TouchableOpacity onPress={onClose} hitSlop={12} style={styles.closeBtn}>
                <Icon name="close" size={24} color={c.textSecondary} />
              </TouchableOpacity>
            </View>

            {step === 'form' && (
              <>
                <ScrollView
                  style={styles.formScroll}
                  contentContainerStyle={styles.formScrollContent}
                  keyboardShouldPersistTaps="handled"
                  showsVerticalScrollIndicator={false}
                >
                  {renderFormBody()}
                </ScrollView>
                {renderFormFooter()}
              </>
            )}
            {step === 'stateList' &&
              renderList('Select State', states, (item) => {
                setDraft((s) => ({ ...s, state: item, district: '' }));
                setStep('form');
              })}
            {step === 'districtList' &&
              renderList('Select District', districts, (item) => {
                setDraft((s) => ({ ...s, district: item }));
                setStep('form');
              })}
            </View>
          </KeyboardAvoidingView>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  sheetWrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    maxHeight: '92%',
  },
  avoid: {
    flex: 1,
    maxHeight: '92%',
  },
  content: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '92%',
    minHeight: 520,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  closeBtn: {
    padding: 4,
  },
  formScroll: {
    flexGrow: 0,
    flexShrink: 1,
  },
  formScrollContent: {
    paddingBottom: 20,
  },
  formBody: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  fieldRow: {
    marginBottom: 18,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
  },
  fieldValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dropdownBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 48,
    borderRadius: 12,
    paddingHorizontal: 14,
    marginRight: 8,
  },
  dropdownText: {
    fontSize: 15,
    flex: 1,
  },
  pincodeInput: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    paddingHorizontal: 14,
    fontSize: 16,
    marginRight: 8,
  },
  xWrap: {
    padding: 4,
  },
  footer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
  },
  clearBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginRight: 12,
  },
  clearBtnText: {
    fontSize: 16,
    fontWeight: '600',
  },
  applyBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  applyBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  listHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  backBtn: {
    marginRight: 12,
  },
  listTitle: {
    fontSize: 18,
    fontWeight: '700',
    flex: 1,
  },
  listHeaderSpacer: {
    width: 40,
  },
  list: {
    maxHeight: 440,
  },
  listContent: {
    paddingBottom: 16,
  },
  listOption: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  listOptionText: {
    fontSize: 16,
  },
});

export default FilterModal;
