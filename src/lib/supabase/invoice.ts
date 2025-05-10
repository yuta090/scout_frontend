import { supabase } from './client';
import type { Invoice, InvoiceStatus } from '../types';

interface FetchInvoicesOptions {
  agency_id?: string;
  customer_id?: string;
  limit?: number;
  page?: number;
  status?: InvoiceStatus;
}

export const fetchInvoices = async ({
  agency_id,
  customer_id,
  limit = 10,
  page = 1,
  status
}: FetchInvoicesOptions) => {
  try {
    const offset = (page - 1) * limit;

    let query = supabase
      .from('invoices')
      .select(`
        *,
        customer:customers(id, company_name, contact_name, email),
        campaign:campaigns(id, title)
      `)
      .order('issue_date', { ascending: false });

    if (agency_id) {
      query = query.eq('agency_id', agency_id);
    }

    if (customer_id) {
      query = query.eq('customer_id', customer_id);
    }

    if (status) {
      query = query.eq('status', status);
    }

    const countQuery = query.count();
    const dataQuery = query.range(offset, offset + limit - 1);

    const [{ count }, { data, error }] = await Promise.all([
      countQuery,
      dataQuery
    ]);

    if (error) throw error;

    return { data, count, error: null };
  } catch (error) {
    console.error('Error fetching invoices:', error);
    return { data: null, count: 0, error };
  }
};

export const fetchInvoiceById = async (id: string) => {
  try {
    const { data, error } = await supabase
      .from('invoices')
      .select(`
        *,
        customer:customers(id, company_name, contact_name, email, address, phone),
        campaign:campaigns(id, title, description),
        agency:agencies(id, company_name, address, phone, email, logo_url)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;

    return { data, error: null };
  } catch (error) {
    console.error('Error fetching invoice:', error);
    return { data: null, error };
  }
};

export const createInvoice = async (invoice: Omit<Invoice, 'id' | 'created_at' | 'updated_at'>) => {
  try {
    const { data, error } = await supabase
      .from('invoices')
      .insert(invoice)
      .select()
      .single();

    if (error) throw error;

    return { data, error: null };
  } catch (error) {
    console.error('Error creating invoice:', error);
    return { data: null, error };
  }
};

export const updateInvoice = async (id: string, updates: Partial<Invoice>) => {
  try {
    const { data, error } = await supabase
      .from('invoices')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return { data, error: null };
  } catch (error) {
    console.error('Error updating invoice:', error);
    return { data: null, error };
  }
};

export const updateInvoiceStatus = async (id: string, status: InvoiceStatus, payment_date?: string) => {
  try {
    const updates: any = { 
      status, 
      updated_at: new Date().toISOString() 
    };
    
    if (status === 'paid' && payment_date) {
      updates.payment_date = payment_date;
    }

    const { data, error } = await supabase
      .from('invoices')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return { data, error: null };
  } catch (error) {
    console.error('Error updating invoice status:', error);
    return { data: null, error };
  }
};

export const deleteInvoice = async (id: string) => {
  try {
    const { error } = await supabase
      .from('invoices')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return { error: null };
  } catch (error) {
    console.error('Error deleting invoice:', error);
    return { error };
  }
};

export const getInvoiceStats = async (agency_id?: string, customer_id?: string) => {
  try {
    let query = supabase
      .from('invoices')
      .select('status', { count: 'exact' });

    if (agency_id) {
      query = query.eq('agency_id', agency_id);
    }

    if (customer_id) {
      query = query.eq('customer_id', customer_id);
    }

    const { count: total } = await query;
    const { count: pending } = await query.eq('status', 'pending');
    const { count: paid } = await query.eq('status', 'paid');
    const { count: overdue } = await query.eq('status', 'overdue');

    return {
      total: total || 0,
      pending: pending || 0,
      paid: paid || 0,
      overdue: overdue || 0,
      error: null
    };
  } catch (error) {
    console.error('Error fetching invoice stats:', error);
    return {
      total: 0,
      pending: 0,
      paid: 0,
      overdue: 0,
      error
    };
  }
};

/**
 * キャンペーンから請求書を生成する関数
 * @param campaignId キャンペーンID
 * @param dueDate 支払期限
 * @param notes 備考
 * @returns 生成された請求書
 */
export const generateInvoiceFromCampaign = async (
  campaignId: string,
  dueDate: string,
  notes?: string
) => {
  try {
    // キャンペーン情報を取得
    const { data: campaign, error: campaignError } = await supabase
      .from('campaigns')
      .select(`
        id,
        title,
        customer_id,
        agency_id,
        total_amount
      `)
      .eq('id', campaignId)
      .single();

    if (campaignError) {
      throw campaignError;
    }

    if (!campaign) {
      throw new Error('キャンペーンが見つかりません');
    }

    // 請求書番号を生成 (現在日時 + ID下4桁)
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const campaignIdSuffix = campaign.id.slice(-4);
    const invoiceNumber = `INV-${year}${month}${day}-${campaignIdSuffix}`;

    // 請求書を作成
    const invoiceData = {
      campaign_id: campaign.id,
      customer_id: campaign.customer_id,
      agency_id: campaign.agency_id,
      invoice_number: invoiceNumber,
      issue_date: now.toISOString().split('T')[0], // YYYY-MM-DD形式
      due_date: dueDate,
      amount: campaign.total_amount,
      status: 'pending' as const,
      notes: notes || `キャンペーン「${campaign.title}」の請求書`
    };

    const { data, error } = await supabase
      .from('invoices')
      .insert([invoiceData])
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data as Invoice;
  } catch (error) {
    console.error('請求書の生成に失敗しました:', error);
    throw error;
  }
}; 