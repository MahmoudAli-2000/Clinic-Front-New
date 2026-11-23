/* DEMO ONLY: synthetic UI preview. Never deploy this script with a real clinic API. */
(()=>{
const NativeXHR=window.XMLHttpRequest;
let role=sessionStorage.getItem('carepoint-demo-role')||'Admin';
const appearanceDefaults={mode:'light',accent:'#278575',density:'comfortable',corners:'rounded',textSize:'default',font:'system'};
const user=()=>({id:'demo-'+role,fullName:'Demo '+role,email:role.toLowerCase()+'@demo.invalid',isActive:true,emailConfirmed:true,roles:[role],patientId:role==='Patient'?1:null,doctorId:role==='Doctor'?1:null,staffId:role==='Patient'?null:1});
const patient={id:1,firstName:'Salma',lastName:'Hassan',patientNo:'DEMO-1001',phone:'Demo phone',email:'salma@example.invalid',status:'Active'};
const doctor={id:1,staffId:1,fullName:'Dr. Ahmed Fouad',specialtyName:'Cardiology',specialtyId:1,licenseNo:'DEMO-LIC',isActive:true,consultationDurationMinutes:30};
const clinic={id:1,clinicName:'Demo Downtown Clinic',clinicCode:'DEMO',city:'Cairo',isActive:true};
const appointment={id:1,patientId:1,patientName:'Salma Hassan',doctorId:1,doctorName:doctor.fullName,clinicId:1,clinicName:clinic.clinicName,doctorClinicId:1,scheduledStartAtUtc:new Date(Date.now()+86400000).toISOString(),status:'Confirmed',hasReview:false,visitId:1};
const visit={id:1,appointmentId:1,patientId:1,chiefComplaint:'Demo follow-up consultation',doctorNotes:'Synthetic clinical notes for UI preview only.',status:'InProgress',visitStartAtUtc:new Date().toISOString(),vitalSigns:[{id:1,heartRateBpm:72,temperatureC:36.8}],diagnoses:[{id:1,diagnosisName:'Demo follow-up',diagnosisType:'Primary'}]};
function response(url,method,body){const p=new URL(url,location.origin).pathname.toLowerCase();
 if(p.endsWith('/appearance')){const key='demo-appearance-'+role;if(method==='PUT'){sessionStorage.setItem(key,body);return JSON.parse(body);}return JSON.parse(sessionStorage.getItem(key)||'null')||appearanceDefaults;}
 if(p.includes('/auth/'))return p.endsWith('/me')?user():{message:'Demo action only'};
 if(p.includes('unread-count'))return 1;
 if(p.includes('notifications/preferences'))return {allowInApp:true,allowEmail:false,allowSMS:false,allowPush:false,allowWhatsApp:false,appointmentReminders:true,generalUpdates:true};
 if(p.includes('notifications'))return {data:[{id:1,title:'Welcome to the UI preview',message:'All records are synthetic. No real clinic backend is connected.',channel:'InApp',createdAtUtc:new Date().toISOString()}],count:1};
 if(p.includes('schedules/timeoffs'))return [];
 if(p.includes('schedules/availability'))return [{doctorClinicId:1,clinicName:clinic.clinicName,startAtUtc:new Date(Date.now()+86400000).toISOString(),endAtUtc:new Date(Date.now()+88200000).toISOString()}];
 if(p.includes('schedules/doctor'))return [{id:1,doctorClinicId:1,dayOfWeek:1,startTime:'09:00:00',endTime:'17:00:00',slotDurationMinutes:30,isActive:true}];
 if(p.match(/doctors\/\d+\/clinics/))return [{id:1,doctorId:1,clinicId:1,clinicName:clinic.clinicName,isActive:true}];
 if(p.includes('visits/patient'))return [visit];if(p.match(/visits\/\d+$/))return visit;
 if(p.includes('prescriptions'))return [{id:1,visitId:1,status:'Active',issuedAtUtc:new Date().toISOString(),items:[{medicationId:1,medicationName:'Demo medication',dose:'Demo dose',frequency:'Demo schedule',durationDays:3}]}];
 if(p.includes('reviews')&&p.endsWith('/stats'))return {count:1,averageDoctorRating:4.8,averageClinicRating:4.7,averageStaffRating:4.9};if(p.includes('reviews'))return [{id:1,doctorRating:5,comment:'Synthetic feedback used to preview the interface.',isAnonymous:true,reviewedAtUtc:new Date().toISOString()}];
 let data=[];if(p.includes('patients'))data=[patient];if(p.includes('doctors'))data=[doctor];if(p.includes('clinics'))data=[clinic];if(p.includes('appointments'))data=[appointment];if(p.includes('specialties'))data=[{id:1,specialtyName:'Cardiology',description:'Demo specialty',isActive:true}];if(p.includes('medications'))data=[{id:1,genericName:'Demo medication',strength:'Demo strength',isActive:true}];if(p.includes('staffs'))data=[{...patient,employeeNo:'DEMO-EMP',jobTitle:'Demo team',roles:['Nurse']}];if(p.includes('users'))data=[user()];
 return /\/\d+$/.test(p)?data[0]||{}:{data,count:data.length,pageIndex:1,pageSize:10};}
class DemoXHR extends EventTarget{
 constructor(){super();this.upload=new EventTarget();this.readyState=0;this.status=0;this.responseType='';this.withCredentials=false;}
 open(method,url){this.method=method;this.url=url;if(!new URL(url,location.origin).pathname.startsWith('/api/')){this.real=new NativeXHR();this.real.open(method,url);['load','error','abort','timeout','readystatechange'].forEach(t=>this.real.addEventListener(t,()=>{for(const k of ['status','statusText','readyState','response','responseText','responseURL']){try{this[k]=this.real[k]}catch{}}this.dispatchEvent(new Event(t));}));}this.readyState=1;}
 setRequestHeader(k,v){this.real?.setRequestHeader(k,v)}getAllResponseHeaders(){return this.real?this.real.getAllResponseHeaders():'content-type: application/json\r\n'}getResponseHeader(){return 'application/json'}abort(){this.real?.abort()}
 send(body){if(this.real){this.real.responseType=this.responseType;return this.real.send(body);}setTimeout(()=>{this.status=200;this.statusText='OK';this.readyState=4;this.responseURL=this.url;const text=JSON.stringify(response(this.url,this.method,body));this.responseText=text;this.response=this.responseType==='json'?JSON.parse(text):text;this.dispatchEvent(new Event('readystatechange'));this.dispatchEvent(new ProgressEvent('load'));this.dispatchEvent(new ProgressEvent('loadend'));},40);}
}
window.XMLHttpRequest=DemoXHR;
window.addEventListener('DOMContentLoaded',()=>{const bar=document.createElement('div');bar.style='position:fixed;bottom:0;left:0;right:0;z-index:9999;background:#fff2cb;color:#563d10;padding:8px 14px;font:12px Arial;display:flex;align-items:center;justify-content:center;gap:12px;flex-wrap:wrap';const text=document.createElement('strong');text.textContent='UI DEMO ONLY · Synthetic data · No live backend';bar.append(text);const select=document.createElement('select');['Admin','Manager','Receptionist','Doctor','Nurse','Patient'].forEach(value=>{const option=document.createElement('option');option.value=value;option.textContent=value;option.selected=value===role;select.append(option)});select.onchange=()=>{sessionStorage.setItem('carepoint-demo-role',select.value);location.href='/admin/dashboard'};bar.append(select);document.body.append(bar);});
})();
