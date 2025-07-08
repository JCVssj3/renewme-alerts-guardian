
import { supabase } from '@/integrations/supabase/client';
import { User, Session } from '@supabase/supabase-js';

export interface SignUpData {
  fullName: string;
  email: string;
  password: string;
}

export interface SignInData {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export class AuthService {
  static async signUp(data: SignUpData) {
    try {
      const { error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            full_name: data.fullName
          }
        }
      });

      if (error) throw error;
      
      return { success: true, message: 'Check your email for a confirmation link!' };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  static async signIn(data: SignInData) {
    try {
      const { data: authData, error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password
      });

      if (error) throw error;

      // Update last login
      if (authData.user) {
        await supabase.rpc('update_last_login', { user_id: authData.user.id });
      }

      // Handle "Remember Me" functionality - persist session until explicitly signed out
      if (data.rememberMe) {
        localStorage.setItem('rememberMe', 'true');
        // Supabase automatically handles persistent sessions - no expiry needed
        // Session will persist until explicitly signed out
      } else {
        localStorage.removeItem('rememberMe');
      }

      return { success: true, user: authData.user, session: authData.session };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  static async signOut() {
    try {
      localStorage.removeItem('rememberMe');
      const { error } = await supabase.auth.signOut();
      
      if (error) throw error;
      
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  static async getCurrentUser() {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      
      if (error) throw error;
      
      return user;
    } catch (error: any) {
      console.error('Error getting current user:', error);
      return null;
    }
  }

  static async getUserProfile(userId: string) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      
      return data;
    } catch (error: any) {
      console.error('Error getting user profile:', error);
      return null;
    }
  }
}
