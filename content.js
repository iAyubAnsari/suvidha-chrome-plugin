(()=>{
 if(window.__suvidhaAssistantLoaded)return;
 window.__suvidhaAssistantLoaded=true;

 const norm=s=>(s||"").replace(/\s+/g," ").trim().toLowerCase();

 function findInput(terms){
  return [...document.querySelectorAll("input:not([type=hidden]),textarea")]
   .find(el=>{
    const context=norm([
     el.id,el.name,el.placeholder,el.getAttribute("aria-label"),
     [...(el.labels||[])].map(x=>x.innerText).join(" "),
     el.parentElement?.innerText
    ].join(" "));
    return terms.some(t=>context.includes(t)) &&
     (el.offsetWidth||el.offsetHeight);
   });
 }

 function setValue(el,value){
  if(!el||!value)return false;
  const proto=el instanceof HTMLTextAreaElement
   ?HTMLTextAreaElement.prototype:HTMLInputElement.prototype;
  const setter=Object.getOwnPropertyDescriptor(proto,"value")?.set;
  if(setter)setter.call(el,String(value));
  else el.value=String(value);
  el.dispatchEvent(new Event("input",{bubbles:true}));
  el.dispatchEvent(new Event("change",{bubbles:true}));
  return true;
 }

 function notice(message,error=false){
  let box=document.getElementById("suvidha-assistant-notice");
  if(!box){
   box=document.createElement("div");
   box.id="suvidha-assistant-notice";
   Object.assign(box.style,{
    position:"fixed",right:"15px",bottom:"15px",
    zIndex:"999999",background:"white",padding:"14px",
    border:"2px solid #5b28a5",borderRadius:"8px",
    boxShadow:"0 3px 15px #0003",font:"14px Arial",
    maxWidth:"330px"
   });
   document.body.appendChild(box);
  }
  box.style.borderColor=error?"#c0392b":"#25845b";
  box.textContent=message;
 }

 function fill(p){
  const fields=[
   [["name of the goods","goods name"],p.goods,"Goods"],
   [["udin"],p.udin,"UDIN"],
   [["lc number"],p.lcNumber,"LC number"],
   [["lc date"],p.lcDate,"LC date"],
   [["name of the importer","importer name"],p.importer,"Importer"],
   [["total number of vehicles","number of vehicles"],p.vehicles,"Vehicles"]
  ];

  const filled=[];
  fields.forEach(([terms,value,label])=>{
   if(!value)return;
   const el=findInput(terms);
   if(el&&setValue(el,value))filled.push(label);
  });

  const calculate=[...document.querySelectorAll(
   "button,input[type=button],input[type=submit],a"
  )].find(el=>
   (el.innerText||el.value||"").trim().toLowerCase()==="calculate"
   &&(el.offsetWidth||el.offsetHeight)
  );

  if(calculate){
   calculate.click();
   notice("Autofill complete. Calculate clicked. Wait for the fee to update.");
  }else{
   notice("Autofill complete. Please click Calculate manually.",true);
  }

  const captcha=findInput(["captcha code","captcha"]);
  if(captcha)setTimeout(()=>captcha.focus(),400);

  return filled;
 }

 chrome.runtime.onMessage.addListener((msg,sender,sendResponse)=>{
  if(msg?.type==="SUVIDHA_AUTOFILL"){
   const filled=fill(msg.profile||{});
   sendResponse({message:"Filled: "+(filled.join(", ")||"No matching fields found")});
  }
  return true;
 });

 // Detect visible CAPTCHA feedback; never alter API responses.
 new MutationObserver(()=>{
  const text=norm(document.body?.innerText);
  if(text.includes("captcha code does not match")){
   notice("CAPTCHA failed. Please check and enter it again.",true);
  }
 }).observe(document.body,{subtree:true,childList:true,characterData:true});

})();
