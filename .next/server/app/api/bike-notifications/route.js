"use strict";(()=>{var e={};e.id=3225,e.ids=[3225],e.modules={30517:e=>{e.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},90561:(e,i,t)=>{t.r(i),t.d(i,{headerHooks:()=>b,originalPathname:()=>x,requestAsyncStorage:()=>g,routeModule:()=>m,serverHooks:()=>h,staticGenerationAsyncStorage:()=>f,staticGenerationBailout:()=>k});var o={};t.r(o),t.d(o,{POST:()=>POST});var a=t(10884),n=t(16132),s=t(95798),r=t(63178),l=t(86935);let c=process.env.FROM_EMAIL||"onboarding@resend.dev",p=process.env.RESEND_API_KEY,d=p?new l.R(p):null,u=(0,r.eI)("https://csvzysxiuuzcsmpknehi.supabase.co","eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNzdnp5c3hpdXV6Y3NtcGtuZWhpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk4MjQwNzksImV4cCI6MjA3NTQwMDA3OX0.ChDLwTvYmunBmiL_LWZqm4pWq3d2OGyjARWtA3KKZ90");async function POST(e){try{console.log("\uD83D\uDE80 Bike notification API called");let i=await e.json(),{name:t,email:o,bikeData:a}=i;if(console.log("\uD83D\uDCE7 Bike notification request for:",{name:t,email:o,bike:a.name}),!t?.trim()||!o?.trim()||!a?.id)return console.log("❌ Missing required fields"),s.Z.json({error:"Name, email and bike information are required"},{status:400});if(!o.includes("@"))return console.log("❌ Invalid email format:",o),s.Z.json({error:"Please enter a valid email address"},{status:400});try{console.log("\uD83D\uDCBE Saving notification request to database...");let{error:e}=await u.from("bike_notifications").insert([{name:t.trim(),email:o.toLowerCase().trim(),bike_id:a.id,bike_name:a.name,expected_price:a.expectedPrice,expected_launch:a.expectedLaunch,requested_at:new Date().toISOString(),status:"active"}]);e?console.log("⚠️ Note: Bike notifications table not yet created in Supabase:",e.message):console.log("✅ Notification request saved to database")}catch(e){console.log("⚠️ Database storage skipped - table may not exist yet")}console.log("\uD83D\uDCE4 Sending confirmation email...");let n=await sendNotificationEmail(t.trim(),o.toLowerCase().trim(),a);if(n)return console.log("✅ Bike notification request completed successfully"),s.Z.json({message:`Thanks ${t}! We'll notify you when ${a.name} launches.`,success:!0},{status:200});return console.log("❌ Failed to send confirmation email"),s.Z.json({error:"Failed to send confirmation email. Please try again."},{status:500})}catch(e){return console.error("❌ Bike notification error:",e),s.Z.json({error:"Internal server error. Please try again."},{status:500})}}async function sendNotificationEmail(e,i,t){try{let o=createNotificationEmailContent(e,i,t);if(console.log("\uD83D\uDD04 Attempting to send notification email to:",i),console.log("\uD83D\uDCE7 Resend API Key available:",!!d),d)try{console.log("\uD83D\uDCE4 Sending email via Resend...");let t="ghostofficial1322@gmail.com"===i?i:"ghostofficial1322@gmail.com",{data:a,error:n}=await d.emails.send({from:`BikersAlliance <${c}>`,to:[t],subject:o.subject,html:o.html.replace(RegExp(i,"g"),t).replace(RegExp(e,"g"),e),text:o.text.replace(RegExp(i,"g"),t).replace(RegExp(e,"g"),e)});if(!n)return console.log("✅ Notification email sent successfully via Resend!"),console.log("\uD83D\uDCE7 Email ID:",a?.id),console.log("\uD83D\uDCEC Note: In testing mode, email sent to ghostofficial1322@gmail.com"),!0;console.error("❌ Resend error:",n),console.error("Error details:",JSON.stringify(n,null,2))}catch(e){console.error("❌ Resend API error:",e)}else console.log("⚠️ Resend not available - API key missing");let a=await sendViaWebhook(i,o);if(a)return!0;return console.log("\uD83D\uDCE7 Bike Notification Email Ready"),console.log("To:",i),console.log("Subject:",o.subject),console.log("Content preview:",o.text.substring(0,200)+"..."),await saveEmailForTesting(i,o),!0}catch(e){return console.error("❌ Error sending notification email:",e),!1}}async function sendViaWebhook(e,i){try{let t=process.env.EMAIL_WEBHOOK_URL;if(!t)return!1;let o=await fetch(t,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({to:e,subject:i.subject,html:i.html,text:i.text,from:c})});return o.ok}catch(e){return console.log("Webhook email sending failed:",e),!1}}async function saveEmailForTesting(e,i){try{let t={timestamp:new Date().toISOString(),to:e,subject:i.subject,html:i.html,text:i.text};console.log("Bike notification email saved for testing:",t)}catch(e){console.log("Could not save email log:",e)}}function createNotificationEmailContent(e,i,t){return{subject:`🏍️ You're all set! We'll notify you when ${t.name} launches`,html:`
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Bike Launch Notification - BikersAlliance</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #1e40af, #3b82f6); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; }
          .footer { background: #f9fafb; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; border: 1px solid #e5e7eb; border-top: none; }
          .btn { display: inline-block; background: #1e40af; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 0; }
          .bike-card { margin: 20px 0; padding: 20px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; }
          .emoji { font-size: 1.2em; }
          .highlight { background: #fef3c7; padding: 2px 6px; border-radius: 4px; font-weight: 600; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1><span class="emoji">🏍️</span> Launch Notification Set!</h1>
            <p>We'll keep you posted on ${t.name}</p>
          </div>
          
          <div class="content">
            <p>Hey ${e} <span class="emoji">👋</span>,</p>
            
            <p><strong>Great choice! You're now on the notification list for the ${t.name}.</strong></p>
            
            <div class="bike-card">
              <h3><span class="emoji">🏍️</span> ${t.name}</h3>
              ${t.expectedPrice?`<p><strong>Expected Price:</strong> <span class="highlight">₹ ${t.expectedPrice}</span></p>`:""}
              ${t.expectedLaunch?`<p><strong>Expected Launch:</strong> <span class="highlight">${t.expectedLaunch}</span></p>`:""}
            </div>
            
            <h3><span class="emoji">📬</span> What happens next?</h3>
            <p>As soon as ${t.name} is officially launched, we'll send you:</p>
            
            <ul>
              <li><span class="emoji">💰</span> <strong>Official pricing details</strong></li>
              <li><span class="emoji">🔧</span> <strong>Complete specifications</strong></li>
              <li><span class="emoji">🎨</span> <strong>Available colors & variants</strong></li>
              <li><span class="emoji">📍</span> <strong>Nearby dealer information</strong></li>
              <li><span class="emoji">🏁</span> <strong>Test ride booking options</strong></li>
            </ul>
            
            <p><strong>You'll be among the first to know!</strong> <span class="emoji">🚀</span></p>
            
            <p style="text-align: center; margin: 30px 0;">
              <a href="https://bikersalliance.netlify.app/bikes/${t.id}" class="btn">
                <span class="emoji">🔍</span> View More Details
              </a>
            </p>
            
            <p>Meanwhile, check out our other upcoming bikes and latest launches at BikersAlliance!</p>
          </div>
          
          <div class="footer">
            <p><strong>Ride Safe,</strong><br>Team BikersAlliance</p>
            <p><a href="https://bikersalliance.netlify.app/" style="color: #1e40af;">https://bikersalliance.netlify.app/</a></p>
            <p style="font-size: 0.9em; color: #666; margin-top: 20px;">
              You're receiving this because you requested launch notifications for ${t.name} at BikersAlliance.
            </p>
          </div>
        </div>
      </body>
      </html>
    `,text:`
Hey ${e} 👋,

Great choice! You're now on the notification list for the ${t.name}.

🏍️ ${t.name}
${t.expectedPrice?`Expected Price: ₹ ${t.expectedPrice}`:""}
${t.expectedLaunch?`Expected Launch: ${t.expectedLaunch}`:""}

📬 What happens next?

As soon as ${t.name} is officially launched, we'll send you:

💰 Official pricing details
🔧 Complete specifications  
🎨 Available colors & variants
📍 Nearby dealer information
🏁 Test ride booking options

You'll be among the first to know! 🚀

Meanwhile, check out our other upcoming bikes and latest launches at BikersAlliance!

View More Details: https://bikersalliance.netlify.app/bikes/${t.id}

Ride Safe,
Team BikersAlliance
https://bikersalliance.netlify.app/
    `}}let m=new a.AppRouteRouteModule({definition:{kind:n.x.APP_ROUTE,page:"/api/bike-notifications/route",pathname:"/api/bike-notifications",filename:"route",bundlePath:"app/api/bike-notifications/route"},resolvedPagePath:"C:\\Users\\himan\\Desktop\\bikersalliance\\Bike-website-main\\BikersAlliance\\app\\api\\bike-notifications\\route.ts",nextConfigOutput:"",userland:o}),{requestAsyncStorage:g,staticGenerationAsyncStorage:f,serverHooks:h,headerHooks:b,staticGenerationBailout:k}=m,x="/api/bike-notifications/route"}};var i=require("../../../webpack-runtime.js");i.C(e);var __webpack_exec__=e=>i(i.s=e),t=i.X(0,[6449,5798,3178,8341],()=>__webpack_exec__(90561));module.exports=t})();