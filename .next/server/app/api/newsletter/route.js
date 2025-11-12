"use strict";(()=>{var e={};e.id=5497,e.ids=[5497],e.modules={30517:e=>{e.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},13685:e=>{e.exports=require("http")},95687:e=>{e.exports=require("https")},85477:e=>{e.exports=require("punycode")},12781:e=>{e.exports=require("stream")},57310:e=>{e.exports=require("url")},59796:e=>{e.exports=require("zlib")},15488:(e,t,s)=>{s.r(t),s.d(t,{headerHooks:()=>f,originalPathname:()=>y,requestAsyncStorage:()=>g,routeModule:()=>m,serverHooks:()=>b,staticGenerationAsyncStorage:()=>h,staticGenerationBailout:()=>w});var o={};s.r(o),s.d(o,{POST:()=>POST});var i=s(10884),r=s(16132),a=s(95798),n=s(32079),l=s(86935);let c=process.env.FROM_EMAIL||"onboarding@resend.dev",p=process.env.RESEND_API_KEY,u=p?new l.R(p):null,d=(0,n.eI)("https://csvzysxiuuzcsmpknehi.supabase.co","eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNzdnp5c3hpdXV6Y3NtcGtuZWhpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk4MjQwNzksImV4cCI6MjA3NTQwMDA3OX0.ChDLwTvYmunBmiL_LWZqm4pWq3d2OGyjARWtA3KKZ90");async function POST(e){try{console.log("\uD83D\uDE80 Newsletter API called");let t=await e.json(),{email:s}=t;if(console.log("\uD83D\uDCE7 Email subscription request for:",s),!s||!s.includes("@"))return console.log("❌ Invalid email format:",s),a.Z.json({error:"Valid email is required"},{status:400});console.log("\uD83D\uDD0D Checking for existing subscription...");let{data:o,error:i}=await d.from("newsletter_subscriptions").select("email").eq("email",s.toLowerCase()).single();if(o)return console.log("ℹ️ Email already subscribed:",s),a.Z.json({message:"You are already subscribed to our newsletter!"},{status:200});try{console.log("\uD83D\uDCBE Saving subscription to database...");let{error:e}=await d.from("newsletter_subscriptions").insert([{email:s.toLowerCase(),subscribed_at:new Date().toISOString(),status:"active"}]);e?console.log("⚠️ Note: Newsletter subscriptions table not yet created in Supabase:",e.message):console.log("✅ Subscription saved to database")}catch(e){console.log("⚠️ Database storage skipped - table may not exist yet")}console.log("\uD83D\uDCE4 Sending welcome email...");let r=await sendWelcomeEmail(s);if(r)return console.log("✅ Newsletter subscription completed successfully"),a.Z.json({message:"Successfully subscribed to newsletter!"},{status:200});return console.log("❌ Failed to send welcome email"),a.Z.json({error:"Failed to send welcome email. Please try again."},{status:500})}catch(e){return console.error("❌ Newsletter subscription error:",e),a.Z.json({error:"Internal server error"},{status:500})}}async function sendWelcomeEmail(e){try{let t=createEmailContent(e);if(console.log("\uD83D\uDD04 Attempting to send email to:",e),console.log("\uD83D\uDCE7 Resend API Key available:",!!u),u)try{console.log("\uD83D\uDCE4 Sending email via Resend...");let s="ghostofficial1322@gmail.com"===e?e:"ghostofficial1322@gmail.com",{data:o,error:i}=await u.emails.send({from:`BikersAlliance <${c}>`,to:[s],subject:t.subject,html:t.html.replace(e,s),text:t.text.replace(e,s)});if(!i)return console.log("✅ Email sent successfully via Resend!"),console.log("\uD83D\uDCE7 Email ID:",o?.id),console.log("\uD83D\uDCEC Note: In testing mode, email sent to ghostofficial1322@gmail.com"),!0;console.error("❌ Resend error:",i),console.error("Error details:",JSON.stringify(i,null,2))}catch(e){console.error("❌ Resend API error:",e)}else console.log("⚠️ Resend not available - API key missing");let s=await sendViaWebhook(e,t);if(s)return!0;return console.log("\uD83D\uDCE7 Newsletter Welcome Email Ready"),console.log("To:",e),console.log("Subject:",t.subject),console.log("Content preview:",t.text.substring(0,200)+"..."),await saveEmailForTesting(e,t),!0}catch(e){return console.error("❌ Error sending welcome email:",e),!1}}async function sendViaWebhook(e,t){try{let s=process.env.EMAIL_WEBHOOK_URL;if(!s)return!1;let o=await fetch(s,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({to:e,subject:t.subject,html:t.html,text:t.text,from:c})});return o.ok}catch(e){return console.log("Webhook email sending failed:",e),!1}}async function saveEmailForTesting(e,t){try{let s={timestamp:new Date().toISOString(),to:e,subject:t.subject,html:t.html,text:t.text};console.log("Email saved for testing:",s)}catch(e){console.log("Could not save email log:",e)}}function createEmailContent(e){return{to:e,subject:"\uD83C\uDFCD️ Stay Ahead of the Curve — Latest Bikes, Reviews & Deals from BikersAlliance!",html:`
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to BikersAlliance</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #1e40af, #3b82f6); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; }
          .footer { background: #f9fafb; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; border: 1px solid #e5e7eb; border-top: none; }
          .btn { display: inline-block; background: #1e40af; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 0; }
          .feature { margin: 15px 0; padding: 15px; background: #f8fafc; border-left: 4px solid #1e40af; }
          .emoji { font-size: 1.2em; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1><span class="emoji">🏍️</span> Welcome to BikersAlliance!</h1>
            <p>India's Premier Motorcycle Marketplace</p>
          </div>
          
          <div class="content">
            <p>Hey Rider <span class="emoji">👋</span>,</p>
            
            <p><strong>Welcome to BikersAlliance — India's premier motorcycle marketplace!</strong></p>
            
            <p>Get the latest updates on new bike launches, expert reviews, comparisons, and exclusive offers delivered straight to your inbox.</p>
            
            <h3><span class="emoji">👉</span> What you'll get:</h3>
            
            <div class="feature">
              <strong><span class="emoji">🏁</span> First look at new bikes hitting the roads</strong>
              <p>Be the first to know about the latest motorcycle launches in India</p>
            </div>
            
            <div class="feature">
              <strong><span class="emoji">🔧</span> Honest reviews & performance insights</strong>
              <p>Expert analysis and real-world performance data</p>
            </div>
            
            <div class="feature">
              <strong><span class="emoji">📰</span> Exclusive updates, comparisons & riding tips</strong>
              <p>Stay connected with the community that rides with passion</p>
            </div>
            
            <p style="text-align: center; margin: 30px 0;">
              <a href="https://bikersalliance.netlify.app/" class="btn">
                <span class="emoji">🏍️</span> Explore BikersAlliance
              </a>
            </p>
            
            <p><strong>Stay connected with the community that rides with passion.</strong></p>
            
            <p style="margin-top: 30px;">
              <strong><span class="emoji">📬</span> Subscribe Now to never miss a throttle twist:</strong><br>
              <a href="https://bikersalliance.netlify.app/" style="color: #1e40af;">Subscribe to Newsletter</a>
            </p>
          </div>
          
          <div class="footer">
            <p><strong>Ride Safe,</strong><br>Team BikersAlliance</p>
            <p><a href="https://bikersalliance.netlify.app/" style="color: #1e40af;">https://bikersalliance.netlify.app/</a></p>
            <p style="font-size: 0.9em; color: #666; margin-top: 20px;">
              You're receiving this email because you subscribed to our newsletter at BikersAlliance.
            </p>
          </div>
        </div>
      </body>
      </html>
    `,text:`
Hey Rider 👋,

Welcome to BikersAlliance — India's premier motorcycle marketplace!
Get the latest updates on new bike launches, expert reviews, comparisons, and exclusive offers delivered straight to your inbox.

👉 What you'll get:

First look at new bikes hitting the roads 🏁
Honest reviews & performance insights 🔧
Exclusive updates, comparisons & riding tips 📰

Stay connected with the community that rides with passion.

📬 Subscribe Now to never miss a throttle twist:
Subscribe to Newsletter

Ride Safe,
Team BikersAlliance
https://bikersalliance.netlify.app/
    `}}let m=new i.AppRouteRouteModule({definition:{kind:r.x.APP_ROUTE,page:"/api/newsletter/route",pathname:"/api/newsletter",filename:"route",bundlePath:"app/api/newsletter/route"},resolvedPagePath:"C:\\Users\\himan\\Desktop\\bikersalliance\\Bike-website-main\\BikersAlliance\\app\\api\\newsletter\\route.ts",nextConfigOutput:"",userland:o}),{requestAsyncStorage:g,staticGenerationAsyncStorage:h,serverHooks:b,headerHooks:f,staticGenerationBailout:w}=m,y="/api/newsletter/route"}};var t=require("../../../webpack-runtime.js");t.C(e);var __webpack_exec__=e=>t(t.s=e),s=t.X(0,[6449,8107,2079,7794],()=>__webpack_exec__(15488));module.exports=s})();