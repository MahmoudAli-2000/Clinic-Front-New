import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, inject, OnDestroy, OnInit, PLATFORM_ID } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { firstValueFrom, Subscription } from 'rxjs';
import { AuthService, CurrentUser } from '../../core/services/auth.service';
import { apiError, WorkspaceApiService } from '../../core/services/workspace-api.service';
import { RESOURCES } from '../../core/auth/resource-config';
import { FormField, RecordData, ResourceConfig } from '../../core/interfaces/workspace';
import { EntityFormComponent } from '../../shared/entity-form/entity-form.component';
@Component({selector:'app-clinic-page',standalone:true,imports:[CommonModule,FormsModule,RouterLink,EntityFormComponent],templateUrl:'./clinic-page.component.html',styleUrl:'./clinic-page.component.css'})
export class ClinicPageComponent implements OnInit, OnDestroy {
  api = inject(WorkspaceApiService); auth = inject(AuthService); route = inject(ActivatedRoute); platform = inject(PLATFORM_ID);
  section = 'appointments'; config: ResourceConfig = RESOURCES['appointments']; user: CurrentUser | null = null;
  rows: RecordData[] = []; total = 0; page = 1; pageSize = 10; search = ''; loading = true; busy = false;
  error = ''; success = ''; modal = false; modalTitle = ''; fields: FormField[] = []; formValue: RecordData = {};
  editing?: number|string; action = ''; actionRow: RecordData = {}; detail: RecordData | null = null;
  doctors: RecordData[] = []; doctorId = 0; statusFilter = ''; dateFilter = ''; slots: RecordData[] = []; availabilityDate = '';
  private sub?: Subscription; private requestVersion = 0;
  async ngOnInit() {
    if (!isPlatformBrowser(this.platform)) { this.loading=false; return; }
    try {
      this.user = await firstValueFrom(this.auth.currentUser());
      this.sub = this.route.data.subscribe(data => {
        this.section = data['section']; this.config = RESOURCES[this.section]; this.page=1; this.search=''; this.statusFilter=''; this.detail=null; this.modal=false; this.slots=[];
        if(this.section==='schedules') this.initSchedules(); else this.load();
      });
    } catch(e) { this.error=apiError(e); this.loading=false; }
  }
  ngOnDestroy() { this.sub?.unsubscribe(); }
  has(...roles:string[]) { return !!this.user?.roles.some(role=>roles.includes(role)); }
  get canWrite() { return this.has(...this.config.writeRoles); }
  get pages() { return Math.max(1,Math.ceil(this.total/this.pageSize)); }
  get rangeStart() {return this.total ? (this.page-1)*this.pageSize+1 : 0;}
  get rangeEnd() {return Math.min(this.page*this.pageSize,this.total);}
  async initSchedules() {
    try {
      const result = await firstValueFrom(this.api.get('Doctors',{pageSize:100})); this.doctors=result.data;
      this.doctorId=this.user?.doctorId || this.doctors[0]?.['id'] || 0; await this.load();
    } catch(e) {this.error=apiError(e);this.loading=false;}
  }
  async load() {
    const version=++this.requestVersion; this.loading=true;this.error='';
    try {
      let result:any;
      if(this.section==='schedules') {
        result=this.doctorId ? await firstValueFrom(this.api.get(`Schedules/doctor/${this.doctorId}`)) : [];
        result={data:result,count:result.length};
      } else {
        const query:RecordData={pageIndex:this.page,pageSize:this.pageSize,search:this.search};
        if(this.section==='appointments') {
          if(this.user?.patientId) query['patientId']=this.user.patientId;
          if(this.user?.doctorId) query['doctorId']=this.user.doctorId;
          if(this.statusFilter) query['status']=this.statusFilter;
          if(this.dateFilter) {query['fromUtc']=new Date(this.dateFilter+'T00:00:00').toISOString();query['toUtc']=new Date(this.dateFilter+'T23:59:59').toISOString();}
        }
        result=await firstValueFrom(this.api.get(this.config.endpoint,query));
      }
      if(version===this.requestVersion) {this.rows=result.data || [];this.total=result.count || 0;}
    } catch(e) {if(version===this.requestVersion) {this.error=apiError(e);this.rows=[];}}
    finally {if(version===this.requestVersion)this.loading=false;}
  }
  filter() {this.page=1;this.load();}
  changePage(direction:number) {this.page+=direction;this.load();}
  display(row:RecordData,key:string):string {
    if(key==='name') return `${row['firstName'] || ''} ${row['lastName'] || ''}`.trim();
    const value=row[key];
    if(Array.isArray(value)) return value.join(', ');
    if(key==='dayOfWeek') return ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'][Number(value)-1] || '-';
    return value===null || value===undefined || value==='' ? '-' : String(value);
  }
  async openForm(row?:RecordData) {
    this.error='';this.action='';this.editing=row?.['id'];this.modalTitle=`${row ? 'Edit' : 'New'} ${this.config.singular}`;this.busy=true;
    try {
      let value:RecordData=row ? (this.section==='schedules' ? {...row} : await firstValueFrom(this.api.get(`${this.config.endpoint}/${row['id']}`))) : {isActive:true,status:'Active',consultationDurationMinutes:30,slotDurationMinutes:30};
      if(this.section==='schedules' && row) value={...row};
      if(value['roles']) value['roles']=value['roles'].join(', ');
      this.fields=await this.resolveFields(this.config.fields.filter(field => !(row && ['staffId','createAccount','password','doctorClinicId'].includes(field.key))));
      for(const field of this.fields) if(['date','datetime-local'].includes(field.type || '') && value[field.key]) {
        const date=new Date(value[field.key]); value[field.key]=field.type==='date' ? date.toISOString().slice(0,10) : this.localDate(date);
      }
      this.formValue=value;this.modal=true;
    } catch(e) {this.error=apiError(e);} finally {this.busy=false;}
  }
  localDate(date:Date) {return new Date(date.getTime()-date.getTimezoneOffset()*60000).toISOString().slice(0,16);}
  async resolveFields(fields:FormField[]):Promise<FormField[]> {
    return Promise.all(fields.map(async field=> {
      if(!field.lookup) return {...field};
      if(field.lookup==='Patients' && !this.has('Admin','Manager','Receptionist'))return {...field,type:'number',lookup:undefined,hint:'Enter the patient ID from their clinic record.'};
      let options:any[]=[];
      if(field.lookup==='assignments') {
        const doctors=await firstValueFrom(this.api.get('Doctors',{pageSize:100}));
        const assignments=await Promise.all(doctors.data.map(async (doctor:RecordData)=> {
          const clinics=await firstValueFrom(this.api.get(`Doctors/${doctor['id']}/clinics`));
          return clinics.filter((c:RecordData)=>c['isActive']).map((c:RecordData)=>({value:c['id'],label:`${doctor['fullName']} / ${c['clinicName']}`}));
        })); options=assignments.flat();
      } else {
        const result=await firstValueFrom(this.api.get(field.lookup,{pageSize:100}));
        options=result.data.map((r:RecordData)=>({value:r['id'],label:r['fullName']||r['clinicName']||r['specialtyName']||r['genericName']||`${r['firstName']} ${r['lastName']}`}));
      }
      return {...field,options};
    }));
  }
  async save(value:RecordData) {
    this.busy=true;this.error='';
    try {
      if(this.action) await this.saveAction(value);
      else await firstValueFrom(this.api.save(this.config.endpoint,value,this.config.multipart,this.editing));
      this.modal=false;this.success='Changes saved successfully.';await this.load();
    }catch(e){this.error=apiError(e);}finally{this.busy=false;}
  }
  async showDetail(row:RecordData) {
    this.error='';this.busy=true;
    try {this.detail=await firstValueFrom(this.api.get(`${this.config.endpoint}/${row['id']}`));}
    catch(e){this.error=apiError(e);}finally{this.busy=false;}
  }
  detailEntries() {return Object.entries(this.detail || {}).filter(([key,val])=>!['id','userId','imageCover'].includes(key) && !Array.isArray(val) && typeof val!=='object');}
  label(key:string) {return key.replace(/([A-Z])/g,' $1').replace(/^./,c=>c.toUpperCase());}
  async openAction(action:string,row:RecordData) {
    this.error='';this.action=action;this.actionRow=row;this.editing=undefined;let fields:FormField[]=[];this.formValue={};
    const field=(key:string,label:string,type='text',required=false):FormField=>({key,label,type,required});
    const select=(key:string,label:string,values:string[]):FormField=>({key,label,type:'select',required:true,options:values.map(value=>({value,label:value}))});
    this.modalTitle=action==='reschedule'?'Reschedule appointment':action==='roles'?'Assign account roles':action==='assignment'?'Assign doctor to clinic':action==='review'?'Share your experience':action==='timeoff'?'Doctor time off':action==='status'?'Update status':`${this.label(action)} appointment`;
    if(action==='reschedule') fields=[field('scheduledStartAtUtc','New start (your local time)','datetime-local',true),field('scheduledEndAtUtc','New end (optional)','datetime-local'),field('notes','Notes','textarea')];
    if(action==='cancel') fields=[field('cancellationReason','Cancellation reason','textarea')];
    if(action==='roles') fields=[{...field('roles','Roles (comma separated)','roles',true),hint:'Admin, Manager, Receptionist, Doctor, Nurse, Patient. This replaces the account roles.'}];
    if(action==='status') fields=[['patients','staff'].includes(this.section)?select('status','Status',['Active','Inactive','Suspended','Deceased']):field('isActive','Active','checkbox')];
    if(action==='assignment') fields=[{key:'clinicId',label:'Clinic',type:'select',required:true,lookup:'Clinics'},field('isPrimaryClinic','Primary clinic','checkbox'),field('consultationFee','Consultation fee','number')];
    if(action==='timeoff') fields=[{key:'doctorId',label:'Doctor',type:'select',required:true,lookup:'Doctors'},{key:'clinicId',label:'Clinic (optional)',type:'select',lookup:'Clinics'},field('startAtUtc','Starts (your local time)','datetime-local',true),field('endAtUtc','Ends (your local time)','datetime-local',true),field('reason','Reason','textarea')];
    if(action==='review') fields=[...['doctorRating','clinicRating','staffRating'].map(key=>({...field(key,this.label(key),'number'),min:1,max:5})),field('comment','Your feedback','textarea'),field('isAnonymous','Submit anonymously','checkbox')];
    if(['confirm','checkin','complete','no-show','start-visit'].includes(action)) this.modalTitle=`${this.label(action)} #${row['id']}`;
    if(action==='start-visit') fields=[field('chiefComplaint','Chief complaint','textarea')];
    this.fields=await this.resolveFields(fields);this.modal=true;
  }
  async saveAction(value:RecordData) {
    const id=this.actionRow['id'];
    if(this.action==='roles') return firstValueFrom(this.api.put(`Users/${id}/roles`,value));
    if(this.action==='assignment') return firstValueFrom(this.api.post('Doctors/clinics',{...value,doctorId:id}));
    if(this.action==='timeoff') return firstValueFrom(this.api.post('Schedules/timeoffs',value));
    if(this.action==='review') return firstValueFrom(this.api.post('Reviews',{...value,appointmentId:id}));
    if(this.action==='start-visit') return firstValueFrom(this.api.post(`Visits/from-appointment/${id}`,value));
    if(this.action==='status') return firstValueFrom(this.api.put(`${this.config.endpoint}/${id}/status`,null,value));
    return firstValueFrom(this.api.put(`Appointments/${id}/${this.action}`,value));
  }
  canAppointment(action:string,row:RecordData) {
    const status=row['status'];const desk=this.has('Admin','Manager','Receptionist');const clinical=this.has('Admin','Manager','Doctor','Nurse');
    if(action==='review') return this.has('Patient') && status==='Completed' && !row['hasReview'];
    if(action==='confirm') return desk && status==='Scheduled';
    if(action==='checkin') return clinical && ['Scheduled','Confirmed'].includes(status);
    if(action==='complete') return clinical && ['CheckedIn','InProgress'].includes(status);
    if(action==='start-visit') return clinical && ['Confirmed','CheckedIn'].includes(status) && !row['visitId'];
    if(action==='no-show') return desk && ['Scheduled','Confirmed','CheckedIn'].includes(status);
    if(action==='reschedule') return this.canWrite && ['Scheduled','Confirmed'].includes(status);
    return this.canWrite && ['Scheduled','Confirmed','CheckedIn','InProgress'].includes(status);
  }
  async remove(row:RecordData) {
    if(!confirm(`Delete this ${this.config.singular}? This cannot be undone.`))return;
    this.busy=true;try{await firstValueFrom(this.api.delete(`${this.config.endpoint}/${row['id']}`));this.success='Record deleted.';await this.load();}catch(e){this.error=apiError(e);}finally{this.busy=false;}
  }
  async availability() {
    if(!this.doctorId || !this.availabilityDate)return;
    this.busy=true;this.error='';try{this.slots=await firstValueFrom(this.api.get('Schedules/availability',{doctorId:this.doctorId,dateUtc:this.availabilityDate}));if(!this.slots.length)this.success='No available slots for this date.';}catch(e){this.error=apiError(e);}finally{this.busy=false;}
  }
  async unassign(id:number){
    if(!confirm('Remove this doctor from the clinic?'))return;
    try{await firstValueFrom(this.api.delete(`Doctors/clinics/${id}`));if(this.detail)await this.showDetail(this.detail);}catch(e){this.error=apiError(e);}
  }
  track(_:number,row:RecordData){return row['id'];}
}
