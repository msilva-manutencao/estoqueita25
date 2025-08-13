import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { Company } from './useCompanies';

interface CurrentCompanyContextType {
  currentCompany: Company | null;
  setCurrentCompany: (company: Company | null) => void;
  userPermission: 'read' | 'write' | 'admin' | 'owner' | null;
  setUserPermission: (permission: 'read' | 'write' | 'admin' | 'owner' | null) => void;
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

  useEffect(() => {
    if (currentCompany) {
      localStorage.setItem('currentCompany', JSON.stringify(currentCompany));
      localStorage.setItem('userPermission', userPermission || '');
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

  const value = {
    currentCompany,
    setCurrentCompany,
    userPermission,
    setUserPermission,
  };

  return (
    <CurrentCompanyContext.Provider value={value}>
      {children}
    </CurrentCompanyContext.Provider>
  );
};