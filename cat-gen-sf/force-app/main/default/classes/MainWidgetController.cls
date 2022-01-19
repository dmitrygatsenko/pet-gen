/**
 * @description       : 
 * @author            : dmitriy.gatsenko@jetbi.com
 * @group             : 
 * @last modified on  : 01-19-2022
 * @last modified by  : dmitriy.gatsenko@jetbi.com
**/
public with sharing class MainWidgetController {
    @AuraEnabled
    public static String getPet(String pet){
        try {
            Credentials cred = login();
            HttpResponse res = makeCallout(
                'GET', 
                'https://pets-gen.herokuapp.com/pets/' + pet, 
                null,
                new Map<String, String>{'Authorization' => cred.token}
            );
            Integer statusCode = res.getStatusCode();
            if (statusCode == 200) {
                return res.getBody();
            }
            else if (statusCode == 401 || statusCode == 500) {
                throw new AuraHandledException('PetGen: ' + res.getBody());
            }
            return '';
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }

    @AuraEnabled
    public static Boolean isRegistered(){
        try {
            PetGenCredentials__c settings = PetGenCredentials__c.getOrgDefaults();
            if (settings.Email__c == null) {
                return false;
            }
            return true;
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }

    private static Credentials login() {
        try {
            PetGenCredentials__c settings = PetGenCredentials__c.getOrgDefaults();
            if (settings.lastModifiedDate <= DateTime.now().addHours(-1)) {
                String token = login(settings);
                updateCredentials(settings, token);
            }
            return new Credentials(settings.Email__c, settings.Password__c, settings.Token__c);
            
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }

    private static String login(PetGenCredentials__c settings) {
        HttpResponse res = makeCallout(
            'POST', 
            'https://pets-gen.herokuapp.com/auth/login', 
            createJSON(new Map<String, String>{ 'email' => settings.Email__c, 'password' => settings.Password__c}),
            new Map<String, String>{'Content-Type' => 'application/json'}
        );
        Integer statusCode = res.getStatusCode();
        if (statusCode == 200) {
            return res.getBody();
        }
        else if (statusCode == 500) {
            throw new AuraHandledException('PetGen: ' + res.getBody());
        }
        return null;
    }

    @AuraEnabled
    public static Boolean register(String email, String password) {
        try {
            HttpResponse res = makeCallout(
                'POST', 
                'https://pets-gen.herokuapp.com/auth/register', 
                createJSON(new Map<String, String>{ 'email' => email, 'password' => password}),
                new Map<String, String>{'Content-Type' => 'application/json'}
            );
            Integer statusCode = res.getStatusCode();
            if (statusCode == 201) {
                createCredentials(email, password, res.getBody());
                return true;
            }
            else if (statusCode == 500) {
                
                return false;
            }
            return false;
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }

    private static void createCredentials(String email, String password, String token) {
        PetGenCredentials__c settings = new PetGenCredentials__c();
        settings.Email__c = email;
        settings.Password__c = password;
        settings.Token__c = token;
        insert settings;
    }

    private static void updateCredentials(PetGenCredentials__c settings, String token) {
        settings.Token__c = token;
        update settings;
    }

    private static HttpResponse makeCallout(String method, String endpoint, String body, Map<String, String> headers) {
        HttpRequest req = new HttpRequest();
        req.setMethod(method);
        req.setEndpoint(endpoint);
        if (body != null) {
            req.setBody(body);
        }
        if (headers != null) {
            for (String key : headers.keySet()) {
                req.setHeader(key, headers.get(key));
            }
        }
        return (new Http()).send(req);
    }

    private static String createJSON(Map<String, String> initMap) {
        JSONGenerator gen = JSON.createGenerator(true);
        gen.writeStartObject();
        for (String fieldName : initMap.keySet()) {
            gen.writeStringField(fieldName, initMap.get(fieldName));
        }
        gen.writeEndObject();
        return gen.getAsString();
    }

    private class Credentials {
        public String email;
        public String password;
        public String token;

        public Credentials(String email, String password, String token) {
            this.email = email;
            this.password = password;
            this.token = token;
        }
    }
}
