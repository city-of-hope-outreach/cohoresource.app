(function () {
    angular.module('firebase', []).config(($provide) => {
        var firebaseConfig = {
            apiKey: "AIzaSyC3DxqjrQ-bx1smrhKQF1lBdjfYHKYu7sg",
            authDomain: "cohodatabase.firebaseapp.com",
            databaseURL: "https://cohodatabase.firebaseio.com",
            projectId: "cohodatabase",
            storageBucket: "cohodatabase.appspot.com",
            messagingSenderId: "528491597756",
            appId: "1:528491597756:web:f533cf0a849f06932be5b9"
        };
        // Initialize Firebase
        firebase.initializeApp(firebaseConfig);

        $provide.value('firebase', firebase);
        $provide.value('database', firebase.database());
        $provide.value('auth', firebase.auth());
        $provide.value('snapToList', (snapshot) => {
            const values = [];
            snapshot.forEach((child) => {
                values.push(child.val());
            })
            return values;
        });
    });
})();
