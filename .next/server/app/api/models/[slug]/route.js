"use strict";(()=>{var e={};e.id=289,e.ids=[289],e.modules={517:e=>{e.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},3685:e=>{e.exports=require("http")},5687:e=>{e.exports=require("https")},5477:e=>{e.exports=require("punycode")},2781:e=>{e.exports=require("stream")},7310:e=>{e.exports=require("url")},9796:e=>{e.exports=require("zlib")},4784:(e,r,a)=>{a.r(r),a.d(r,{headerHooks:()=>c,originalPathname:()=>p,requestAsyncStorage:()=>s,routeModule:()=>l,serverHooks:()=>u,staticGenerationAsyncStorage:()=>m,staticGenerationBailout:()=>_});var t={};a.r(t),a.d(t,{GET:()=>GET});var i=a(884),o=a(6132),n=a(5639),d=a(8069);async function GET(e,r){try{let{slug:a}=r.params,t=(0,n.e)(),i=new URL(e.url);i.searchParams.get("cityId");let{data:o,error:l}=await t.from("models").select(`
        model_id,
        model_name,
        brand_id
      `).eq("model_name",a).single();if(l||!o)return(0,d.aX)("Model not found");let{data:s,error:m}=await t.from("brands").select("brand_id, brand_name, logo_url").eq("brand_id",o.brand_id).single();m&&console.error("Error fetching brand:",m);let{data:u,error:c}=await t.from("variants").select(`
        variant_id,
        variant_name,
        on_road_price,
        created_at
      `).eq("model_id",o.model_id);c&&console.error("Error fetching variants:",c);let{data:_,error:p}=await t.from("models").select(`
        model_id,
        model_name,
        brand_id,
        brands!inner(
          brand_name
        )
      `).eq("brand_id",o.brand_id).neq("model_id",o.model_id).limit(4);return p&&console.error("Error fetching similar models:",p),(0,d.Xj)({model:{id:o.model_id,name:o.model_name,slug:o.model_name,brand:s?{id:s.brand_id,name:s.brand_name,logoUrl:s.logo_url}:null,variants:u||[],rating:{average:null,count:0}},similarModels:_||[]})}catch(e){return console.error("Error fetching model details:",e),(0,d.VR)("Failed to fetch model details",500)}}let l=new i.AppRouteRouteModule({definition:{kind:o.x.APP_ROUTE,page:"/api/models/[slug]/route",pathname:"/api/models/[slug]",filename:"route",bundlePath:"app/api/models/[slug]/route"},resolvedPagePath:"C:\\Users\\himan\\Desktop\\bikersalliance\\Bike-website-main\\BikersAlliance\\app\\api\\models\\[slug]\\route.ts",nextConfigOutput:"",userland:t}),{requestAsyncStorage:s,staticGenerationAsyncStorage:m,serverHooks:u,headerHooks:c,staticGenerationBailout:_}=l,p="/api/models/[slug]/route"},6132:(e,r)=>{var a;Object.defineProperty(r,"x",{enumerable:!0,get:function(){return a}}),function(e){e.PAGES="PAGES",e.PAGES_API="PAGES_API",e.APP_PAGE="APP_PAGE",e.APP_ROUTE="APP_ROUTE"}(a||(a={}))},5639:(e,r,a)=>{a.d(r,{e:()=>createClient});var t=a(1201);let createClient=()=>(0,t.createBrowserClient)("https://csvzysxiuuzcsmpknehi.supabase.co","eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNzdnp5c3hpdXV6Y3NtcGtuZWhpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk4MjQwNzksImV4cCI6MjA3NTQwMDA3OX0.ChDLwTvYmunBmiL_LWZqm4pWq3d2OGyjARWtA3KKZ90")}};var r=require("../../../../webpack-runtime.js");r.C(e);var __webpack_exec__=e=>r(r.s=e),a=r.X(0,[449,606,69],()=>__webpack_exec__(4784));module.exports=a})();