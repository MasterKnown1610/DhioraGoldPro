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
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { getStates, getDistricts } from '../data/locations';

const PINCODE_MAX_LENGTH = 6;

const FilterModal = ({ visible, onClose, initialFilters = {}, onApply, colors = {} }) => {
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

  const renderForm = () => (
    <>
      <View style={styles.formBody}>
        {/* State row */}
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

        {/* District row */}
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

        {/* Pincode row - numbers only, 6 digits */}
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

      <View style={[styles.footer, { borderTopColor: c.surfaceSecondary }]}>
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
    </>
  );

  const renderList = (title, data, onSelect) => (
    <>
      <View style={[styles.listHeader, { borderBottomColor: c.surfaceSecondary }]}>
        <TouchableOpacity onPress={() => setStep('form')} hitSlop={12} style={styles.backBtn}>
          <Icon name="arrow-back" size={24} color={c.text} />
        </TouchableOpacity>
        <Text style={[styles.listTitle, { color: c.text }]}>{title}</Text>
        <View style={{ width: 40 }} />
      </View>
      <FlatList
        data={data}
        keyExtractor={(item) => item}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.listOption, { borderBottomColor: c.surfaceSecondary }]}
            onPress={() => onSelect(item)}
          >
            <Text style={[styles.listOptionText, { color: c.text }]}>{item}</Text>
          </TouchableOpacity>
        )}
        style={styles.list}
      />
    </>
  );

  return (
    <Modal visible={visible} transparent animationType="slide">
      <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={onClose}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.avoid}
        >
          <View style={[styles.content, { backgroundColor: c.surface }]} onStartShouldSetResponder={() => true}>
            <View style={[styles.header, { borderBottomColor: c.surfaceSecondary }]}>
              <Text style={[styles.headerTitle, { color: c.text }]}>Filters</Text>
              <TouchableOpacity onPress={onClose} hitSlop={12}>
                <Icon name="close" size={24} color={c.textSecondary} />
              </TouchableOpacity>
            </View>

            {step === 'form' && renderForm()}
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
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  avoid: { maxHeight: '75%' },
  content: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: '75%',
    paddingBottom: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
  },
  headerTitle: { fontSize: 18, fontWeight: 'bold' },
  formBody: { padding: 16 },
  fieldRow: { marginBottom: 16 },
  fieldLabel: { fontSize: 12, fontWeight: '600', marginBottom: 6 },
  fieldValueRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  dropdownBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 48,
    borderRadius: 12,
    paddingHorizontal: 14,
  },
  dropdownText: { fontSize: 15, flex: 1 },
  pincodeInput: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    paddingHorizontal: 14,
    fontSize: 16,
  },
  xWrap: { padding: 4 },
  footer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    borderTopWidth: 1,
  },
  clearBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  clearBtnText: { fontSize: 16, fontWeight: '600' },
  applyBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  applyBtnText: { fontSize: 16, fontWeight: '700', color: '#1A1A1A' },
  listHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  backBtn: { marginRight: 8 },
  listTitle: { fontSize: 18, fontWeight: 'bold', flex: 1 },
  list: { maxHeight: 320 },
  listOption: {
    padding: 16,
    borderBottomWidth: 1,
  },
  listOptionText: { fontSize: 16 },
});

export default FilterModal;
