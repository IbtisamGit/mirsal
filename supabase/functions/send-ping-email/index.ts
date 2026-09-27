import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { Resend } from 'https://esm.sh/resend@1.0.0'

const resend = new Resend(Deno.env.get('RESEND_API_KEY'))

serve(async (req) => {
  try {
    const { roomId, childName } = await req.json()

    // Initialize Supabase client with Service Role to access auth.users
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // 1. Get room owner
    const { data: room, error: roomError } = await supabaseAdmin
      .from('rooms')
      .select('owner_id')
      .eq('id', roomId)
      .single()

    if (roomError) throw roomError

    // 2. Get owner's email from auth.users
    const { data: { user }, error: userError } = await supabaseAdmin.auth.admin.getUserById(room.owner_id)
    
    if (userError || !user?.email) {
      throw new Error("Owner email not found")
    }

    // 3. Send Email via Resend
    const data = await resend.emails.send({
      from: 'Mirsal Family <noreply@mirsal.app>',
      to: [user.email],
      subject: `🔔 نداء سريع من ${childName}!`,
      html: `
        <div dir="rtl" style="font-family: sans-serif; text-align: center; padding: 20px;">
          <h2>مرحباً! 👋</h2>
          <p>لقد قام <strong>${childName}</strong> بإرسال نداء سريع لك للتو من تطبيق مرسال.</p>
          <div style="font-size: 50px; margin: 20px 0;">🔔</div>
          <p>افتح التطبيق الآن للاطمئنان والتواصل!</p>
        </div>
      `
    })

    return new Response(
      JSON.stringify({ success: true, data }),
      { headers: { "Content-Type": "application/json" } },
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { "Content-Type": "application/json" } },
    )
  }
})
