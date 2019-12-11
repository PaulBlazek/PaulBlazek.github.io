dataSave = 'BGAccounts';
accountsProfiles = {};
saidStorageMessage = false;

function register(){
    username = document.getElementById('username').value;
    password = document.getElementById('password').value;
    result = newAccountsProfile(username,password);
    if (typeof result == 'string'){
        alert(result);
    } else {
        accountsProfiles[result.username] = (result);
        saveAccountsData();
        alert("Account Creation Successful!");
    }
}

function login(){
    username = document.getElementById('username').value;
    password = document.getElementById('password').value;
    result = signIn(username,password);
    if (typeof result == 'string'){
        alert(result);
    } else {
        alert("Welcome "+username+"!");
        loggedIn(username);
    }
}

function saveAccountsData() {
    if (typeof(Storage) == "undefined" && !saidStorageMessage) {
        alert('Your web storage does not work, you will not be able to save.');
        saidStorageMessage = true;
    }
    
    localStorage.setItem(dataSave,JSON.stringify(accountsProfiles));
}

function loadAccountsData() {
    if (typeof(Storage) == "undefined" && !saidStorageMessage) {
        alert('Your web storage does not work you will not be able to save.');
        saidStorageMessage = true;
    }
    
    if (!localStorage.getItem(dataSave)) {
        return;
    }
    
    accountsProfiles = JSON.parse(localStorage.getItem(dataSave));
}

function newAccountsProfile(username,password){
    profile = {'username':username,'password':password};
    if (verifyUsername(username)){
        return verifyUsername(username);
    } if (customVerifyPassword(password)){
        return customVerifyPassword(password);
    }
    
    customProfile(profile);
    
    return profile;
}

function customProfile(profile){
    
}; // TEMPLATE

function verifyUsername(username){
    for (var p in accountsProfiles){
        if (accountsProfiles[p].username == username){
            return "Username: "+username+" is already taken by another user.";
        }
    }
}

function customVerifyPassword(password){} // TEMPLATE

function signIn(username,password){
    for (var p in accountsProfiles){
        if (accountsProfiles[p].username == username){
            if (accountsProfiles[p].password == password){
                return accountsProfiles[p];
            } else {
                return "Incorrect Password.";
            }
        }
    }
    return "Username: "+username+" not found.";
}

