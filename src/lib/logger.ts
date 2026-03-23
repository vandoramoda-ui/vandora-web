import { supabase } from './supabase';

export type LogLevel = 'info' | 'warn' | 'error';

interface LogOptions {
  level?: LogLevel;
  source?: string;
  metadata?: any;
  status_code?: number;
}

/**
 * Centralized logger for Vandora.
 * Persists logs to Supabase for visibility in the Admin Panel.
 */
export const logger = {
  info: (message: string, options?: Omit<LogOptions, 'level'>) => 
    log('Info', message, { ...options, level: 'info' }),
    
  warn: (message: string, options?: Omit<LogOptions, 'level'>) => 
    log('Warning', message, { ...options, level: 'warn' }),
    
  error: (message: string, error?: any, options?: Omit<LogOptions, 'level'>) => {
    const errorMessage = error instanceof Error ? error.message : (typeof error === 'string' ? error : JSON.stringify(error));
    const fullMessage = message + (errorMessage ? `: ${errorMessage}` : '');
    const metadata = error instanceof Error ? { stack: error.stack, ...options?.metadata } : (options?.metadata || error);
    
    return log('Error', fullMessage, { ...options, level: 'error', metadata });
  },

  /**
   * Specifically for tracking API/Network errors
   */
  networkError: (message: string, status: number, endpoint: string) => {
    return log('Network Error', message, { 
      level: 'error', 
      status_code: status, 
      metadata: { endpoint } 
    });
  }
};

async function log(eventName: string, message: string, options: LogOptions) {
  const { level = 'info', source = 'frontend', metadata, status_code } = options;
  
  // Console logging (always)
  const consoleMethod = level === 'error' ? 'error' : level === 'warn' ? 'warn' : 'log';
  console[consoleMethod](`[${source.toUpperCase()}] ${eventName}: ${message}`, metadata || '');

  try {
    // Persist to Supabase
    // We use 'analytics_logs' as it is already being polled by the Admin Page
    const { error } = await supabase.from('analytics_logs').insert([{
      event_name: `${eventName} (${source})`,
      message: message,
      error_message: level === 'error' ? message : null,
      status_code: status_code || (level === 'error' ? 500 : 200),
      metadata: metadata ? JSON.stringify(metadata) : null,
      url: window.location.href,
      created_at: new Date().toISOString()
    }]);

    if (error) {
      // Fallback for global_logs if analytics_logs is strictly for CAPI
      try {
        await supabase.from('global_logs').insert([{
          event_name: eventName,
          message: message,
          status: level,
          source: source,
          details: metadata ? JSON.stringify(metadata) : null,
        }]);
      } catch (e) {
        // Ignore fallback errors
      }
    }
  } catch (err) {
    // Last resort console fallback
    console.debug('Failed to persist log to Supabase', err);
  }
}
