import { supabase } from '../lib/supabase';

export interface CreateListData {
  name: string;
  market_name?: string | null;
  user_id: string;
  household_id?: string | null;
}

export const listService = {
  async createList({ name, market_name, user_id, household_id }: CreateListData) {
    console.log("[CREATE_LIST] Iniciando criação com:", { name, market_name, user_id, household_id });
    try {
      const { data, error } = await supabase
        .from('shopping_lists')
        .insert({
          name,
          market_name,
          user_id,
          household_id,
          status: 'active',
          estimated_total: 0,
          real_total: 0
        })
        .select()
        .single();
      
      if (error) {
        console.error("[CREATE_LIST] Erro do Supabase:", error);
        throw error;
      }
      
      console.log("[CREATE_LIST] Lista criada com sucesso:", data);
      return { data, error: null };
    } catch (error: any) {
      console.error("[CREATE_LIST] Exceção capturada:", error);
      return { data: null, error };
    }
  },

  async deleteList(id: string) {
    try {
      const { error } = await supabase
        .from('shopping_lists')
        .delete()
        .eq('id', id);
      
      return { error };
    } catch (error: any) {
      return { error };
    }
  },

  async getActiveLists(userId: string) {
    try {
      const { data, error } = await supabase
        .from('shopping_lists')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'active')
        .order('created_at', { ascending: false });
      
      return { data, error };
    } catch (error: any) {
      return { data: null, error };
    }
  }
};
