"use strict";(()=>{var e={};e.id=6024,e.ids=[6024,9394],e.modules={20399:e=>{e.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},30517:e=>{e.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},25528:e=>{e.exports=require("next/dist\\client\\components\\action-async-storage.external.js")},91877:e=>{e.exports=require("next/dist\\client\\components\\request-async-storage.external.js")},25319:e=>{e.exports=require("next/dist\\client\\components\\static-generation-async-storage.external.js")},74010:(e,a,r)=>{r.r(a),r.d(a,{headerHooks:()=>_,originalPathname:()=>g,requestAsyncStorage:()=>c,routeModule:()=>l,serverHooks:()=>p,staticGenerationAsyncStorage:()=>m,staticGenerationBailout:()=>u});var t={};r.r(t),r.d(t,{GET:()=>GET});var n=r(10884),i=r(16132),s=r(9394),o=r(58069),d=r(9755);async function GET(e,{params:a}){try{let{slug:r}=a,t=new URL(e.url),n=parseInt(t.searchParams.get("page")||"1"),i=parseInt(t.searchParams.get("limit")||"12"),l=t.searchParams.get("sortBy")||"price",c=t.searchParams.get("sortOrder")||"asc",m=t.searchParams.get("minPrice")?Number(t.searchParams.get("minPrice")):void 0,p=t.searchParams.get("maxPrice")?Number(t.searchParams.get("maxPrice")):void 0,_=(n-1)*i,u=(0,s.lx)(),g=r.split("-").map(e=>e.charAt(0).toUpperCase()+e.slice(1)).join(" "),{data:b,error:x}=await u.from("brands").select("brand_id, brand_name, logo_url, country").ilike("brand_name",`%${g}%`).single();if(x||!b)return(0,o.VR)("Brand not found",404);let v=b.brand_name.trim().replace(/\s+/g," "),h=u.from("variants").select(`
        variant_id,
        variant_name,
        on_road_price,
        url,
        model_id,
        brand_id,
        models!inner(
          model_name
        ),
        brands!inner(
          brand_name,
          logo_url
        ),
        specs(
          displacement,
          peak_power,
          city_mileage,
          engine_type
        ),
        images(
          url,
          alt_text
        )
      `).eq("brand_id",b.brand_id);void 0!==m&&(h=h.gte("on_road_price",m)),void 0!==p&&(h=h.lte("on_road_price",p)),h=(h=h.order("name"===l?"variant_name":"on_road_price",{ascending:"asc"===c})).range(_,_+i-1);let{data:P,error:k}=await h;if(k)throw k;let{count:y,error:w}=await u.from("variants").select("*",{count:"exact",head:!0}).eq("brand_id",b.brand_id);if(w)throw w;let f=(P||[]).map(e=>{let a=e.brands?.brand_name||v||"Unknown",r=e.models?.model_name||"Unknown",t=e.variant_name||"",n=(0,d.c5)(r,t,a),i=(0,d.Qn)(n),s=e.images&&e.images.length>0?e.images[0].url:`/images/bikes/${i||"default"}.avif`;return{variant_id:e.variant_id,variant_name:e.variant_name,on_road_price:e.on_road_price,variant_url:i,brand_name:v,brand_logo:e.brands.logo_url,model_name:e.models.model_name,engine_type:e.specs?.engine_type||"N/A",bike_style:"motorcycle",displacement:e.specs?.displacement||"N/A",peak_power:e.specs?.peak_power||"N/A",city_mileage:e.specs?.city_mileage||"N/A",image_url:s,images:e.images||[]}}),{data:q}=await u.from("models").select("*",{count:"exact",head:!0}).eq("brand_id",b.brand_id),A={id:b.brand_id,name:v,slug:r,logoUrl:b.logo_url,country:b.country,stats:{totalModels:q||0,totalVariants:y||0,priceRange:f.length>0?{min:Math.min(...f.map(e=>e.on_road_price)),max:Math.max(...f.map(e=>e.on_road_price))}:{min:0,max:0}}};return(0,o.Xj)({brand:A,bikes:f,pagination:{totalCount:y,currentPage:n,totalPages:Math.ceil((y||0)/i),limit:i,hasNextPage:n*i<(y||0),hasPrevPage:n>1}})}catch(e){return console.error("Error fetching brand bikes:",e),(0,o.VR)("Failed to fetch brand bikes",500)}}let l=new n.AppRouteRouteModule({definition:{kind:i.x.APP_ROUTE,page:"/api/brands/[slug]/route",pathname:"/api/brands/[slug]",filename:"route",bundlePath:"app/api/brands/[slug]/route"},resolvedPagePath:"C:\\Users\\himan\\Desktop\\bikersalliance\\Bike-website-main\\BikersAlliance\\app\\api\\brands\\[slug]\\route.ts",nextConfigOutput:"",userland:t}),{requestAsyncStorage:c,staticGenerationAsyncStorage:m,serverHooks:p,headerHooks:_,staticGenerationBailout:u}=l,g="/api/brands/[slug]/route"},9394:(e,a,r)=>{r.d(a,{lx:()=>createServerClient});var t=r(21136);r(569);var n=r(24596);let createServerClient=()=>{let e=(0,n.cookies)();return(0,t.e)(e)}},10884:(e,a,r)=>{e.exports=r(30517)}};var a=require("../../../../webpack-runtime.js");a.C(e);var __webpack_exec__=e=>a(a.s=e),r=a.X(0,[657,6449,5798,3178,4596,4280,2170,8069,9755],()=>__webpack_exec__(74010));module.exports=r})();