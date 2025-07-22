import { useState } from 'react';
import axiosInstance from '../utils/axiosConfig';
import { toast } from 'sonner';

interface ApiOptions {
  showSuccessToast?: boolean;
  showErrorToast?: boolean;
  successMessage?: string;
  errorMessage?: string;
}

export function useApi() {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const defaultOptions: ApiOptions = {
    showSuccessToast: false,
    showErrorToast: true,
    successMessage: 'Opération réussie',
    errorMessage: 'Une erreur est survenue'
  };

  const request = async <T>(
    method: 'get' | 'post' | 'put' | 'delete',
    url: string,
    data?: any,
    options?: ApiOptions
  ): Promise<T> => {
    const opts = { ...defaultOptions, ...options };
    setLoading(true);
    setError(null);

    try {
      let response;

      switch (method) {
        case 'get':
          response = await axiosInstance.get<T>(url);
          break;
        case 'post':
          response = await axiosInstance.post<T>(url, data);
          break;
        case 'put':
          response = await axiosInstance.put<T>(url, data);
          break;
        case 'delete':
          response = await axiosInstance.delete<T>(url);
          break;
      }

      if (opts.showSuccessToast) {
        toast.success(opts.successMessage);
      }

      return response.data;
    } catch (err) {
      let errorMessage = opts.errorMessage;
      
      if (err instanceof Error) {
        setError(err);
        errorMessage = err.message;
      }
      
      if (opts.showErrorToast) {
        toast.error(errorMessage);
      }
      
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    get: <T>(url: string, options?: ApiOptions) => 
      request<T>('get', url, undefined, options),
    post: <T>(url: string, data?: any, options?: ApiOptions) => 
      request<T>('post', url, data, options),
    put: <T>(url: string, data?: any, options?: ApiOptions) => 
      request<T>('put', url, data, options),
    delete: <T>(url: string, options?: ApiOptions) => 
      request<T>('delete', url, undefined, options)
  };
}