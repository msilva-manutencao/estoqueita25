import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { Company } from './useCompanies';

interface CurrentCompanyContextType {
  currentCompany: Company | null;
  setCurrentCompany: (company: Company | null) => void;
  userPermission: 'read' | 'write' | 'admin' | 'owner' | null;
  setUserPermission: (permission: 'read' | 'write' | 'admin' | 'owner' | null) => void;
  clearCompanyData: () => void;
  companyChangeTimestamp: number;
}

const CurrentCompanyContext = createContext<CurrentCompanyContextType | undefined>(undefined);

export const useCurrentCompany = () => {
  const context = useContext(CurrentCompanyContext);
  if (!context) {
    throw new Error('useCurrentCompany must be used within a CurrentCompanyProvider');
  }
  return context;
};

interface CurrentCompanyProviderProps {
  children: ReactNode;
}

export const CurrentCompanyProvider = ({ children }: CurrentCompanyProviderProps) => {
  const [currentCompany, setCurrentCompany] = useState<Company | null>(null);
  const [userPermission, setUserPermission] = useState<'read' | 'write' | 'admin' | 'owner' | null>(null);
  const [companyChangeTimestamp, setCompanyChangeTimestamp] = useState<number>(Date.now());

  useEffect(() => {
    if (currentCompany) {
      localStorage.setItem('currentCompany', JSON.stringify(currentCompany));
      localStorage.setItem('userPermission', userPermission || '');
      setCompanyChangeTimestamp(Date.now()); // Atualizar timestamp quando empresa muda
    }
  }, [currentCompany, userPermission]);

  useEffect(() => {
    const savedCompany = localStorage.getItem('currentCompany');
    const savedPermission = localStorage.getItem('userPermission');
    
    if (savedCompany) {
      try {
        setCurrentCompany(JSON.parse(savedCompany));
        setUserPermission(savedPermission as any);
      } catch (error) {
        console.error('Erro ao carregar empresa do localStorage:', error);
      }
    }
  }, []);

  const clearCompanyData = () => {
    setCurrentCompany(null);
    setUserPermission(null);
    localStorage.removeItem('currentCompany');
    localStorage.removeItem('userPermission');
    setCompanyChangeTimestamp(Date.now());
  };

  const value = {
    currentCompany,
    setCurrentCompany,
    userPermission,
    setUserPermission,
    clearCompanyData,
    companyChangeTimestamp,
  };

  return (
    <CurrentCompanyContext.Provider value={value}>
      {children}
    </CurrentCompanyContext.Provider>
  );
};