import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Modal, TextInput, Alert, SafeAreaView, StatusBar } from 'react-native';
import { useTheme } from '../../contexts/theme/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useNavigation } from '@react-navigation/native';

// Custom Header Component
const CustomHeader = ({ title, onBack }: { title: string; onBack: () => void }) => {
  const { colors, isDark } = useTheme();
  
  return (
    <View style={[styles.header, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      <TouchableOpacity onPress={onBack} style={styles.backButton}>
        <Ionicons 
          name="arrow-back" 
          size={24} 
          color={colors.primary} 
        />
      </TouchableOpacity>
      <Text style={[styles.headerTitle, { color: colors.text }]}>{title}</Text>
      <View style={styles.headerRight} />
    </View>
  );
};

type Appointment = {
  id: string;
  title: string;
  doctor: string;
  date: Date;
  time: Date;
  location: string;
  notes: string;
  reminder: boolean;
};

const AppointmentScreen = () => {
  const navigation = useNavigation();
  const { colors, isDark } = useTheme();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  
  const [newAppointment, setNewAppointment] = useState<Partial<Appointment>>({
    title: '',
    doctor: '',
    date: new Date(),
    time: new Date(),
    location: '',
    notes: '',
    reminder: true,
  });

  const addAppointment = () => {
    if (!newAppointment.title || !newAppointment.doctor) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    const appointment: Appointment = {
      id: Math.random().toString(36).substring(7),
      title: newAppointment.title || '',
      doctor: newAppointment.doctor || '',
      date: newAppointment.date || new Date(),
      time: newAppointment.time || new Date(),
      location: newAppointment.location || '',
      notes: newAppointment.notes || '',
      reminder: newAppointment.reminder !== false,
    };

    setAppointments([...appointments, appointment].sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime() ||
      new Date(a.time).getTime() - new Date(b.time).getTime()
    ));
    
    setModalVisible(false);
    resetForm();
  };

  const resetForm = () => {
    setNewAppointment({
      title: '',
      doctor: '',
      date: new Date(),
      time: new Date(),
      location: '',
      notes: '',
      reminder: true,
    });
  };

  const deleteAppointment = (id: string) => {
    Alert.alert(
      'Delete Appointment',
      'Are you sure you want to delete this appointment?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setAppointments(appointments.filter(apt => apt.id !== id));
          },
        },
      ]
    );
  };

  const toggleReminder = (id: string) => {
    setAppointments(
      appointments.map(apt =>
        apt.id === id ? { ...apt, reminder: !apt.reminder } : apt
      )
    );
  };

  const renderAppointmentItem = ({ item }: { item: Appointment }) => {
    const appointmentDate = new Date(item.date);
    const today = new Date();
    const isPastAppointment = appointmentDate < today && appointmentDate.toDateString() !== today.toDateString();
    
    return (
      <View 
        style={[
          styles.appointmentItem, 
          { 
            backgroundColor: colors.card,
            borderLeftWidth: 4,
            borderLeftColor: isPastAppointment ? '#6B7280' : colors.primary,
          }
        ]}
      >
        <View style={styles.appointmentHeader}>
          <View>
            <Text style={[styles.appointmentTitle, { color: colors.primary }]}>{item.title}</Text>
            <Text style={[styles.appointmentDoctor, { color: colors.text }]}>{item.doctor}</Text>
          </View>
          <View style={styles.appointmentTimeContainer}>
            <Ionicons name="time" size={16} color={colors.textSecondary} />
            <Text style={[styles.appointmentTime, { color: colors.textSecondary }]}>
              {new Date(item.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Text>
          </View>
        </View>

        <View style={styles.appointmentDetails}>
          <View style={styles.detailRow}>
            <Ionicons name="calendar" size={16} color={colors.textSecondary} />
            <Text style={[styles.detailText, { color: colors.text }]}>
              {new Date(item.date).toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </Text>
          </View>
          
          {item.location && (
            <View style={styles.detailRow}>
              <Ionicons name="location" size={16} color={colors.textSecondary} />
              <Text style={[styles.detailText, { color: colors.text }]}>{item.location}</Text>
            </View>
          )}
          
          {item.notes && (
            <View style={styles.detailRow}>
              <Ionicons name="document-text" size={16} color={colors.textSecondary} />
              <Text style={[styles.detailText, { color: colors.text }]} numberOfLines={2}>
                {item.notes}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.appointmentActions}>
          <TouchableOpacity 
            onPress={() => toggleReminder(item.id)}
            style={[styles.actionButton, { backgroundColor: item.reminder ? colors.primary : '#E2E8F0' }]}
          >
            <Ionicons 
              name={item.reminder ? 'notifications' : 'notifications-off'} 
              size={20} 
              color={item.reminder ? 'white' : colors.text} 
            />
          </TouchableOpacity>
          
          <TouchableOpacity 
            onPress={() => deleteAppointment(item.id)}
            style={[styles.actionButton, { backgroundColor: '#FEE2E2' }]}
          >
            <Ionicons name="trash" size={20} color="#EF4444" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <CustomHeader 
        title="My Appointments" 
        onBack={() => navigation.goBack()} 
      />
      <View style={styles.content}>
        {appointments.length > 0 ? (
          <FlatList
            data={appointments}
            renderItem={renderAppointmentItem}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.listContainer}
          />
        ) : (
          <View style={styles.emptyContainer}>
            <Ionicons name="calendar" size={64} color={colors.primary} />
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              No appointments scheduled
            </Text>
            <Text style={[styles.emptySubtext, { color: colors.textSecondary }]}>
              Tap the + button to add a new appointment
            </Text>
          </View>
        )}
        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: colors.primary }]}
          onPress={() => setModalVisible(true)}
        >
          <Ionicons name="add" size={24} color="white" />
        </TouchableOpacity>
      </View>
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Add Appointment</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <TextInput
              style={[styles.input, { backgroundColor: colors.background, color: colors.text }]}
              placeholder="Appointment Title (e.g., Doctor's Visit)"
              placeholderTextColor={colors.textSecondary}
              value={newAppointment.title}
              onChangeText={text => setNewAppointment({ ...newAppointment, title: text })}
            />

            <TextInput
              style={[styles.input, { backgroundColor: colors.background, color: colors.text }]}
              placeholder="Doctor's Name"
              placeholderTextColor={colors.textSecondary}
              value={newAppointment.doctor}
              onChangeText={text => setNewAppointment({ ...newAppointment, doctor: text })}
            />

            <TouchableOpacity
              style={[styles.dateTimeButton, { backgroundColor: colors.background }]}
              onPress={() => setShowDatePicker(true)}
            >
              <Ionicons name="calendar" size={20} color={colors.primary} />
              <Text style={[styles.dateTimeButtonText, { color: colors.text }]}>
                {newAppointment.date ? 
                  new Date(newAppointment.date).toLocaleDateString('en-US', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })
                  : 'Select Date'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.dateTimeButton, { backgroundColor: colors.background }]}
              onPress={() => setShowTimePicker(true)}
            >
              <Ionicons name="time" size={20} color={colors.primary} />
              <Text style={[styles.dateTimeButtonText, { color: colors.text }]}>
                {newAppointment.time ? 
                  new Date(newAppointment.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                  : 'Select Time'}
              </Text>
            </TouchableOpacity>

            {showDatePicker && (
              <DateTimePicker
                value={newAppointment.date || new Date()}
                mode="date"
                display="default"
                onChange={(event, selectedDate) => {
                  setShowDatePicker(false);
                  if (selectedDate) {
                    setNewAppointment({ ...newAppointment, date: selectedDate });
                  }
                }}
                minimumDate={new Date()}
              />
            )}

            {showTimePicker && (
              <DateTimePicker
                value={newAppointment.time || new Date()}
                mode="time"
                display="default"
                onChange={(event, selectedTime) => {
                  setShowTimePicker(false);
                  if (selectedTime) {
                    setNewAppointment({ ...newAppointment, time: selectedTime });
                  }
                }}
              />
            )}

            <TextInput
              style={[styles.input, { backgroundColor: colors.background, color: colors.text }]}
              placeholder="Location (optional)"
              placeholderTextColor={colors.textSecondary}
              value={newAppointment.location}
              onChangeText={text => setNewAppointment({ ...newAppointment, location: text })}
            />

            <TextInput
              style={[
                styles.input,
                styles.multilineInput,
                { backgroundColor: colors.background, color: colors.text }
              ]}
              placeholder="Notes (optional)"
              placeholderTextColor={colors.textSecondary}
              value={newAppointment.notes}
              onChangeText={text => setNewAppointment({ ...newAppointment, notes: text })}
              multiline
              numberOfLines={3}
            />

            <View style={styles.reminderContainer}>
              <Text style={[styles.reminderText, { color: colors.text }]}>
                Set Reminder
              </Text>
              <TouchableOpacity
                onPress={() =>
                  setNewAppointment({
                    ...newAppointment,
                    reminder: !newAppointment.reminder,
                  })
                }
              >
                <View
                  style={[
                    styles.toggle,
                    {
                      backgroundColor: newAppointment.reminder
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
                          { translateX: newAppointment.reminder ? 20 : 0 },
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
              onPress={addAppointment}
            >
              <Text style={styles.saveButtonText}>Save Appointment</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    flex: 1,
    marginLeft: -24, // To center the title by offsetting the back button
  },
  headerRight: {
    width: 40, // Same as back button for balance
  },
  listContainer: {
    padding: 16,
  },
  appointmentItem: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  appointmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  appointmentTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  appointmentDoctor: {
    fontSize: 16,
    color: '#4B5563',
  },
  appointmentTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  appointmentTime: {
    marginLeft: 4,
    fontSize: 14,
  },
  appointmentDetails: {
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailText: {
    marginLeft: 8,
    fontSize: 14,
    flex: 1,
  },
  appointmentActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
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
    maxHeight: '90%',
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
  dateTimeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 16,
  },
  dateTimeButtonText: {
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

export default AppointmentScreen;
