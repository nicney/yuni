import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  FlatList,
} from 'react-native';
import { DISTANCE_RANGES, DistanceRange } from '../types';

interface Props {
  selectedRange: DistanceRange;
  onRangeChange: (range: DistanceRange) => void;
  visible: boolean;
  onClose: () => void;
}

export default function DistanceRangeSelector({
  selectedRange,
  onRangeChange,
  visible,
  onClose,
}: Props) {
  const handleRangeSelect = (range: DistanceRange) => {
    onRangeChange(range);
    onClose();
  };

  const renderRangeItem = ({ item }: { item: DistanceRange }) => (
    <TouchableOpacity
      style={[
        styles.rangeItem,
        selectedRange.value === item.value && styles.selectedRangeItem,
      ]}
      onPress={() => handleRangeSelect(item)}
    >
      <Text
        style={[
          styles.rangeText,
          selectedRange.value === item.value && styles.selectedRangeText,
        ]}
      >
        {item.label}
      </Text>
      {selectedRange.value === item.value && (
        <Text style={styles.checkmark}>✓</Text>
      )}
    </TouchableOpacity>
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>เลือกรัศมี</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>×</Text>
            </TouchableOpacity>
          </View>
          
          <FlatList
            data={DISTANCE_RANGES}
            renderItem={renderRangeItem}
            keyExtractor={(item) => item.value.toString()}
            style={styles.list}
          />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  closeButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 20,
    color: '#666',
  },
  list: {
    maxHeight: 400,
  },
  rangeItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  selectedRangeItem: {
    backgroundColor: '#f0f8ff',
  },
  rangeText: {
    fontSize: 16,
    color: '#333',
  },
  selectedRangeText: {
    color: '#007AFF',
    fontWeight: '600',
  },
  checkmark: {
    fontSize: 18,
    color: '#007AFF',
    fontWeight: 'bold',
  },
});
