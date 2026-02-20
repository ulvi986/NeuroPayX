import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { SMTPClient } from "https://deno.land/x/denomailer@1.6.0/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EmailData {
  consultantEmail: string;
  consultantName: string;
  senderName: string;
  senderEmail: string;
  message: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { consultantEmail, consultantName, senderName, senderEmail, message }: EmailData = await req.json();

    console.log("Sending consultant email:", { consultantEmail, consultantName, senderName, senderEmail });

    const client = new SMTPClient({
      connection: {
        hostname: "smtp.gmail.com",
        port: 465,
        tls: true,
        auth: {
          username: "u.sharifzade@gmail.com",
          password: Deno.env.get("GMAIL_APP_PASSWORD")!,
        },
      },
    });

    await client.send({
      from: "NeuroPayX <u.sharifzade@gmail.com>",
      to: consultantEmail,
      subject: `Yeni mesaj: ${senderName} sizə yazdı`,
      content: `Salam ${consultantName},\n\n${senderName} (${senderEmail}) sizə mesaj göndərdi:\n\n${message}\n\nCavab vermək üçün birbaşa ${senderEmail} ünvanına yazın.`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Yeni mesaj</h2>
          <p>Salam <strong>${consultantName}</strong>,</p>
          <p><strong>${senderName}</strong> (${senderEmail}) sizə mesaj göndərdi:</p>
          <div style="background: #f5f5f5; padding: 16px; border-radius: 8px; margin: 16px 0;">
            <p style="margin: 0; white-space: pre-wrap;">${message}</p>
          </div>
          <p>Cavab vermək üçün birbaşa <a href="mailto:${senderEmail}">${senderEmail}</a> ünvanına yazın.</p>
          <hr style="margin-top: 24px; border: none; border-top: 1px solid #eee;" />
          <p style="color: #999; font-size: 12px;">Bu mesaj NeuroPayX platforması vasitəsilə göndərilib.</p>
        </div>
      `,
    });

    await client.close();

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error sending consultant email:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
