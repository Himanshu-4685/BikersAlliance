"use strict";(()=>{var e={};e.id=9865,e.ids=[9865],e.modules={30517:e=>{e.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},6624:(e,t,r)=>{r.r(t),r.d(t,{headerHooks:()=>m,originalPathname:()=>v,requestAsyncStorage:()=>c,routeModule:()=>l,serverHooks:()=>p,staticGenerationAsyncStorage:()=>_,staticGenerationBailout:()=>g});var s={};r.r(s),r.d(s,{DELETE:()=>DELETE,GET:()=>GET,PUT:()=>PUT});var a=r(10884),n=r(16132),i=r(95798),u=r(63178);let o=process.env.SUPABASE_SERVICE_ROLE_KEY,d=(0,u.eI)("https://csvzysxiuuzcsmpknehi.supabase.co",o);async function PUT(e,{params:t}){try{let r=await e.json(),s=parseInt(t.id);if(isNaN(s))return i.Z.json({error:"Invalid status ID"},{status:400});let{brand_id:a,model_id:n,variant_id:u,status:o,price_range:l,expected_launch:c,launch_date:_}=r;if(!a||!n||!u||!o||!l)return i.Z.json({error:"Missing required fields"},{status:400});if(!["upcoming","new_launch"].includes(o))return i.Z.json({error:'Invalid status. Must be "upcoming" or "new_launch"'},{status:400});let p={brand_id:a,model_id:n,variant_id:u,status:o,price_range:l,updated_at:new Date().toISOString()};"upcoming"===o&&c&&(p.expected_launch=c,p.launch_date=null),"new_launch"===o&&_&&(p.launch_date=_,p.expected_launch=null);let{data:m,error:g}=await d.from("status").update(p).eq("status_id",s).select().single();if(g)return console.error("Error updating bike status:",g),i.Z.json({error:"Failed to update bike status"},{status:500});if(!m)return i.Z.json({error:"Bike status not found"},{status:404});return i.Z.json({success:!0,data:m,message:"Bike status updated successfully"})}catch(e){return console.error("Unexpected error:",e),i.Z.json({error:"Internal server error"},{status:500})}}async function DELETE(e,{params:t}){try{let e=parseInt(t.id);if(isNaN(e))return i.Z.json({error:"Invalid status ID"},{status:400});let{error:r}=await d.from("status").delete().eq("status_id",e);if(r)return console.error("Error deleting bike status:",r),i.Z.json({error:"Failed to delete bike status"},{status:500});return i.Z.json({success:!0,message:"Bike status deleted successfully"})}catch(e){return console.error("Unexpected error:",e),i.Z.json({error:"Internal server error"},{status:500})}}async function GET(e,{params:t}){try{let e=parseInt(t.id);if(isNaN(e))return i.Z.json({error:"Invalid status ID"},{status:400});let{data:r,error:s}=await d.from("status").select(`
        status_id,
        status,
        price_range,
        expected_launch,
        launch_date,
        brands:brand_id (
          brand_id,
          brand_name,
          logo_url
        ),
        models:model_id (
          model_id,
          model_name
        ),
        variants:variant_id (
          variant_id,
          variant_name,
          on_road_price,
          url,
          images (
            image_id,
            url,
            alt_text
          ),
          specs (
            engine_type,
            displacement,
            peak_power,
            city_mileage,
            highway_mileage,
            body_type,
            transmission,
            max_torque
          )
        )
      `).eq("status_id",e).single();if(s||!r)return i.Z.json({error:"Bike status not found"},{status:404});let a={id:r.status_id,status:r.status,priceRange:r.price_range,expectedLaunch:r.expected_launch,launchDate:r.launch_date,brand:{id:r.brands?.brand_id,name:r.brands?.brand_name,logo:r.brands?.logo_url},model:{id:r.models?.model_id,name:r.models?.model_name},variant:{id:r.variants?.variant_id,name:r.variants?.variant_name,onRoadPrice:r.variants?.on_road_price,slug:r.variants?.url,images:r.variants?.images||[],specs:r.variants?.specs?.[0]||null}};return i.Z.json({success:!0,data:a})}catch(e){return console.error("Unexpected error:",e),i.Z.json({error:"Internal server error"},{status:500})}}let l=new a.AppRouteRouteModule({definition:{kind:n.x.APP_ROUTE,page:"/api/bike-status/[id]/route",pathname:"/api/bike-status/[id]",filename:"route",bundlePath:"app/api/bike-status/[id]/route"},resolvedPagePath:"C:\\Users\\himan\\Desktop\\bikersalliance\\Bike-website-main\\BikersAlliance\\app\\api\\bike-status\\[id]\\route.ts",nextConfigOutput:"",userland:s}),{requestAsyncStorage:c,staticGenerationAsyncStorage:_,serverHooks:p,headerHooks:m,staticGenerationBailout:g}=l,v="/api/bike-status/[id]/route"}};var t=require("../../../../webpack-runtime.js");t.C(e);var __webpack_exec__=e=>t(t.s=e),r=t.X(0,[6449,5798,3178,729],()=>__webpack_exec__(6624));module.exports=r})();