//src/components/SimpleDatePicker.js
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Platform
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';

const SimpleDatePicker = ({ visible, onClose, onConfirm, currentDate }) => {
  const [selectedDate, setSelectedDate] = useState(currentDate || new Date());
  const [selectedMonth, setSelectedMonth] = useState(selectedDate.getMonth());
  const [selectedYear, setSelectedYear] = useState(selectedDate.getFullYear());
  const [selectedDay, setSelectedDay] = useState(selectedDate.getDate());

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const days = Array.from({ length: 31 }, (_, i) => i + 1);
  const years = Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - 5 + i);

  const handleConfirm = () => {
    const date = new Date(selectedYear, selectedMonth, selectedDay);
    onConfirm(date);
    onClose();
  };

  const renderPicker = (items, selectedValue, onSelect, width = 80) => (
    <View style={[styles.pickerColumn, { width }]}>
      <TouchableOpacity 
        onPress={() => onSelect(Math.max(0, selectedValue - 1))}
        style={styles.pickerArrow}
      >
        <Icon name="chevron-up" size={20} color="#64748B" />
      </TouchableOpacity>
      
      <View style={styles.pickerItems}>
        {items.slice(Math.max(0, selectedValue - 2), selectedValue + 3).map((item, index) => {
          const itemValue = typeof item === 'object' ? item.value : item;
          const itemLabel = typeof item === 'object' ? item.label : item;
          const isSelected = itemValue === selectedValue;
          
          return (
            <TouchableOpacity
              key={index}
              style={[
                styles.pickerItem,
                isSelected && styles.pickerItemSelected
              ]}
              onPress={() => onSelect(itemValue)}
            >
              <Text style={[
                styles.pickerItemText,
                isSelected && styles.pickerItemTextSelected
              ]}>
                {itemLabel}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
      
      <TouchableOpacity 
        onPress={() => onSelect(Math.min(items.length - 1, selectedValue + 1))}
        style={styles.pickerArrow}
      >
        <Icon name="chevron-down" size={20} color="#64748B" />
      </TouchableOpacity>
    </View>
  );

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select Date</Text>
            <TouchableOpacity onPress={onClose}>
              <Icon name="x" size={22} color="#64748B" />
            </TouchableOpacity>
          </View>

          <View style={styles.pickersContainer}>
            {renderPicker(
              months.map((month, index) => ({ label: month.substring(0, 3), value: index })),
              selectedMonth,
              setSelectedMonth,
              70
            )}
            {renderPicker(days, selectedDay, setSelectedDay, 60)}
            {renderPicker(years, selectedYear, setSelectedYear, 80)}
          </View>

          <View style={styles.modalFooter}>
            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.confirmButton} onPress={handleConfirm}>
              <Text style={styles.confirmButtonText}>Confirm</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    width: '90%',
    maxWidth: 400,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
  },
  pickersContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    gap: 10,
  },
  pickerColumn: {
    alignItems: 'center',
  },
  pickerArrow: {
    padding: 8,
  },
  pickerItems: {
    height: 150,
    justifyContent: 'center',
  },
  pickerItem: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  pickerItemSelected: {
    backgroundColor: '#F0F9FF',
  },
  pickerItemText: {
    fontSize: 16,
    color: '#64748B',
  },
  pickerItemTextSelected: {
    color: '#0A84FF',
    fontWeight: '600',
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#64748B',
  },
  confirmButton: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    backgroundColor: '#0A84FF',
    borderRadius: 12,
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default SimpleDatePicker;