import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, Output } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { FormField, RecordData } from '../../core/interfaces/workspace';
@Component({
  selector: 'app-entity-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './entity-form.component.html',
  styleUrl: './entity-form.component.css',
})
export class EntityFormComponent implements OnChanges {
  @Input() fields: FormField[] = [];
  @Input() value: RecordData = {};
  @Input() busy = false;
  @Input() submitLabel = 'Save changes';
  @Output() save = new EventEmitter<RecordData>();
  @Output() dismiss = new EventEmitter<void>();
  model: RecordData = {};
  ngOnChanges(): void {
    this.model = { ...this.value };
  }
  file(event: Event, key: string): void {
    this.model[key] = (event.target as HTMLInputElement).files?.[0];
  }
  submit(form: NgForm): void {
    if (form.invalid || this.busy) {
      form.control.markAllAsTouched();
      return;
    }
    const result = { ...this.model };
    for (const field of this.fields) {
      const val = result[field.key];
      if (field.type === 'datetime-local' && val) result[field.key] = new Date(val).toISOString();
      if (field.type === 'time' && val?.length === 5) result[field.key] = `${val}:00`;
      if (field.type === 'roles' && typeof val === 'string')
        result[field.key] = val
          .split(',')
          .map((v: string) => v.trim())
          .filter(Boolean);
      if (val === '') delete result[field.key];
    }
    this.save.emit(result);
  }
}
