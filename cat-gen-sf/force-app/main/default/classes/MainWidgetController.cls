/**
 * @description       : 
 * @author            : dmitriy.gatsenko@jetbi.com
 * @group             : 
 * @last modified on  : 12-25-2021
 * @last modified by  : dmitriy.gatsenko@jetbi.com
**/
public with sharing class MainWidgetController {
    @AuraEnabled
    public static String getPet(String animal){
        try {
            return '';
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }
}
