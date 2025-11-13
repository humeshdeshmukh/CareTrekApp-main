import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  Modal, 
  TextInput, 
  Alert, 
  Platform, 
  ActivityIndicator, 
  RefreshControl, 
  ScrollView 
} from 'react-native';
import { useTheme, ThemeContextValue } from '../../contexts/theme/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import { useAuth } from '../../hooks/useAuth';
import { 
  Medication, 
  getMedications, 
  addMedication as addMedicationAPI, 
  updateMedication as updateMedicationAPI, 
  deleteMedication as deleteMedicationAPI,
  toggleMedicationReminder as toggleMedicationReminderAPI
} from '../../api/medication';

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
  const theme = useTheme();
  const { colors, isDark } = theme;
  const { user } = useAuth();
  const [medications, setMedications] = useState<Medication[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTime, setSelectedTime] = useState<Date>(new Date());
  const [showTimePicker, setShowTimePicker] = useState<boolean>(false);
  const timeInputRef = useRef<TouchableOpacity>(null);
  
  const [newMedication, setNewMedication] = useState<Omit<Medication, 'id' | 'created_at' | 'updated_at'>>({
    name: '',
    dosage: '',
    frequency: 'Once daily',
    instructions: '',
    time: new Date().toTimeString().substring(0, 5), // Format: 'HH:MM'
    reminder: true,
    start_date: new Date().toISOString().split('T')[0], // Format: 'YYYY-MM-DD'
  });

  const fetchMedications = useCallback(async () => {
    if (!user?.id) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await getMedications();
      if (error) throw error;
      
      if (data) {
        setMedications(data);
      }
    } catch (error) {
      console.error('Error fetching medications:', error);
      Alert.alert('Error', 'Failed to load medications. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchMedications();
  }, [fetchMedications]);

  const addMedication = async () => {
    if (!newMedication.name || !newMedication.dosage) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    try {
      const { data, error } = await addMedicationAPI({
        ...newMedication,
        user_id: user?.id || '',
      } as any); // Cast to any to handle the user_id type

      if (error) throw error;
      
      if (data) {
        setMedications([...medications, data]);
        setModalVisible(false);
        resetForm();
      }
    } catch (error) {
      console.error('Error adding medication:', error);
      Alert.alert('Error', 'Failed to add medication. Please try again.');
    }
  };

  const resetForm = () => {
    setNewMedication({
      name: '',
      dosage: '',
      frequency: 'Once daily',
      instructions: '',
      time: new Date().toTimeString().substring(0, 5),
      reminder: true,
      start_date: new Date().toISOString().split('T')[0],
    });
  };

  const deleteMedication = async (id: string) => {
    try {
      const { error } = await deleteMedicationAPI(id);
      if (error) throw error;
      
      setMedications(medications.filter(med => med.id !== id));
    } catch (error) {
      console.error('Error deleting medication:', error);
      Alert.alert('Error', 'Failed to delete medication. Please try again.');
    }
  };

  const toggleReminder = async (id: string, currentReminder: boolean = true) => {
    try {
      const { error } = await toggleMedicationReminderAPI(id, currentReminder);
      if (error) throw error;
      
      setMedications(
        medications.map(med =>
          med.id === id ? { ...med, reminder: !currentReminder } : med
        )
      );
    } catch (error) {
      console.error('Error toggling reminder:', error);
      Alert.alert('Error', 'Failed to update reminder. Please try again.');
    }
  };

  const renderMedicationItem = ({ item }: { item: Medication }) => (
    <View style={[styles.medicationItem, { backgroundColor: colors.card }]}>
      <View style={styles.medicationHeader}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.medicationName, { color: colors.primary }]}>{item.name}</Text>
          <Text style={[styles.medicationDosage, { color: colors.text }]}>{item.dosage}</Text>
          <Text style={[styles.medicationInfo, { color: colors.text }]}>
            <Ionicons name="time-outline" size={14} color={colors.text} /> {item.time}
            {'  •  '}
            <Ionicons name="repeat-outline" size={14} color={colors.text} /> {item.frequency}
          </Text>
          {item.instructions && (
            <Text style={[styles.medicationInstructions, { color: colors.text }]}>
              <Ionicons name="information-circle-outline" size={14} color={colors.text} /> {item.instructions}
            </Text>
          )}
        </View>
        <TouchableOpacity
          onPress={() => toggleReminder(item.id, item.reminder)}
          style={[
            styles.reminderButton,
            { backgroundColor: item.reminder ? colors.primary : colors.background }
          ]}
        >
          <Ionicons
            name={item.reminder ? 'notifications' : 'notifications-off'}
            size={20}
            color={item.reminder ? 'white' : colors.text}
          />
        </TouchableOpacity>
      </View>
      <Text style={[styles.medicationDetail, { color: colors.textSecondary }]}>
        {item.frequency} at {item.time}
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

  if (isLoading) {
    const loadingStyles = getStyles(colors);
    return (
      <View style={[loadingStyles.container, loadingStyles.centered, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const styles = getStyles(colors);

  return (
    <View style={styles.container}>
      <FlatList
        data={medications}
        renderItem={renderMedicationItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="medical-outline" size={50} color={colors.primary} />
            <Text style={[styles.emptyText, { color: colors.text }]}>
              No medications added yet
            </Text>
            <Text style={[styles.emptySubtext, { color: colors.text }]}>
              Tap the + button to add a new medication
            </Text>
          </View>
        }
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={fetchMedications}
            tintColor={colors.primary}
          />
        }
      />

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
              <TouchableOpacity 
                onPress={() => setModalVisible(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalBody}>
              <View style={styles.formContainer}>

            <View style={styles.inputContainer}>
              <Ionicons name="medkit-outline" size={20} color={colors.primary} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { 
                  backgroundColor: colors.background, 
                  color: colors.text,
                  borderColor: colors.border,
                  paddingLeft: 40
                }]}
                placeholder="Medication Name"
                placeholderTextColor={colors.textSecondary}
                value={newMedication.name}
                onChangeText={text => setNewMedication({ ...newMedication, name: text })}
              />
            </View>

            <View style={styles.inputContainer}>
              <Ionicons name="speedometer-outline" size={20} color={colors.primary} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { 
                  backgroundColor: colors.background, 
                  color: colors.text,
                  borderColor: colors.border,
                  paddingLeft: 40
                }]}
                placeholder="Dosage (e.g., 10mg)"
                placeholderTextColor={colors.textSecondary}
                value={newMedication.dosage}
                onChangeText={text => setNewMedication({ ...newMedication, dosage: text })}
              />
            </View>

            <View style={[styles.inputContainer, { marginBottom: 16 }]}>
              <Ionicons name="repeat-outline" size={20} color={colors.primary} style={styles.inputIcon} />
              <View style={[styles.pickerContainer, { 
                backgroundColor: colors.background,
                borderColor: colors.border 
              }]}>
                <Picker
                  selectedValue={newMedication.frequency}
                  onValueChange={(itemValue: string) => {
                    setNewMedication({ ...newMedication, frequency: itemValue })
                  }}
                  style={{ 
                    color: colors.text,
                    flex: 1,
                    paddingLeft: 8
                  }}
                  dropdownIconColor={colors.text}
                >
                  {frequencies.map(freq => (
                    <Picker.Item 
                      key={freq} 
                      label={freq} 
                      value={freq} 
                      color={colors.text}
                    />
                  ))}
                </Picker>
              </View>
            </View>

            <View style={[styles.inputContainer, { marginBottom: 16 }]}>
              <Ionicons name="time-outline" size={20} color={colors.primary} style={styles.inputIcon} />
              <TouchableOpacity
                ref={timeInputRef}
                style={[
                  styles.timeInput, { 
                    borderColor: showTimePicker ? colors.primary : colors.border,
                    backgroundColor: colors.background,
                    flex: 1,
                    paddingLeft: 40
                  }
                ]}
                onPress={() => setShowTimePicker(true)}
                onFocus={() => setShowTimePicker(true)}>
                <Text style={{ 
                  color: newMedication.time ? colors.text : colors.textSecondary,
                  fontSize: 16
                }}>
                  {newMedication.time ? (() => {
                    // Convert 24h time to 12h format with AM/PM
                    const [hours, minutes] = newMedication.time.split(':').map(Number);
                    const period = hours >= 12 ? 'PM' : 'AM';
                    const hours12 = hours % 12 || 12; // Convert 0 to 12 for 12 AM
                    return `${hours12}:${minutes.toString().padStart(2, '0')} ${period}`;
                  })() : 'Select time'}
                </Text>
                <Ionicons 
                  name="chevron-down" 
                  size={16} 
                  color={colors.textSecondary} 
                  style={{ marginLeft: 8 }}
                />
              </TouchableOpacity>
              <View style={styles.timePickerContainer}>
                {showTimePicker && (
                  <>
                    <DateTimePicker
                      value={newMedication.time ? (() => {
                        const [hours, minutes] = newMedication.time.split(':').map(Number);
                        const date = new Date();
                        date.setHours(hours, minutes);
                        return date;
                      })() : new Date()}
                      mode="time"
                      display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                      textColor={colors.text}
                      themeVariant={isDark ? 'dark' : 'light'}
                      onChange={(event, time) => {
                        if (time) {
                          // Store time in 24h format for consistency
                          const hours = time.getHours().toString().padStart(2, '0');
                          const minutes = time.getMinutes().toString().padStart(2, '0');
                          const timeString = `${hours}:${minutes}`;
                          setNewMedication({ ...newMedication, time: timeString });
                        }
                      }}
                    />
                    <View style={styles.timePickerActions}>
                      <TouchableOpacity
                        style={[styles.doneButton, { backgroundColor: colors.primary }]}
                        onPress={() => {
                          setShowTimePicker(false);
                          timeInputRef.current?.blur();
                        }}
                      >
                        <Text style={styles.doneButtonText}>Done</Text>
                      </TouchableOpacity>
                    </View>
                  </>
                )}
              </View>
            </View>

            <View style={[styles.inputContainer, { marginBottom: 16 }]}>
              <Ionicons 
                name="document-text-outline" 
                size={20} 
                color={colors.primary} 
                style={[styles.inputIcon, { marginTop: 12 }]} 
              />
              <TextInput
                style={[
                  styles.input,
                  styles.multilineInput,
                  { 
                    backgroundColor: colors.background, 
                    color: colors.text,
                    borderColor: colors.border,
                    paddingLeft: 40,
                    textAlignVertical: 'top',
                    minHeight: 100
                  }
                ]}
                placeholder="Instructions (optional)"
                placeholderTextColor={colors.textSecondary}
                value={newMedication.instructions}
                onChangeText={text => setNewMedication({ ...newMedication, instructions: text })}
                multiline
                numberOfLines={4}
              />
            </View>

            <View style={[styles.reminderContainer, { 
              backgroundColor: colors.background,
              borderRadius: 12,
              padding: 16,
              marginBottom: 16,
              borderWidth: 1,
              borderColor: colors.border
            }]}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons 
                  name="notifications-outline" 
                  size={20} 
                  color={colors.primary} 
                  style={{ marginRight: 12 }}
                />
                <View>
                  <Text style={[styles.reminderText, { 
                    color: colors.text,
                    fontSize: 16,
                    fontWeight: '500',
                    marginBottom: 4
                  }]}>
                    Set Reminder
                  </Text>
                  <Text style={{ 
                    color: colors.textSecondary,
                    fontSize: 14
                  }}>
                    {newMedication.reminder ? 'Enabled' : 'Disabled'}
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                onPress={() =>
                  setNewMedication({
                    ...newMedication,
                    reminder: !newMedication.reminder,
                  })
                }
                activeOpacity={0.7}
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
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.2,
                        shadowRadius: 2,
                        elevation: 2,
                      },
                    ]}
                  />
                </View>
              </TouchableOpacity>
            </View>

                <TouchableOpacity
                  style={[styles.modalButton, { 
                    backgroundColor: colors.primary,
                    opacity: isLoading ? 0.7 : 1,
                    flexDirection: 'row',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: 50,
                    borderRadius: 12,
                    marginTop: 8,
                    shadowColor: colors.primary,
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.3,
                    shadowRadius: 4,
                    elevation: 4,
                  }]}
                  onPress={addMedication}
                  disabled={isLoading}
                  activeOpacity={0.8}
                >
                  {isLoading ? (
                    <ActivityIndicator color="white" />
                  ) : (
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <Ionicons name="add-circle-outline" size={20} color="white" style={{ marginRight: 8 }} />
                      <Text style={[styles.modalButtonText, { 
                        color: 'white',
                        fontSize: 16,
                        fontWeight: '600',
                        textAlign: 'center'
                      }]}>
                        Add Medication
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const getStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
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
    marginTop: 10,
    fontSize: 16,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  emptySubtext: {
    marginTop: 5,
    fontSize: 14,
    textAlign: 'center',
    opacity: 0.7,
  },
  medicationInfo: {
    fontSize: 14,
    marginTop: 4,
    opacity: 0.8,
  },
  reminderButton: {
    padding: 8,
    borderRadius: 20,
    marginLeft: 10,
  },
  modalButton: {
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
    backgroundColor: '#4CAF50',
  },
  modalButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    color: '#4B5563',
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
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '90%',
    width: '100%',
  },
  modalBody: {
    paddingBottom: 20,
  },
  formContainer: {
    paddingBottom: 20,
  },
  closeButton: {
    padding: 8,
    margin: -8,
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
  inputContainer: {
    marginBottom: 16,
    position: 'relative',
  },
  inputIcon: {
    position: 'absolute',
    left: 12,
    top: 12,
    zIndex: 1,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    backgroundColor: 'transparent',
    color: colors.text,
    minHeight: 50,
  },
  multilineInput: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  pickerContainer: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 12,
    overflow: 'hidden',
    justifyContent: 'center',
    minHeight: 50,
  },
  timePickerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  timeInput: {
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    flex: 1,
    fontSize: 16,
    backgroundColor: 'transparent',
    color: colors.text,
    justifyContent: 'space-between',
    alignItems: 'center',
    flexDirection: 'row',
    minHeight: 50,
    paddingLeft: 40,
  },
  timePickerWrapper: {
    width: '100%',
    marginTop: 8,
  },
  timePickerDoneButton: {
    padding: 10,
    alignItems: 'flex-end',
    marginTop: 8,
  },
  timePickerContainer: {
    width: '100%',
    marginTop: 8,
  },
  timePickerActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 8,
    paddingHorizontal: 4,
  },
  doneButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 100,
  },
  doneButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  reminderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  reminderText: {
    fontSize: 16,
    fontWeight: '500',
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
