"use strict";(()=>{var e={};e.id=6024,e.ids=[6024],e.modules={20399:e=>{e.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},30517:e=>{e.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},25528:e=>{e.exports=require("next/dist\\client\\components\\action-async-storage.external.js")},91877:e=>{e.exports=require("next/dist\\client\\components\\request-async-storage.external.js")},25319:e=>{e.exports=require("next/dist\\client\\components\\static-generation-async-storage.external.js")},13685:e=>{e.exports=require("http")},95687:e=>{e.exports=require("https")},85477:e=>{e.exports=require("punycode")},12781:e=>{e.exports=require("stream")},57310:e=>{e.exports=require("url")},59796:e=>{e.exports=require("zlib")},74010:(e,r,a)=>{a.r(r),a.d(r,{headerHooks:()=>m,originalPathname:()=>_,requestAsyncStorage:()=>l,routeModule:()=>d,serverHooks:()=>p,staticGenerationAsyncStorage:()=>c,staticGenerationBailout:()=>u});var t={};a.r(t),a.d(t,{GET:()=>GET});var n=a(10884),i=a(16132),s=a(9394),o=a(58069);async function GET(e,{params:r}){try{let{slug:a}=r,t=new URL(e.url),n=parseInt(t.searchParams.get("page")||"1"),i=parseInt(t.searchParams.get("limit")||"12"),d=t.searchParams.get("sortBy")||"price",l=t.searchParams.get("sortOrder")||"asc",c=t.searchParams.get("minPrice")?Number(t.searchParams.get("minPrice")):void 0,p=t.searchParams.get("maxPrice")?Number(t.searchParams.get("maxPrice")):void 0,m=(n-1)*i,u=(0,s.lx)(),_=a.split("-").map(e=>e.charAt(0).toUpperCase()+e.slice(1)).join(" "),{data:g,error:b}=await u.from("brands").select("brand_id, brand_name, logo_url, country").ilike("brand_name",`%${_}%`).single();if(b||!g)return(0,o.VR)("Brand not found",404);let x=g.brand_name.trim().replace(/\s+/g," "),h=u.from("variants").select(`
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
      `).eq("brand_id",g.brand_id);void 0!==c&&(h=h.gte("on_road_price",c)),void 0!==p&&(h=h.lte("on_road_price",p)),h=(h=h.order("name"===d?"variant_name":"on_road_price",{ascending:"asc"===l})).range(m,m+i-1);let{data:v,error:P}=await h;if(P)throw P;let{count:k,error:y}=await u.from("variants").select("*",{count:"exact",head:!0}).eq("brand_id",g.brand_id);if(y)throw y;let q=(v||[]).map(e=>{let r=e.url||e.variant_name.toLowerCase().replace(/[^a-z0-9\s-]/g,"").replace(/\s+/g,"-").trim(),a=e.images&&e.images.length>0?e.images[0].url:`/images/bikes/${r||"default"}.avif`;return{variant_id:e.variant_id,variant_name:e.variant_name,on_road_price:e.on_road_price,variant_url:r,brand_name:x,brand_logo:e.brands.logo_url,model_name:e.models.model_name,engine_type:e.specs?.engine_type||"N/A",bike_style:"motorcycle",displacement:e.specs?.displacement||"N/A",peak_power:e.specs?.peak_power||"N/A",city_mileage:e.specs?.city_mileage||"N/A",image_url:a,images:e.images||[]}}),{data:f}=await u.from("models").select("*",{count:"exact",head:!0}).eq("brand_id",g.brand_id),w={id:g.brand_id,name:x,slug:a,logoUrl:g.logo_url,country:g.country,stats:{totalModels:f||0,totalVariants:k||0,priceRange:q.length>0?{min:Math.min(...q.map(e=>e.on_road_price)),max:Math.max(...q.map(e=>e.on_road_price))}:{min:0,max:0}}};return(0,o.Xj)({brand:w,bikes:q,pagination:{totalCount:k,currentPage:n,totalPages:Math.ceil((k||0)/i),limit:i,hasNextPage:n*i<(k||0),hasPrevPage:n>1}})}catch(e){return console.error("Error fetching brand bikes:",e),(0,o.VR)("Failed to fetch brand bikes",500)}}let d=new n.AppRouteRouteModule({definition:{kind:i.x.APP_ROUTE,page:"/api/brands/[slug]/route",pathname:"/api/brands/[slug]",filename:"route",bundlePath:"app/api/brands/[slug]/route"},resolvedPagePath:"C:\\Users\\himan\\Desktop\\bikersalliance\\Bike-website-main\\BikersAlliance\\app\\api\\brands\\[slug]\\route.ts",nextConfigOutput:"",userland:t}),{requestAsyncStorage:l,staticGenerationAsyncStorage:c,serverHooks:p,headerHooks:m,staticGenerationBailout:u}=d,_="/api/brands/[slug]/route"},9394:(e,r,a)=>{a.d(r,{lx:()=>createServerClient});var t=a(21136);a(569);var n=a(24596);let createServerClient=()=>{let e=(0,n.cookies)();return(0,t.e)(e)}}};var r=require("../../../../webpack-runtime.js");r.C(e);var __webpack_exec__=e=>r(r.s=e),a=r.X(0,[657,6449,8107,2079,4280,4596,1136,569,8069],()=>__webpack_exec__(74010));module.exports=a})();