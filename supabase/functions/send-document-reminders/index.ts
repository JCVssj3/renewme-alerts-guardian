import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface Document {
  id: string;
  name: string;
  type: string;
  expiry_date: string;
  reminder_period: string;
  user_id: string;
  full_name: string;
}

interface UserToken {
  user_id: string;
  token: string;
  device_type: string;
  is_active: boolean;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    console.log('Starting document reminder check...');

    // Get documents that need reminders today
    const { data: documents, error: documentsError } = await supabaseClient
      .from('documents_needing_reminders')
      .select('*');

    if (documentsError) {
      console.error('Error fetching documents:', documentsError);
      throw documentsError;
    }

    console.log(`Found ${documents?.length || 0} documents needing reminders`);

    if (!documents || documents.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'No documents need reminders today',
          count: 0 
        }), 
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      );
    }

    // Get unique user IDs
    const userIds = [...new Set(documents.map(doc => doc.user_id))];

    // Get FCM tokens for these users
    const { data: tokens, error: tokensError } = await supabaseClient
      .from('user_tokens')
      .select('user_id, token, device_type, is_active')
      .in('user_id', userIds)
      .eq('is_active', true);

    if (tokensError) {
      console.error('Error fetching user tokens:', tokensError);
      throw tokensError;
    }

    console.log(`Found ${tokens?.length || 0} active tokens`);

    if (!tokens || tokens.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'No active FCM tokens found for users',
          documentsFound: documents.length,
          tokensFound: 0
        }), 
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      );
    }

    // Group documents by user
    const documentsByUser = documents.reduce((acc, doc) => {
      if (!acc[doc.user_id]) {
        acc[doc.user_id] = [];
      }
      acc[doc.user_id].push(doc);
      return acc;
    }, {} as Record<string, Document[]>);

    const firebaseServerKey = Deno.env.get('FIREBASE_SERVER_KEY');
    if (!firebaseServerKey) {
      throw new Error('Firebase server key not configured');
    }

    let successCount = 0;
    let errorCount = 0;
    const invalidTokens: string[] = [];

    // Send notifications to each user
    for (const token of tokens) {
      const userDocuments = documentsByUser[token.user_id];
      if (!userDocuments || userDocuments.length === 0) continue;

      try {
        // Calculate urgency based on expiry date
        const now = new Date();
        const urgentDocs = userDocuments.filter(doc => {
          const expiryDate = new Date(doc.expiry_date);
          const diffTime = expiryDate.getTime() - now.getTime();
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          return diffDays <= 3;
        });

        const isUrgent = urgentDocs.length > 0;
        const docCount = userDocuments.length;
        const docNames = userDocuments.map(doc => doc.name).join(', ');

        const title = isUrgent 
          ? '🚨 URGENT: Documents Expiring Soon!'
          : '📋 Document Renewal Reminder';

        const body = docCount === 1
          ? `Your ${userDocuments[0].name} needs attention. Don't forget to renew it!`
          : `You have ${docCount} documents that need attention: ${docNames}`;

        // Send FCM notification
        const fcmResponse = await fetch('https://fcm.googleapis.com/fcm/send', {
          method: 'POST',
          headers: {
            'Authorization': `key=${firebaseServerKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            to: token.token,
            notification: {
              title: title,
              body: body,
              icon: 'ic_notification',
              color: isUrgent ? '#ef4444' : '#3b82f6',
            },
            data: {
              type: 'document_reminder',
              documentCount: docCount.toString(),
              urgent: isUrgent.toString(),
              documentIds: userDocuments.map(doc => doc.id).join(','),
            },
            priority: isUrgent ? 'high' : 'normal',
          }),
        });

        const fcmResult = await fcmResponse.json();

        if (fcmResult.success === 1) {
          successCount++;
          console.log(`Notification sent successfully to user ${token.user_id}`);
        } else {
          errorCount++;
          console.error(`FCM error for user ${token.user_id}:`, fcmResult);
          
          // Check if token is invalid
          if (fcmResult.results?.[0]?.error === 'InvalidRegistration' || 
              fcmResult.results?.[0]?.error === 'NotRegistered') {
            invalidTokens.push(token.token);
          }
        }

      } catch (error) {
        errorCount++;
        console.error(`Error sending notification to user ${token.user_id}:`, error);
      }
    }

    // Mark invalid tokens as inactive
    if (invalidTokens.length > 0) {
      const { error: updateError } = await supabaseClient
        .from('user_tokens')
        .update({ is_active: false })
        .in('token', invalidTokens);

      if (updateError) {
        console.error('Error marking invalid tokens:', updateError);
      } else {
        console.log(`Marked ${invalidTokens.length} invalid tokens as inactive`);
      }
    }

    const result = {
      success: true,
      message: 'Document reminders processed',
      documentsFound: documents.length,
      tokensFound: tokens.length,
      notificationsSent: successCount,
      errors: errorCount,
      invalidTokensRemoved: invalidTokens.length,
    };

    console.log('Reminder processing complete:', result);

    return new Response(
      JSON.stringify(result), 
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Error in send-document-reminders function:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }), 
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});