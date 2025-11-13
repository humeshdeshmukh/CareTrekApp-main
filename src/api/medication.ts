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
  user_id: string;
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

export const addMedication = async (medication: Omit<Medication, 'id' | 'created_at' | 'updated_at'> & { user_id: string }): Promise<{ data: Medication | null; error: Error | null }> => {
  try {
    const { data, error } = await supabase
      .from('medications')
      .insert(medication)
      .select()
      .single();

    if (error) throw error;
    if (!data) {
      // If no data is returned, try to fetch the newly inserted medication
      const { data: newData, error: fetchError } = await supabase
        .from('medications')
        .select('*')
        .eq('name', medication.name)
        .eq('user_id', medication.user_id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
      
      if (fetchError) throw fetchError;
      return { data: newData, error: null };
    }
    return { data, error: null };
  } catch (error) {
    console.error('Error adding medication:', error);
    return { data: null, error: error as Error };
  }
};

export const updateMedication = async (id: string, updates: Partial<Medication>): Promise<{ data: Medication | null; error: Error | null }> => {
  try {
    // First, update the medication
    const { error: updateError } = await supabase
      .from('medications')
      .update(updates)
      .eq('id', id);

    if (updateError) throw updateError;

    // Then fetch the updated medication
    const { data, error: fetchError } = await supabase
      .from('medications')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError) throw fetchError;
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
