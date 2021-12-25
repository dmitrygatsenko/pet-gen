import { LightningElement } from 'lwc';

const FIRST_CAT = 'https://www.humanesociety.org/sites/default/files/styles/1240x698/public/2020-07/kitten-510651.jpg?h=f54c7448&itok=ZhplzyJ9';
const SECOND_CAT = 'https://images.unsplash.com/photo-1615789591457-74a63395c990?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxzZWFyY2h8MXx8ZG9tZXN0aWMlMjBjYXR8ZW58MHx8MHx8&w=1000&q=80';

export default class Mainwidget extends LightningElement {
    
    imgURL = FIRST_CAT;

    connectedCallback() {
        setInterval(() => {
            this.changeCat();
        }, 5 * 1000);
    }

    changeCat() {
        if (this.imgURL === FIRST_CAT) {
            this.imgURL = SECOND_CAT;
        }
        else {
            this.imgURL = FIRST_CAT;
        }
    }

}