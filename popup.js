const ids=["goods","udin","lcNumber","lcDate","importer","vehicles"];
const status=document.getElementById("status");

function getProfile(){
 const p={};
 ids.forEach(id=>p[id]=document.getElementById(id).value.trim());
 return p;
}

chrome.storage.local.get("profile",({profile})=>{
 if(profile) ids.forEach(id=>{
  document.getElementById(id).value=profile[id]||"";
 });
});

document.getElementById("save").onclick=async()=>{
 await chrome.storage.local.set({profile:getProfile()});
 status.textContent="Profile saved locally.";
};

document.getElementById("fill").onclick=async()=>{
 const profile=getProfile();
 await chrome.storage.local.set({profile});
 const [tab]=await chrome.tabs.query({active:true,currentWindow:true});

 if(!tab?.url?.startsWith("https://suvidha-mp.wb.gov.in/exporter-oth/")){
  status.textContent="Open the Suvidha booking page first.";
  return;
 }

 chrome.tabs.sendMessage(tab.id,{
  type:"SUVIDHA_AUTOFILL",profile
 },response=>{
  status.textContent=chrome.runtime.lastError
   ?"Reload the booking page and try again."
   :(response?.message||"Request sent.");
 });
};
