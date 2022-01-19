import { LightningElement } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import getPet from '@salesforce/apex/MainWidgetController.getPet';
import isRegistered from '@salesforce/apex/MainWidgetController.isRegistered';
import register from '@salesforce/apex/MainWidgetController.register';

export default class Mainwidget extends LightningElement {
    somethingWentWrong = false;
    registerRequired = false;
    successRegistration = false;
    petFetched = false;
    imgURL = '';
    value = '';
    intervalId;
    load = false;

    options = [
        {
            label: 'DOGS',
            value: 'dog'
        },
        {
            label: 'CATS',
            value: 'cat'
        }
    ];

    connectedCallback() {
        this.login();
    }

    async login() {
        const registered = await isRegistered();
        if (!registered) {
            this.registerRequired = true;
            return;
        }
        this.successRegistration = true;
    }

    async submit() {
        const email = this.template.querySelector(".register-email").value;
        const password = this.template.querySelector(".register-password").value;
        let success;
        try {
            success = await register({email, password});
        }
        catch (error) {
            this.showToast('Error', error.message ? error.message : error.body.message, 'error');
            return;
        }
        if (success) {
            this.registerRequired = false;
            this.successRegistration = true;
            this.showToast('Success', 'PET-GEN: Successfully registered', 'success')
        }
        else {
            this.showToast('Error', 'PET-GEN: User with such username already exists or wrong password', 'error')
        }
    }

    disable(event) {
        this.template.querySelector('lightning-radio-group').disabled = true;
        this.value = event.detail.value;
        this.load = true;
        this.intervalId = setInterval(() => {
            this.getPet(this.value);
        }, 5 * 1000);
    }

    async getPet(pet) {
        try {
            this.imgURL = await getPet({pet});
        }
        catch (error) {
            this.showToast('Error', error.message ? error.message : error.body.message, 'error');
            return;
        }
        this.successRegistration = false;
        this.petFetched = true;
        this.load = false;
    }

    disconnectedCallback() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
        }
    }

    showToast(title, message, variant) {
        const toastEvt = new ShowToastEvent({
            title: title,
            message: message,
            variant: variant
        });
        this.dispatchEvent(toastEvt);
    }
}