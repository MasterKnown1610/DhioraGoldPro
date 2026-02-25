import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  FlatList,
  StyleSheet,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { getStates, getDistricts, getCities } from '../data/locations';

const LocationPicker = ({
  state,
  district,
  city,
  onStateChange,
  onDistrictChange,
  onCityChange,
  colors = {},
  stateLabel = 'State',
  districtLabel = 'District',
  cityLabel = 'City',
}) => {
  const c = { surface: '#2A2A2A', text: '#fff', textSecondary: '#888', accent: '#F8C24D', border: '#444', ...colors };
  const [modalType, setModalType] = useState(null);

  const states = getStates();
  const districts = getDistricts(state);
  const cities = getCities(state, district);
  const stateOptions = state && !states.includes(state) ? [state, ...states] : states;
  const districtOptions = district && !districts.includes(district) ? [district, ...districts] : districts;
  const cityOptions = city && !cities.includes(city) ? [city, ...cities] : cities;

  const renderOption = ({ item }) => (
    <TouchableOpacity
      style={[styles.option, { borderBottomColor: c.border }]}
      onPress={() => {
        if (modalType === 'state') {
          onStateChange(item);
          onDistrictChange('');
          onCityChange('');
        } else if (modalType === 'district') {
          onDistrictChange(item);
          onCityChange('');
        } else {
          onCityChange(item);
        }
        setModalType(null);
      }}
      activeOpacity={0.7}
    >
      <Text style={[styles.optionText, { color: c.text }]}>{item}</Text>
    </TouchableOpacity>
  );

  const options = modalType === 'state' ? stateOptions : modalType === 'district' ? districtOptions : cityOptions;
  const label = modalType === 'state' ? stateLabel : modalType === 'district' ? districtLabel : cityLabel;

  return (
    <>
      <View style={styles.row}>
        <View style={styles.field}>
          <Text style={[styles.fieldLabel, { color: c.textSecondary }]}>{stateLabel} *</Text>
          <TouchableOpacity
            style={[styles.pickerBtn, { backgroundColor: c.surface, borderColor: c.border }]}
            onPress={() => setModalType('state')}
          >
            <Text style={[styles.pickerText, { color: state ? c.text : c.textSecondary }]}>
              {state || `Select ${stateLabel.toLowerCase()}`}
            </Text>
            <Icon name="keyboard-arrow-down" size={22} color={c.textSecondary} />
          </TouchableOpacity>
        </View>
        <View style={styles.field}>
          <Text style={[styles.fieldLabel, { color: c.textSecondary }]}>{districtLabel} *</Text>
          <TouchableOpacity
            style={[styles.pickerBtn, { backgroundColor: c.surface, borderColor: c.border }]}
            onPress={() => state && setModalType('district')}
            disabled={!state}
          >
            <Text style={[styles.pickerText, { color: district ? c.text : c.textSecondary }]}>
              {district || (state ? `Select ${districtLabel.toLowerCase()}` : `Select ${stateLabel.toLowerCase()} first`)}
            </Text>
            <Icon name="keyboard-arrow-down" size={22} color={c.textSecondary} />
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.field}>
        <Text style={[styles.fieldLabel, { color: c.textSecondary }]}>{cityLabel} *</Text>
        <TouchableOpacity
          style={[styles.pickerBtn, { backgroundColor: c.surface, borderColor: c.border }]}
          onPress={() => district && setModalType('city')}
          disabled={!district}
        >
          <Text style={[styles.pickerText, { color: city ? c.text : c.textSecondary }]}>
            {city || (district ? `Select ${cityLabel.toLowerCase()}` : `Select ${districtLabel.toLowerCase()} first`)}
          </Text>
          <Icon name="keyboard-arrow-down" size={22} color={c.textSecondary} />
        </TouchableOpacity>
      </View>

      <Modal visible={!!modalType} transparent animationType="slide">
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setModalType(null)}>
          <View style={[styles.modalContent, { backgroundColor: c.surface }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: c.text }]}>{label}</Text>
              <TouchableOpacity onPress={() => setModalType(null)} hitSlop={12}>
                <Icon name="close" size={24} color={c.textSecondary} />
              </TouchableOpacity>
            </View>
            <FlatList
              data={options}
              keyExtractor={(item) => item}
              renderItem={renderOption}
              style={styles.list}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 12 },
  field: { flex: 1, marginBottom: 12 },
  fieldLabel: { fontSize: 12, marginBottom: 4, fontWeight: '600' },
  pickerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 44,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 12,
  },
  pickerText: { fontSize: 15 },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: '60%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#444',
  },
  modalTitle: { fontSize: 18, fontWeight: 'bold' },
  list: { maxHeight: 400 },
  option: {
    padding: 16,
    borderBottomWidth: 1,
  },
  optionText: { fontSize: 16 },
});

export default LocationPicker;
