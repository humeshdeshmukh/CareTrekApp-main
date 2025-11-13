import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Modal, TextInput, Alert, Platform } from 'react-native';
import { useTheme } from '../../contexts/theme/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';

type Medication = {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  instructions: string;
  startDate: Date;
  endDate?: Date;
  time: Date;
  reminder: boolean;
};

const frequencies = [
  'Once daily',
  'Twice daily',
  'Three times a day',
  'Four times a day',
  'Every 4 hours',
  'Every 6 hours',
  'Every 8 hours',
  'Every 12 hours',
  'As needed',
];

const MedicationScreen = () => {
  const { colors, isDark } = useTheme();
  const [medications, setMedications] = useState<Medication[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedTime, setSelectedTime] = useState<Date>(new Date());
  const [showTimePicker, setShowTimePicker] = useState<boolean>(false);
  
  const [newMedication, setNewMedication] = useState<Partial<Medication>>({
    name: '',
    dosage: '',
    frequency: 'Once daily',
    instructions: '',
    time: new Date(),
    reminder: true,
    startDate: new Date(),
  });

  const addMedication = () => {
    if (!newMedication.name || !newMedication.dosage) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    const medication: Medication = {
      id: Math.random().toString(36).substring(7),
      name: newMedication.name || '',
      dosage: newMedication.dosage || '',
      frequency: newMedication.frequency || 'Once daily',
      instructions: newMedication.instructions || '',
      time: newMedication.time || new Date(),
      reminder: newMedication.reminder !== false,
      startDate: newMedication.startDate || new Date(),
    };

    setMedications([...medications, medication]);
    setModalVisible(false);
    resetForm();
  };

  const resetForm = () => {
    setNewMedication({
      name: '',
      dosage: '',
      frequency: 'Once daily',
      instructions: '',
      time: new Date(),
      reminder: true,
      startDate: new Date(),
    });
  };

  const deleteMedication = (id: string) => {
    setMedications(medications.filter(med => med.id !== id));
  };

  const toggleReminder = (id: string) => {
    setMedications(
      medications.map(med =>
        med.id === id ? { ...med, reminder: !med.reminder } : med
      )
    );
  };

  const renderMedicationItem = ({ item }: { item: Medication }) => (
    <View style={[styles.medicationItem, { backgroundColor: colors.card }]}>
      <View style={styles.medicationHeader}>
        <Text style={[styles.medicationName, { color: colors.primary }]}>{item.name}</Text>
        <Text style={[styles.medicationDosage, { color: colors.text }]}>{item.dosage}</Text>
      </View>
      <Text style={[styles.medicationDetail, { color: colors.textSecondary }]}>
        {item.frequency} at {item.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </Text>
      {item.instructions && (
        <Text style={[styles.medicationInstructions, { color: colors.text }]}>
          {item.instructions}
        </Text>
      )}
      <View style={styles.medicationActions}>
        <TouchableOpacity 
          onPress={() => toggleReminder(item.id)}
          style={[styles.actionButton, { backgroundColor: item.reminder ? colors.primary : '#E2E8F0' }]}
        >
          <Ionicons 
            name={item.reminder ? 'checkmark-circle' : 'checkmark-circle-outline'} 
            size={24} 
            color={item.reminder ? colors.primary : colors.textSecondary} 
          />
        </TouchableOpacity>
        <TouchableOpacity 
          onPress={() => deleteMedication(item.id)}
          style={[styles.actionButton, { backgroundColor: '#FEE2E2' }]}
        >
          <Ionicons name="trash" size={20} color="#EF4444" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {medications.length > 0 ? (
        <FlatList
          data={medications}
          renderItem={renderMedicationItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContainer}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Ionicons name="medical" size={64} color={colors.primary} />
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            No medications added yet
          </Text>
          <Text style={[styles.emptySubtext, { color: colors.textSecondary }]}>
            Tap the + button to add a new medication
          </Text>
        </View>
      )}

      <TouchableOpacity
        style={[styles.addButton, { backgroundColor: colors.primary }]}
        onPress={() => setModalVisible(true)}
      >
        <Ionicons name="add" size={32} color="white" />
      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Add Medication</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <TextInput
              style={[styles.input, { backgroundColor: colors.background, color: colors.text }]}
              placeholder="Medication Name"
              placeholderTextColor={colors.textSecondary}
              value={newMedication.name}
              onChangeText={text => setNewMedication({ ...newMedication, name: text })}
            />

            <TextInput
              style={[styles.input, { backgroundColor: colors.background, color: colors.text }]}
              placeholder="Dosage (e.g., 10mg)"
              placeholderTextColor={colors.textSecondary}
              value={newMedication.dosage}
              onChangeText={text => setNewMedication({ ...newMedication, dosage: text })}
            />

            <View style={[styles.pickerContainer, { backgroundColor: colors.background }]}>
              <Picker
                selectedValue={newMedication.frequency}
                onValueChange={(itemValue: string) => {
                  setNewMedication({ ...newMedication, frequency: itemValue })
                }}
                style={{ color: colors.text }}
                dropdownIconColor={colors.text}
              >
                {frequencies.map(freq => (
                  <Picker.Item key={freq} label={freq} value={freq} />
                ))}
              </Picker>
            </View>

            <TouchableOpacity
              style={[styles.timeButton, { backgroundColor: colors.background }]}
              onPress={() => setShowTimePicker(true)}
            >
              <Ionicons name="time" size={20} color={colors.primary} />
              <Text style={[styles.timeButtonText, { color: colors.text }]}>
                {newMedication.time ? newMedication.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Select Time'}
              </Text>
            </TouchableOpacity>

            {showTimePicker && (
              <DateTimePicker
                value={newMedication.time || new Date()}
                mode="time"
                display="default"
                onChange={(event, selectedTime) => {
                  setShowTimePicker(false);
                  if (selectedTime) {
                    setNewMedication({ ...newMedication, time: selectedTime });
                  }
                }}
              />
            )}

            <TextInput
              style={[
                styles.input,
                styles.multilineInput,
                { backgroundColor: colors.background, color: colors.text }
              ]}
              placeholder="Instructions (optional)"
              placeholderTextColor={colors.textSecondary}
              value={newMedication.instructions}
              onChangeText={text => setNewMedication({ ...newMedication, instructions: text })}
              multiline
              numberOfLines={3}
            />

            <View style={styles.reminderContainer}>
              <Text style={[styles.reminderText, { color: colors.text }]}>
                Set Reminder
              </Text>
              <TouchableOpacity
                onPress={() =>
                  setNewMedication({
                    ...newMedication,
                    reminder: !newMedication.reminder,
                  })
                }
              >
                <View
                  style={[
                    styles.toggle,
                    {
                      backgroundColor: newMedication.reminder
                        ? colors.primary
                        : '#E2E8F0',
                    },
                  ]}
                >
                  <View
                    style={[
                      styles.toggleCircle,
                      {
                        transform: [
                          { translateX: newMedication.reminder ? 20 : 0 },
                        ],
                        backgroundColor: 'white',
                      },
                    ]}
                  />
                </View>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[styles.saveButton, { backgroundColor: colors.primary }]}
              onPress={addMedication}
            >
              <Text style={styles.saveButtonText}>Save Medication</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContainer: {
    padding: 16,
  },
  medicationItem: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  medicationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  medicationName: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
  },
  medicationDosage: {
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 8,
  },
  medicationDetail: {
    fontSize: 14,
    marginBottom: 8,
  },
  medicationInstructions: {
    fontSize: 14,
    fontStyle: 'italic',
    marginTop: 8,
  },
  medicationActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 12,
  },
  actionButton: {
    padding: 8,
    borderRadius: 20,
    marginLeft: 8,
    justifyContent: 'center',
    alignItems: 'center',
    width: 40,
    height: 40,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
  addButton: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    padding: 16,
  },
  modalContent: {
    borderRadius: 12,
    padding: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
  },
  multilineInput: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    marginBottom: 16,
    overflow: 'hidden',
  },
  timeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 16,
  },
  timeButtonText: {
    marginLeft: 8,
    fontSize: 16,
  },
  reminderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  reminderText: {
    fontSize: 16,
  },
  toggle: {
    width: 50,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  toggleCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  saveButton: {
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default MedicationScreen;
