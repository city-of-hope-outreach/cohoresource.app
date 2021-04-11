(function () {
    angular.module('firebase', []).config(($provide) => {
        var firebaseConfig = {
            apiKey: "AIzaSyDactEm5-ZlUghf8NnkhTD8B3dUaAK3jTk",
            authDomain: "cohodatabase.firebaseapp.com",
            databaseURL: "https://cohodatabase.firebaseio.com",
            projectId: "cohodatabase",
            appId: "1:528491597756:web:6666463ffa53c4b42be5b9"
        };
        // Initialize Firebase
        firebase.initializeApp(firebaseConfig);

        // firebase.auth().setPersistence(firebase.auth.Auth.Persistence.NONE);

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

        $provide.value('notSignedIn', ($location) => {
            firebase.auth().onAuthStateChanged((user) => {
                if (user == null) {
                    $location.path('/login');
                }
            });
        });

        $provide.value('loadCategories', (completion = (categories) => {}) => {
            dbRefToList('categories', completion);
        });

        $provide.value('loadCounties', (completion = (counties) => {}) => {
            dbRefToList('counties', completion);
        });

        $provide.value('loadResources', (completion = (resources) => {}) => {
            dbRefToList('resources', completion)
        });

        $provide.value('loadRecentResources', (completion = (resources) => {}) => {
            firebase.database()
                .ref('resources')
                .limitToFirst(10)
                .once("value")
                .then((snapshot) => {
                    const list = [];

                    snapshot.forEach((childSnapshot) => {
                        const item = childSnapshot.val();
                        item.firebasekey = childSnapshot.key;
                        list.push(item);
                    });

                    completion(list);
                });
        });

        $provide.value('uniqueKey', (unit, completion) => {
            let functions = firebase.functions();

            if (location.host.includes("localhost")) {
                functions.useEmulator("localhost", "5001");
            }

            let getUniqueCategoryId = functions.httpsCallable(`uniqueid/${unit}`);
            getUniqueCategoryId({}).then((result) => {
                if (result.data) {
                    completion(result.data.id);
                }
            });
        });

        function dbRefToList(ref, completion) {
            firebase.database()
                .ref(ref)
                .orderByChild('name')
                .once("value")
                .then((snapshot) => {
                    const list = [];

                    snapshot.forEach((childSnapshot) => {
                        const item = childSnapshot.val();
                        item.firebasekey = childSnapshot.key;
                        list.push(item);
                    });

                    completion(list);
                });
        }
    });
})();
