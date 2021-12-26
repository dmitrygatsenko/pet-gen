/**
 * @description       : 
 * @author            : dmitriy.gatsenko@jetbi.com
 * @group             : 
 * @last modified on  : 12-25-2021
 * @last modified by  : dmitriy.gatsenko@jetbi.com
**/
public with sharing class MainWidgetController {
    @AuraEnabled
    public static String getPet(String pet){
        try {
            HttpRequest req = new HttpRequest();
            req.setMethod('GET');
            req.setEndpoint('https://pets-gen.herokuapp.com/pets/' + pet);
            return (new Http()).send(req).getBody();
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }
}
