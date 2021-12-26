import { LightningElement } from 'lwc';
import getPet from '@salesforce/apex/MainWidgetController.getPet'

const FIRST_CAT = 'https://www.humanesociety.org/sites/default/files/styles/1240x698/public/2020-07/kitten-510651.jpg?h=f54c7448&itok=ZhplzyJ9';
const SECOND_CAT = 'https://images.unsplash.com/photo-1615789591457-74a63395c990?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxzZWFyY2h8MXx8ZG9tZXN0aWMlMjBjYXR8ZW58MHx8MHx8&w=1000&q=80';

export default class Mainwidget extends LightningElement {
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

    disable(event) {
        this.template.querySelector('lightning-radio-group').disabled = true;
        this.value = event.detail.value;
        this.load = true;
        this.intervalId = setInterval(() => {
            this.getPet(this.value);
        }, 5 * 1000);
    }

    async getPet(pet) {
        this.imgURL = await getPet({pet});
        this.petFetched = true;
        this.load = false;
    }

    disconnectedCallback() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
        }
    }
}