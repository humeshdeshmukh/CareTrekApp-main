import { supabase } from '../supabaseConfig';

export type Medication = {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  instructions?: string;
  time: string;
  reminder: boolean;
  start_date: string;
  end_date?: string;
  created_at?: string;
  updated_at?: string;
};

export const getMedications = async (): Promise<{ data: Medication[] | null; error: Error | null }> => {
  try {
    const { data, error } = await supabase
      .from('medications')
      .select('*')
      .order('time', { ascending: true });

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error fetching medications:', error);
    return { data: null, error: error as Error };
  }
};

export const addMedication = async (medication: Omit<Medication, 'id' | 'created_at' | 'updated_at'>): Promise<{ data: Medication | null; error: Error | null }> => {
  try {
    const { data, error } = await supabase
      .from('medications')
      .insert(medication)
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error adding medication:', error);
    return { data: null, error: error as Error };
  }
};

export const updateMedication = async (id: string, updates: Partial<Medication>): Promise<{ data: Medication | null; error: Error | null }> => {
  try {
    const { data, error } = await supabase
      .from('medications')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error updating medication:', error);
    return { data: null, error: error as Error };
  }
};

export const deleteMedication = async (id: string): Promise<{ error: Error | null }> => {
  try {
    const { error } = await supabase
      .from('medications')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return { error: null };
  } catch (error) {
    console.error('Error deleting medication:', error);
    return { error: error as Error };
  }
};

export const toggleMedicationReminder = async (id: string, currentReminder: boolean): Promise<{ error: Error | null }> => {
  try {
    const { error } = await supabase
      .from('medications')
      .update({ reminder: !currentReminder })
      .eq('id', id);

    if (error) throw error;
    return { error: null };
  } catch (error) {
    console.error('Error toggling medication reminder:', error);
    return { error: error as Error };
  }
};
