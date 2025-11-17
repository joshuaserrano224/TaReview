import { useState } from 'react';
import { FlatList, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
// IMPORTING STYLES AND COLORS IS ESSENTIAL
import { Ionicons } from '@expo/vector-icons';
import styles, { COLORS } from './AuthStyles';

/**
 * A custom replacement for the native Picker using a styleable Modal and FlatList.
 * @param {string} props.label - The label for the input field (e.g., "Field of Interest").
 * @param {string} props.placeholder - The default text displayed when no value is selected.
 * @param {Array<object>} props.options - Array of objects: [{ label: 'Display Text', value: 'data_key' }, ...].
 * @param {string} props.selectedValue - The currently selected value.
 * @param {function} props.onValueChange - Callback function when an item is selected: (value) => void.
 */
const CustomPicker = ({ label, placeholder, options, selectedValue, onValueChange }) => {
  const [modalVisible, setModalVisible] = useState(false);

  // Find the selected label based on the selected value
  const selectedItem = options.find(item => item.value === selectedValue);
  const displayLabel = selectedItem ? selectedItem.label : placeholder;
  const isPlaceholder = !selectedItem || selectedValue === '';

  const handleSelect = (value) => {
    onValueChange(value);
    setModalVisible(false);
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity 
      style={pickerModalStyles.itemContainer} 
      onPress={() => handleSelect(item.value)}
      activeOpacity={0.7}
    >
      <Text 
        style={[
          pickerModalStyles.itemText, 
          item.value === selectedValue && pickerModalStyles.itemTextSelected
        ]}
      >
        {item.label}
      </Text>
      {item.value === selectedValue && (
        <Ionicons name="checkmark-circle" size={20} color={COLORS.accent} />
      )}
    </TouchableOpacity>
  );

  return (
    <View style={{ marginBottom: 15 }}>
      {/* Uses the label style from AuthStyles.js */}
      <Text style={styles.label}>{label}</Text>
      
      {/* Input Display Area (Uses customPickerDisplay style from AuthStyles.js) */}
      <TouchableOpacity 
        style={styles.customPickerDisplay} 
        onPress={() => setModalVisible(true)}
        activeOpacity={0.7}
      >
        <Text style={isPlaceholder ? styles.customPickerPlaceholder : styles.customPickerText}>
          {displayLabel}
        </Text>
        <Ionicons name="chevron-down" style={styles.customPickerIcon} />
      </TouchableOpacity>

      {/* Modal for Selection List */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableOpacity
          style={pickerModalStyles.centeredView}
          activeOpacity={1}
          onPressOut={() => setModalVisible(false)}
        >
          <View style={pickerModalStyles.modalView}>
            
            <Text style={pickerModalStyles.modalTitle}>Select {label}</Text>
            
            <FlatList
              data={options.filter(item => item.value !== '')}
              keyExtractor={(item) => item.value}
              renderItem={renderItem}
              style={pickerModalStyles.list}
              showsVerticalScrollIndicator={false}
            />
            
            <TouchableOpacity 
              style={pickerModalStyles.closeButton} 
              onPress={() => setModalVisible(false)}
              activeOpacity={0.8}
            >
              <Text style={pickerModalStyles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

// Internal styles specifically for the Modal/Dropdown appearance
// Uses COLORS imported from AuthStyles.js
const pickerModalStyles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  modalView: {
    margin: 20,
    width: '85%',
    maxWidth: 400,
    backgroundColor: COLORS.primary,
    borderRadius: 16,
    padding: 20,
    alignItems: 'stretch',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 10,
    maxHeight: '60%', 
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.highlight,
    paddingBottom: 10,
  },
  list: {
    maxHeight: 250, 
  },
  itemContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLORS.highlight,
  },
  itemText: {
    fontSize: 16,
    color: COLORS.text,
    flex: 1,
  },
  itemTextSelected: {
    fontWeight: '700',
    color: COLORS.accent,
  },
  closeButton: {
    marginTop: 20,
    backgroundColor: COLORS.accent,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  closeButtonText: {
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: '700',
  },
});

export default CustomPicker;

