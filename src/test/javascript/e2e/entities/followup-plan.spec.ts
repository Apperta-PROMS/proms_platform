/*-
 * #%L
 * Proms Platform
 * %%
 * Copyright (C) 2017 - 2018 Termlex
 * %%
 * This software is Copyright and Intellectual Property of Termlex Inc Limited.
 * 
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation as version 3 of the
 * License.
 * 
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 * 
 * You should have received a copy of the GNU Affero General Public
 * License along with this program.  If not, see
 * <https://www.gnu.org/licenses/agpl-3.0.en.html>.
 * #L%
 */
import { browser, element, by, $ } from 'protractor';
import { NavBarPage } from './../page-objects/jhi-page-objects';


describe('FollowupPlan e2e test', () => {

    let navBarPage: NavBarPage;
    let followupPlanDialogPage: FollowupPlanDialogPage;
    let followupPlanComponentsPage: FollowupPlanComponentsPage;


    beforeAll(() => {
        browser.get('/');
        browser.waitForAngular();
        navBarPage = new NavBarPage();
        navBarPage.getSignInPage().autoSignInUsing('admin', 'admin');
        browser.waitForAngular();
    });

    it('should load FollowupPlans', () => {
        navBarPage.goToEntity('followup-plan');
        followupPlanComponentsPage = new FollowupPlanComponentsPage();
        expect(followupPlanComponentsPage.getTitle()).toMatch(/Followup Plans/);

    });

    it('should load create FollowupPlan dialog', () => {
        followupPlanComponentsPage.clickOnCreateButton();
        followupPlanDialogPage = new FollowupPlanDialogPage();
        expect(followupPlanDialogPage.getModalTitle()).toMatch(/Create or edit a Followup Plan/);
        followupPlanDialogPage.close();
    });

   /* it('should create and save FollowupPlans', () => {
        followupPlanComponentsPage.clickOnCreateButton();
        followupPlanDialogPage.patientSelectLastOption();
        followupPlanDialogPage.save();
        expect(followupPlanDialogPage.getSaveButton().isPresent()).toBeFalsy();
    }); */

    afterAll(() => {
        navBarPage.autoSignOut();
    });
});

export class FollowupPlanComponentsPage {
    createButton = element(by.css('.jh-create-entity'));
    title = element.all(by.css('jhi-followup-plan div h2 span')).first();

    clickOnCreateButton() {
        return this.createButton.click();
    }

    getTitle() {
        return this.title.getText();
    }
}

export class FollowupPlanDialogPage {
    modalTitle = element(by.css('h4#myFollowupPlanLabel'));
    saveButton = element(by.css('.modal-footer .btn.btn-primary'));
    closeButton = element(by.css('button.close'));
    patientSelect = element(by.css('select#field_patient'));

    getModalTitle() {
        return this.modalTitle.getText();
    }

    patientSelectLastOption = function () {
        this.patientSelect.all(by.tagName('option')).last().click();
    }

    patientSelectOption = function (option) {
        this.patientSelect.sendKeys(option);
    }

    getPatientSelect = function () {
        return this.patientSelect;
    }

    getPatientSelectedOption = function () {
        return this.patientSelect.element(by.css('option:checked')).getText();
    }

    save() {
        this.saveButton.click();
    }

    close() {
        this.closeButton.click();
    }

    getSaveButton() {
        return this.saveButton;
    }
}
