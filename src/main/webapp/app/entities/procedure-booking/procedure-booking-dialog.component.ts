import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Response } from '@angular/http';

import { Observable } from 'rxjs/Rx';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { JhiEventManager, JhiAlertService } from 'ng-jhipster';
import * as _ from 'underscore';

import { ProcedureBooking } from './procedure-booking.model';
import { ProcedureBookingPopupService } from './procedure-booking-popup.service';
import { ProcedureBookingService } from './procedure-booking.service';
import { HealthcareProviderService } from '../healthcare-provider/healthcare-provider.service';
import { ProcedureService } from '../procedure/procedure.service';
import { UserService } from '../../shared/user/user.service';
import { User } from '../../shared/user/user.model';
import { Patient, PatientService } from '../patient';
import { FollowupPlan, FollowupPlanService } from '../followup-plan';
import { ResponseWrapper } from '../../shared';
import {IOption} from 'ng-select';
import { IMyDate, IMyDateModel, IMyDpOptions } from 'mydatepicker';

@Component({
    selector: 'jhi-procedure-booking-dialog',
    templateUrl: './procedure-booking-dialog.component.html'
})
export class ProcedureBookingDialogComponent implements OnInit {

    procedureBooking: ProcedureBooking;
    hidePatients: boolean;
    isSaving: boolean;
    patientId: string;
    public myDatePickerOptions: IMyDpOptions = {
        dateFormat: 'dd/mm/yyyy',
        minYear: 1850
    };

    patients: Patient[];
    consultants: Array<IOption>;
    locations: Array<IOption>;
    procedures: Array<IOption>;
    proceduresLookup: any;
    selectedScheduledDate: IMyDate;
    selectedPerformedDate: IMyDate;
    followupplans: FollowupPlan[];

    constructor(
        public activeModal: NgbActiveModal,
        private jhiAlertService: JhiAlertService,
        private procedureBookingService: ProcedureBookingService,
        private patientService: PatientService,
        private userService: UserService,
        private healthcareProviderService: HealthcareProviderService,
        private procedureService: ProcedureService,
        private followupPlanService: FollowupPlanService,
        private eventManager: JhiEventManager
    ) {
    }

    ngOnInit() {
        this.isSaving = false;
        if(this.procedureBooking.scheduledDate) {
            let scheduledDate: Date = new Date(this.procedureBooking.scheduledDate);
            this.selectedScheduledDate = {year: scheduledDate.getFullYear(),
                month: scheduledDate.getMonth() + 1,
                day: scheduledDate.getDate()};
        }
        if(this.procedureBooking.performedDate) {
            let performedDate: Date = new Date(this.procedureBooking.performedDate);
            this.selectedPerformedDate = {year: performedDate.getFullYear(),
                month: performedDate.getMonth() + 1,
                day: performedDate.getDate()};
        }
        this.followupPlanService
            .query({filter: 'procedurebooking-is-null'})
            .subscribe((res: ResponseWrapper) => {
                if (!this.procedureBooking.followupPlan || !this.procedureBooking.followupPlan.id) {
                    this.followupplans = res.json;
                } else {
                    this.followupPlanService
                        .find(this.procedureBooking.followupPlan.id)
                        .subscribe((subRes: FollowupPlan) => {
                            this.followupplans = [subRes].concat(res.json);
                        }, (subRes: ResponseWrapper) => this.onError(subRes.json));
                }
            }, (res: ResponseWrapper) => this.onError(res.json));

        // load consultants
        this.userService.consultants()
            .subscribe((res: ResponseWrapper) => {this.consultants = res.json; }, (res: ResponseWrapper) => this.onError(res.json()));
        // load locations
        this.healthcareProviderService.allAsSelectOptions()
            .subscribe((res: ResponseWrapper) => {this.locations = res.json; }, (res: ResponseWrapper) => this.onError(res.json()));
        // load procedures
        this.procedureService.allAsSelectOptions()
            .subscribe((res: ResponseWrapper) => {
                this.procedures = res.json;
                this.proceduresLookup = _.indexBy(res.json, 'value');
            },
            (res: ResponseWrapper) => this.onError(res.json()));
    }

    clear() {
        this.activeModal.dismiss('cancel');
    }

    onScheduledDateChanged(event: IMyDateModel) {
        // Update scheduled date
        this.selectedScheduledDate = event.date;
        this.procedureBooking.scheduledDate = event;
    }

    onPerformedDateChanged(event: IMyDateModel) {
        // Update scheduled date
        this.selectedPerformedDate = event.date;
        this.procedureBooking.performedDate = event;
    }

    onPatientSelected(option: IOption) {
        if(!this.procedureBooking.patient) {
            this.procedureBooking.patient = new Patient();
        }
        this.procedureBooking.patient.id = parseInt(option.value);
    }

    filterInputChanged(event: any) {
        this.patientService.allAsSelectOptions({
            page: 0,
            query: event,
            size: 20})
            .subscribe((res: ResponseWrapper) => { this.patients = res.json; }, (res: ResponseWrapper) => this.onError(res.json));
    }

    save() {
        this.isSaving = true;
        // reassign scheduled and performed dates
        this.procedureBooking.scheduledDate = this.selectedScheduledDate;
        this.procedureBooking.performedDate = this.selectedPerformedDate;
        if (this.procedureBooking.id !== undefined) {
            this.subscribeToSaveResponse(
                this.procedureBookingService.update(this.procedureBooking));
        } else {
            this.subscribeToSaveResponse(
                this.procedureBookingService.create(this.procedureBooking));
        }
    }

    private subscribeToSaveResponse(result: Observable<ProcedureBooking>) {
        result.subscribe((res: ProcedureBooking) =>
            this.onSaveSuccess(res), (res: Response) => this.onSaveError());
    }

    private onSaveSuccess(result: ProcedureBooking) {
        this.eventManager.broadcast({ name: 'procedureBookingListModification', content: 'OK'});
        this.isSaving = false;
        this.activeModal.dismiss(result);
    }

    private onSaveError() {
        this.isSaving = false;
    }

    private onError(error: any) {
        this.jhiAlertService.error(error.message, null, null);
    }

    trackPatientById(index: number, item: Patient) {
        return item.id;
    }

    trackFollowupPlanById(index: number, item: FollowupPlan) {
        return item.id;
    }
}

@Component({
    selector: 'jhi-procedure-booking-popup',
    template: ''
})
export class ProcedureBookingPopupComponent implements OnInit, OnDestroy {

    routeSub: any;

    constructor(
        private route: ActivatedRoute,
        private procedureBookingPopupService: ProcedureBookingPopupService
    ) {}

    ngOnInit() {
        this.routeSub = this.route.params.subscribe((params) => {
            console.log("params  = " , params );
            if ( params['id'] ) {
                this.procedureBookingPopupService
                    .open(ProcedureBookingDialogComponent as Component, params['id'], false);
            }
            else if ( params['patientId'] ) {
                this.procedureBookingPopupService
                    .open(ProcedureBookingDialogComponent as Component, params['patientId'], true);
            } else {
                this.procedureBookingPopupService
                    .open(ProcedureBookingDialogComponent as Component, null, true);
            }
        });
    }

    ngOnDestroy() {
        this.routeSub.unsubscribe();
    }
}
