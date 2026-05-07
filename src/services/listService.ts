import { supabase } from '../lib/supabase';

export interface CreateListData {
  name: string;
  market_name?: string | null;
  user_id: string;
  household_id?: string | null;
}

export const listService = {
  async createList({ name, market_name, user_id }: CreateListData) {
    console.log("[CREATE_LIST] Iniciando criação com payload mínimo:", { name, market_name, user_id });
    
    if (!user_id) {
      console.error("[CREATE_LIST] Erro: user_id ausente");
      return { data: null, error: { message: "Usuário não autenticado" } };
    }

    try {
      const { data, error } = await supabase
        .from('shopping_lists')
        .insert({
          name,
          market_name: market_name || null,
          user_id,
          status: 'active',
          estimated_total: 0,
          real_total: 0
        })
        .select('*')
        .single();
      
      if (error) {
        console.error("[CREATE_LIST_SUPABASE_ERROR]", {
          message: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint
        });
        throw error;
      }
      
      console.log("[CREATE_LIST] Sucesso:", data);
      return { data, error: null };
    } catch (error: any) {
      console.error("[CREATE_LIST_EXCEPTION]", error);
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
