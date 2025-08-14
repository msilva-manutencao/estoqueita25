// Configurações para evitar conflitos com antivírus e Attribution Reporting API
export const initializeApp = () => {
  // Desabilita Attribution Reporting API se existir
  if (typeof window !== 'undefined') {
    // Remove qualquer referência ao Attribution Reporting
    (window as any).AttributionReporting = undefined;
    
    // Desabilita funcionalidades que podem causar conflito com antivírus
    if ('navigator' in window && 'permissions' in navigator) {
      // Silenciosamente ignora erros de permissão
      const originalQuery = navigator.permissions.query;
      navigator.permissions.query = async (descriptor: any) => {
        try {
          return await originalQuery.call(navigator.permissions, descriptor);
        } catch (error) {
          // Ignora erros relacionados a Attribution Reporting
          if (error instanceof Error && error.message.includes('attribution-reporting')) {
            return { state: 'denied' } as PermissionStatus;
          }
          throw error;
        }
      };
    }
  }
};