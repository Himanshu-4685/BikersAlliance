"use strict";(()=>{var e={};e.id=7289,e.ids=[7289,9394],e.modules={20399:e=>{e.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},30517:e=>{e.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},25528:e=>{e.exports=require("next/dist\\client\\components\\action-async-storage.external.js")},91877:e=>{e.exports=require("next/dist\\client\\components\\request-async-storage.external.js")},25319:e=>{e.exports=require("next/dist\\client\\components\\static-generation-async-storage.external.js")},94784:(e,a,r)=>{r.r(a),r.d(a,{headerHooks:()=>g,originalPathname:()=>u,requestAsyncStorage:()=>d,routeModule:()=>s,serverHooks:()=>c,staticGenerationAsyncStorage:()=>m,staticGenerationBailout:()=>_});var t={};r.r(t),r.d(t,{GET:()=>GET});var i=r(10884),n=r(16132),o=r(9394),l=r(58069);async function GET(e,a){try{let{slug:e}=a.params,r=(0,o.lx)(),t=null,i=e.replace(/-/g," ").replace(/\b\w/g,e=>e.toUpperCase()),n=e.replace(/-/g," ").toLowerCase(),{data:s,error:d}=await r.from("variants").select(`
        variant_id,
        variant_name,
        on_road_price,
        model_id,
        brand_id,
        models!inner(model_name),
        brands!inner(
          brand_name,
          logo_url,
          description,
          country
        )
      `).or(`variant_name.ilike.%${i}%,variant_name.ilike.%${n}%,variant_name.ilike.%${e}%`).limit(1);if(d||!s||0===s.length)return(0,l.aX)("Model not found");(t=s[0]).models;let m=t.brands,{data:c}=await r.from("variants").select(`
        variant_id,
        variant_name,
        on_road_price,
        created_at
      `).eq("model_id",t.model_id).order("on_road_price",{ascending:!0}),g=[],{data:_}=await r.from("specs").select("*").eq("variant_id",t.variant_id).single();_&&(g=[{name:"Engine Type",value:_.engine_type||"N/A",category:"engine"},{name:"Displacement",value:_.displacement||"N/A",category:"engine"},{name:"Max Power",value:_.peak_power||"N/A",category:"engine"},{name:"Max Torque",value:_.max_torque||"N/A",category:"engine"},{name:"City Mileage",value:_.city_mileage||"N/A",category:"mileage"},{name:"Highway Mileage",value:_.highway_mileage||"N/A",category:"mileage"},{name:"Body Type",value:_.body_type||"N/A",category:"dimensions"},{name:"Transmission",value:_.transmission||"N/A",category:"transmission"}].filter(e=>"N/A"!==e.value&&null!==e.value));let u=[],p=c?c.map(e=>e.variant_id):[t.variant_id],{data:v}=await r.from("images").select("image_id, url, alt_text").in("variant_id",p).limit(5);v&&v.length>0&&(u=v.map(e=>({id:e.image_id.toString(),url:e.url,alt:e.alt_text||`${t.variant_name} image`})));let y=[],x={average:0,count:0},{data:b}=await r.from("reviews").select(`
        review_id,
        rating,
        title,
        body,
        created_at,
        users!inner(
          full_name
        )
      `).in("variant_id",p).order("created_at",{ascending:!1}).limit(5);if(b&&b.length>0){y=b.map(e=>({id:e.review_id.toString(),title:e.title||"User Review",content:e.body||"",rating:e.rating,createdAt:e.created_at,user:{name:e.users?.full_name||"Anonymous",image:null}}));let e=b.reduce((e,a)=>e+a.rating,0);x={average:Math.round(e/b.length*10)/10,count:b.length}}let{data:h}=await r.from("variants").select(`
        variant_id,
        variant_name,
        on_road_price,
        models!inner(model_name),
        images(url)
      `).eq("brand_id",t.brand_id).neq("variant_id",t.variant_id).limit(6),w=h?.map(e=>({id:e.variant_id.toString(),name:e.variant_name,slug:e.variant_name.toLowerCase().replace(/[^a-z0-9]/g,"-").replace(/-+/g,"-"),image:e.images?.[0]?.url||"/images/placeholder-bike.jpg",price:e.on_road_price||0,brand:{name:m.brand_name,slug:m.brand_name.toLowerCase().replace(/[^a-z0-9]/g,"-").replace(/-+/g,"-")}}))||[];return(0,l.Xj)({model:{id:t.variant_id.toString(),name:t.variant_name,slug:t.variant_name.toLowerCase().replace(/[^a-z0-9]/g,"-").replace(/-+/g,"-"),description:m.description||`The ${t.variant_name} is a premium motorcycle from ${m.brand_name}, offering exceptional performance and style.`,launchDate:t.created_at||null,brand:{id:t.brand_id,name:m.brand_name,slug:m.brand_name.toLowerCase().replace(/[^a-z0-9]/g,"-").replace(/-+/g,"-"),logo:m.logo_url,country:m.country},category:null,images:u.length>0?u:[{id:"placeholder",url:"/images/placeholder-bike.jpg",alt:`${t.variant_name} placeholder image`}],variants:(c||[]).map(e=>({id:e.variant_id.toString(),name:e.variant_name,price:e.on_road_price||0})),specifications:g,features:[],rating:x,reviews:y},similarModels:w})}catch(e){return console.error("Error fetching model details:",e),(0,l.VR)("Failed to fetch model details",500)}}let s=new i.AppRouteRouteModule({definition:{kind:n.x.APP_ROUTE,page:"/api/models/[slug]/route",pathname:"/api/models/[slug]",filename:"route",bundlePath:"app/api/models/[slug]/route"},resolvedPagePath:"C:\\Users\\himan\\Desktop\\bikersalliance\\Bike-website-main\\BikersAlliance\\app\\api\\models\\[slug]\\route.ts",nextConfigOutput:"",userland:t}),{requestAsyncStorage:d,staticGenerationAsyncStorage:m,serverHooks:c,headerHooks:g,staticGenerationBailout:_}=s,u="/api/models/[slug]/route"},9394:(e,a,r)=>{r.d(a,{lx:()=>createServerClient});var t=r(21136);r(569);var i=r(24596);let createServerClient=()=>{let e=(0,i.cookies)();return(0,t.e)(e)}},10884:(e,a,r)=>{e.exports=r(30517)}};var a=require("../../../../webpack-runtime.js");a.C(e);var __webpack_exec__=e=>a(a.s=e),r=a.X(0,[657,6449,5798,3178,4596,4280,2170,8069],()=>__webpack_exec__(94784));module.exports=r})();