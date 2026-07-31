import api from "@/lib/axios";

export type LeadSource = "google_maps" | "linkedin_company" | "linkedin_people";
export type LeadType = "business" | "person";

export interface Lead {
  id: string;
  source: LeadSource;
  type: LeadType;
  name: string;
  company: string | null;
  title: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  address: string | null;
  category: string | null;
  rating: number | null;
  linkedin_url: string | null;
  created_at: string;
}

export interface SearchLeadsRequest {
  source: LeadSource;
  keyword?: string;
  location?: string;
  job_title?: string;
  company_urls?: string[];
  max_items?: number;
}

export const lunaApi = {
  search: async (data: SearchLeadsRequest): Promise<Lead[]> => {
    const res = await api.post<{ data: Lead[] }>("/v1/luna/search", data);
    return res.data.data;
  },

  listLeads: async (source?: LeadSource): Promise<Lead[]> => {
    const res = await api.get<{ data: Lead[] }>("/v1/luna/leads", {
      params: source ? { source } : undefined,
    });
    return res.data.data;
  },

  deleteLead: async (id: string): Promise<void> => {
    await api.delete(`/v1/luna/leads/${id}`);
  },

  exportLeads: async (): Promise<Blob> => {
    const res = await api.get("/v1/luna/leads/export", { responseType: "blob" });
    return res.data;
  },
};
