import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { SMTPClient } from "https://deno.land/x/denomailer@1.6.0/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface DemoRequestEmailData {
  recipientEmail: string;
  itemName: string;
  itemType: "Template" | "Consultant";
  userEmail: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { recipientEmail, itemName, itemType, userEmail }: DemoRequestEmailData = await req.json();

    console.log("Sending demo request email:", { recipientEmail, itemName, itemType, userEmail });

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
      to: recipientEmail,
      subject: `New Demo Request for ${itemName}`,
      content: `
        <h2>New Demo Request</h2>
        <p>A user requested a demo.</p>
        <p><strong>Item:</strong> ${itemName} (${itemType})</p>
        <p><strong>User Email:</strong> ${userEmail}</p>
        <p><strong>Message:</strong> User wants a demo.</p>
      `,
      html: `
        <h2>New Demo Request</h2>
        <p>A user requested a demo.</p>
        <p><strong>Item:</strong> ${itemName} (${itemType})</p>
        <p><strong>User Email:</strong> ${userEmail}</p>
        <p><strong>Message:</strong> User wants a demo.</p>
      `,
    });

    await client.close();

    console.log("Email sent successfully via Gmail SMTP");

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error sending demo request email:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
